import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { Message } from "@prisma/client";

// -----------------------------
// GET CONVERSATIONS
// -----------------------------
export const getConversations = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const messages: Message[] = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    include: {
      property: true,
      sender: true,
      receiver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const map = new Map<string, Message>();

  for (const m of messages) {
    const otherUserId =
      m.senderId === userId ? m.receiverId : m.senderId;

    const key = `${m.propertyId}-${otherUserId}`;

    if (!map.has(key)) {
      map.set(key, m);
    }
  }

  const conversations = Array.from(map.values());

  res.json(conversations);
};

// -----------------------------
// GET MESSAGES
// -----------------------------
export const getMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const { propertyId, otherUserId } = req.params;

  const messages = await prisma.message.findMany({
    where: {
      propertyId: propertyId as string, // STRING (IMPORTANT - NO Number())
      OR: [
        {
          senderId: userId,
          receiverId: otherUserId as string,
        },
        {
          senderId: otherUserId as string,
          receiverId: userId,
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  res.json(messages);
};

// -----------------------------
// MARK AS READ
// -----------------------------
export const markAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const messageId = req.params.messageId;

  await prisma.message.updateMany({
    where: {
      id: messageId as string,
      receiverId: userId,
    },
    data: {
      isRead: true,
    },
  });

  res.json({ success: true });
};