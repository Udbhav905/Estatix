import { prisma } from '../utils/prisma';
import cloudinary from '../config/cloudinary';
import { Prisma, PropertyStatus, PropertyType } from '@prisma/client';

type UploadedFile = Express.Multer.File;

export const createPropertyWithImages = async (
  propertyData: any,
  imageFiles: UploadedFile[],
  ownerId: string
) => {
  const property = await prisma.property.create({
    data: { ...propertyData, ownerId },
  });

  if (imageFiles?.length) {
    const uploads = imageFiles.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { folder: 'properties' });
      return prisma.propertyImage.create({
        data: { url: result.secure_url, publicId: result.public_id, propertyId: property.id },
      });
    });
    await Promise.all(uploads);
  }
  return property;
};

export const getFilteredProperties = async (filters: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: PropertyType;
  category?: string;
  page: number;
  limit: number;
}) => {
  const { search, minPrice, maxPrice, type, category, page, limit } = filters;
  const skip = (page - 1) * limit;
  const where: any = { status: PropertyStatus.APPROVED };
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (minPrice) where.price = { gte: minPrice };
  if (maxPrice) where.price = { lte: maxPrice };
  if (type) where.type = type;
  if (category) where.category = category;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      include: { images: true, owner: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.property.count({ where }),
  ]);
  return { properties, total, page, totalPages: Math.ceil(total / limit) };
};

export const incrementViews = async (propertyId: string) => {
  await prisma.property.update({ where: { id: propertyId }, data: { views: { increment: 1 } } });
};

export const deletePropertyAndImages = async (propertyId: string, userId: string, isAdmin: boolean) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new Error('Property not found');
  if (property.ownerId !== userId && !isAdmin) throw new Error('Unauthorized');
  const images = await prisma.propertyImage.findMany({ where: { propertyId } });
  for (const img of images) await cloudinary.uploader.destroy(img.publicId);
  await prisma.property.delete({ where: { id: propertyId } });
  return true;
};