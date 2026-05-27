import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSocket } from '../../hooks/useSocket';
import { getMessages } from '../../api/chat';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import Animated, { FadeInUp } from 'react-native-reanimated';

// ✅ Define message type
type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  propertyId: string;
};

export default function ChatRoomScreen({ route }: any) {
  const { propertyId, otherUserId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const socket = useSocket();
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();

  // ✅ FIX: initial value null
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    loadMessages();

    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      if (
        msg.propertyId === propertyId &&
        (msg.senderId === otherUserId ||
          msg.receiverId === otherUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('new message', handleNewMessage);

    // ✅ FIX cleanup
    return () => {
      socket.off('new message', handleNewMessage);
    };
  }, [socket, propertyId, otherUserId]);

  const loadMessages = async () => {
    try {
      const res = await getMessages(propertyId, otherUserId);
      setMessages(res.data);
    } catch (err) {
      console.log('Error loading messages', err);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socket?.emit('private message', {
      receiverId: otherUserId,
      propertyId,
      content: newMessage,
    });

    setNewMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 50)}
            style={{
              alignSelf:
                item.senderId === user?.id ? 'flex-end' : 'flex-start',
              margin: 8,
              maxWidth: '80%',
            }}
          >
            <View
              style={{
                backgroundColor:
                  item.senderId === user?.id
                    ? colors.primary
                    : colors.cardBg,
                padding: 12,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color:
                    item.senderId === user?.id ? '#fff' : colors.text,
                }}
              >
                {item.content}
              </Text>
            </View>
          </Animated.View>
        )}
      />

      <View
        style={{
          flexDirection: 'row',
          padding: 10,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.cardBg,
            borderRadius: 25,
            padding: 10,
            color: colors.text,
          }}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={{ marginLeft: 10, justifyContent: 'center' }}
        >
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}