import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead, markAllRead } from '../../api/notification';
import { useTheme } from '../../hooks/useTheme';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/helpers';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, refetch } = useQuery({ queryKey: ['notifications'], queryFn: () => getNotifications().then(res => res.data) });
  const markReadMutation = useMutation({ mutationFn: markNotificationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) });
  const markAllMutation = useMutation({ mutationFn: markAllRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TouchableOpacity style={[styles.markAll, { backgroundColor: colors.cardBg }]} onPress={() => markAllMutation.mutate()}>
        <Text style={{ color: colors.primary }}>Mark all as read</Text>
      </TouchableOpacity>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.item, { backgroundColor: item.isRead ? colors.background : colors.cardBg, borderBottomColor: colors.border }]} onPress={() => !item.isRead && markReadMutation.mutate(item.id)}>
            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{item.body}</Text>
              <Text style={[styles.date, { color: colors.muted }]}>{formatDate(item.createdAt)}</Text>
            </View>
            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        )}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: colors.muted }}>No notifications</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  markAll: { alignSelf: 'flex-end', padding: 8, borderRadius: 20, margin: 16 },
  item: { flexDirection: 'row', padding: 16, borderBottomWidth: 0.5, alignItems: 'center' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  body: { fontSize: 14, marginBottom: 4 },
  date: { fontSize: 12 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 10 },
});