import { prisma } from '../utils/prisma';

export const getRecommendations = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { favorites: { include: { property: true } } },
  });
  const favoriteCategories = user?.favorites.map((f: any) => f.property.category) || [];
  const recommended = await prisma.property.findMany({
    where: { category: { in: favoriteCategories }, status: 'APPROVED', NOT: { ownerId: userId } },
    take: 10,
    include: { images: true },
  });
  return recommended;
};