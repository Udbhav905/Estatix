import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: {
        property: {
          include: {
            images: true,
            owner: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites);
    console.log(favorites);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch favorites' });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user!.id,
          propertyId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_propertyId: {
            userId: req.user!.id,
            propertyId,
          },
        },
      });
      return res.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      const fav = await prisma.favorite.create({
        data: {
          userId: req.user!.id,
          propertyId,
        },
      });
      return res.status(201).json({ message: 'Added to favorites', isFavorite: true, favorite: fav });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle favorite' });
  }
};
