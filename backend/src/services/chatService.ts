import { prisma } from '../utils/prisma';
import { notifyUser } from './pushNotificationService';

export const sendMessage = async (senderId: string, receiverId: string, propertyId: string, content: string) => {
  const message = await prisma.message.create({
    data: { content, senderId, receiverId, propertyId },
  });
  // Trigger push notification
  await notifyUser(receiverId, 'New Message', content, { type: 'message', messageId: message.id });
  return message;
};

export const getConversationMessages = async (userId: string, otherUserId: string, propertyId: string) => {
  return await prisma.message.findMany({
    where: {
      propertyId,
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const getConversationList = async (userId: string) => {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: { property: true, sender: true, receiver: true },
    orderBy: { createdAt: 'desc' },
  });
  // Deduplicate conversations
  const conversations = Array.from(
    new Map(
      messages.map((m: any) => [
        `${m.propertyId}-${m.senderId === userId ? m.receiverId : m.senderId}`,
        m,
      ])
    ).values()
  );
  return conversations;
};

export const markMessagesAsRead = async (messageIds: string[], userId: string) => {
  await prisma.message.updateMany({
    where: { id: { in: messageIds }, receiverId: userId },
    data: { isRead: true },
  });
};