import { banUser } from '../../api/admin';
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReports, resolveReport } from '../../api/admin';
import { useTheme } from '../../hooks/useTheme';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReportListScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  // ✅ Destructure error as well
  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: () => getReports().then(res => res.data),
  });

  const resolveMutation = useMutation({
    mutationFn: resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      Alert.alert('Resolved', 'Report marked as resolved');
    },
    onError: (err) => {
      Alert.alert('Error', 'Failed to resolve report');
      console.error(err);
    },
  });

// Inside ReportListScreen component
const banMutation = useMutation({
  mutationFn: banUser,
  onSuccess: () => {
    Alert.alert('Banned', 'User has been banned successfully.');
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  },
  onError: (err) => Alert.alert('Error', 'Failed to ban user'),
});


const handleBanUser = (userId: string, userName: string) => {
  Alert.alert('Ban User', `Are you sure you want to ban ${userName}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Ban', style: 'destructive', onPress: () => banMutation.mutate(userId) },
  ]);
};
  // ✅ Check loading
  if (isLoading) return <LoadingSpinner />;

  // ✅ Check error properly
  if (error) {
    console.error('Reports error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.error }}>Failed to load reports.</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: colors.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.header}>
              <Text style={[styles.reason, { color: colors.text }]}>{item.reason}</Text>
              <Text style={[styles.status, { color: item.status === 'PENDING' ? colors.error : colors.success }]}>
                {item.status}
              </Text>
            </View>
            <Text style={[styles.detail, { color: colors.muted }]}>Reported by: {item.reporter?.name}</Text>
            {item.property && <Text style={[styles.detail, { color: colors.muted }]}>Property: {item.property.title}</Text>}
            {item.reportedUser && <Text style={[styles.detail, { color: colors.muted }]}>User: {item.reportedUser.name}</Text>}
            {item.status === 'PENDING' && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.resolveBtn, { flex: 1, backgroundColor: colors.primary }]}
                  onPress={() => resolveMutation.mutate(item.id)}
                >
                  <Text style={styles.btnText}>Resolve</Text>
                </TouchableOpacity>
                {item.reportedUser && (
                  <TouchableOpacity
                    style={[styles.banBtn, { flex: 1, backgroundColor: colors.error, marginLeft: 8 }]}
                    onPress={() => handleBanUser(item.reportedUser.id, item.reportedUser.name)}
                  >
                    <Text style={styles.btnText}>Ban User</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', marginTop: 50 }}>No reports found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 0.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reason: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 12, fontWeight: '600' },
  detail: { fontSize: 14, marginBottom: 4 },
  actionsContainer: { flexDirection: 'row', marginTop: 12 },
  resolveBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  banBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
});