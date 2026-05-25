import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getRecommendations } from '../services/recommendationService';
import { prisma } from '../utils/prisma';
import { PropertyStatus } from '@prisma/client';

export const getAIRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const recommendations = await getRecommendations(req.user.id);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Smart matching
export const smartMatch = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { favorites: { include: { property: true } } },
    });

    const categories = user?.favorites.map(f => f.property.category) || [];

    const avgPrice =
      user?.favorites.length
        ? user.favorites.reduce((a, b) => a + b.property.price, 0) / user.favorites.length
        : 100000;

    const matches = await prisma.property.findMany({
      where: {
        ...(categories.length && { category: { in: categories } }),
        price: {
          gte: avgPrice * 0.8,
          lte: avgPrice * 1.2,
        },
        status: PropertyStatus.APPROVED,
        NOT: { ownerId: req.user.id },
      },
      take: 10,
      include: { images: true },
    });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};