import { prisma } from '../utils/prisma';

export const checkFraud = async (propertyId: string) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId }, include: { owner: true } });
  if (!property) return;
  const suspicious = property.price < 1000 || (property.area && property.price / property.area < 10);
  if (suspicious) {
    await prisma.property.update({ where: { id: propertyId }, data: { status: 'PENDING' } });
    // Notify admin
  }
};