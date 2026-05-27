import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyVisitRequests, updateVisitStatus } from '../../api/visit';
import { useTheme } from '../../hooks/useTheme';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

export default function VisitRequestsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['visitRequests'],
    queryFn: () => getMyVisitRequests().then(res => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateVisitStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitRequests'] }),
    onError: () => Alert.alert('Error', 'Failed to update visit status. Please try again.'),
  });

  if (isLoading) return <LoadingSpinner />;

  const handleStatus = (id: string, status: string) => {
    if (updateMutation.isPending) return;
    Alert.alert(
      'Confirm',
      `Mark visit as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => updateMutation.mutate({ id, status }) },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Guard: if property or requester relation was deleted, skip rendering
          if (!item?.property || !item?.requester) return null;

          return (
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.property, { color: colors.text }]}>
                {item.property.title ?? 'Unknown Property'}
              </Text>
              <Text style={[styles.requester, { color: colors.muted }]}>
                Requester: {item.requester.name ?? 'Unknown'}
              </Text>
              <Text style={[styles.date, { color: colors.muted }]}>
                Date: {formatDate(item.date)}
              </Text>
              <Text
                style={[
                  styles.status,
                  { color: item.status === 'PENDING' ? colors.error : colors.success },
                ]}
              >
                Status: {item.status}
              </Text>
              {item.status === 'PENDING' && (
                <View style={styles.buttons}>
                  <TouchableOpacity
                    style={[
                      styles.approve,
                      { backgroundColor: colors.success, opacity: updateMutation.isPending ? 0.6 : 1 },
                    ]}
                    onPress={() => handleStatus(item.id, 'APPROVED')}
                    disabled={updateMutation.isPending}
                  >
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.reject,
                      { backgroundColor: colors.error, opacity: updateMutation.isPending ? 0.6 : 1 },
                    ]}
                    onPress={() => handleStatus(item.id, 'REJECTED')}
                    disabled={updateMutation.isPending}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, color: colors.muted }}>
            No visit requests yet
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 0.5 },
  property: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  requester: { fontSize: 14, marginBottom: 2 },
  date: { fontSize: 12, marginBottom: 2 },
  status: { fontSize: 12, fontWeight: 'bold', marginBottom: 12 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
  approve: { padding: 10, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' },
  reject: { padding: 10, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});