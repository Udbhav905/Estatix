import { Server as SocketServer } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { sendPushNotification } from './firebase';

let io: SocketServer;

export const initSocket = (server: http.Server) => {
  io = new SocketServer(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);

    socket.on('private message', async (data: { receiverId: string; propertyId: string; content: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: userId,
            receiverId: data.receiverId,
            propertyId: data.propertyId,
          },
        });
        io.to(`user:${data.receiverId}`).emit('new message', message);
        // Send push notification
        const receiver = await prisma.user.findUnique({ where: { id: data.receiverId } });
        if (receiver?.fcmToken) {
          await sendPushNotification(receiver.fcmToken, 'New Message', data.content, { type: 'message', messageId: message.id });
        }
      } catch (error) {
        console.error('Message error:', error);
      }
    });

    socket.on('disconnect', () => {});
  });
};

export const getIO = () => io;