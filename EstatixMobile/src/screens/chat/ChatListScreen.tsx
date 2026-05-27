import React from 'react';
import { View, FlatList, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '../../api/chat';
import { useTheme } from '../../hooks/useTheme';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';

export default function ChatListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const user = useAuthStore(s => s.user);
  const { data: conversations, isLoading } = useQuery({ queryKey: ['conversations'], queryFn: () => getConversations().then(res => res.data) });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherUser = item.senderId === user?.id ? item.receiver : item.sender;
          return (
            <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('ChatRoomScreen', { propertyId: item.propertyId, otherUserId: otherUser.id, otherUserName: otherUser.name })}>
              <Image source={{ uri: otherUser.avatar || 'https://via.placeholder.com/50' }} style={styles.avatar} />
              <View style={styles.details}>
                <Text style={[styles.name, { color: colors.text }]}>{otherUser.name}</Text>
                <Text style={[styles.lastMsg, { color: colors.muted }]} numberOfLines={1}>{item.content}</Text>
              </View>
              {!item.isRead && item.receiverId === user?.id && <View style={[styles.unread, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', padding: 16, borderBottomWidth: 0.5, alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  lastMsg: { fontSize: 14, marginTop: 4 },
  unread: { width: 10, height: 10, borderRadius: 5 },
});