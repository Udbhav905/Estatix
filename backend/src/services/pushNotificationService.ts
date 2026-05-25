import { sendPushNotification } from '../config/firebase';
import { prisma } from '../utils/prisma';

export const notifyUser = async (userId: string, title: string, body: string, data?: any) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.fcmToken) await sendPushNotification(user.fcmToken, title, body, data);
  await prisma.notification.create({ data: { userId, title, body, data } });
};