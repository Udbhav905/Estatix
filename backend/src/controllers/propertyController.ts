import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import cloudinary from '../config/cloudinary';

export const createProperty = async (req: AuthRequest, res: Response) => {
  const { title, description, price, type, category, bedrooms, bathrooms, area, address, city, state, country, latitude, longitude } = req.body;
  const images = req.files as Express.Multer.File[];

  const property = await prisma.property.create({
    data: {
      title, description, price: parseFloat(price), type, category, bedrooms: parseInt(bedrooms), bathrooms: parseInt(bathrooms), area: parseFloat(area),
      address, city, state, country, latitude: latitude ? parseFloat(latitude) : null, longitude: longitude ? parseFloat(longitude) : null,
      ownerId: req.user!.id,
    },
  });

  if (images?.length) {
    const imageUploads = images.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { folder: 'properties' });
      return prisma.propertyImage.create({
        data: { url: result.secure_url, publicId: result.public_id, propertyId: property.id },
      });
    });
    await Promise.all(imageUploads);
  }
  res.status(201).json(property);
};

export const getProperties = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, minPrice, maxPrice, type, category } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: any = { status: 'APPROVED' };
  if (search) where.title = { contains: search as string, mode: 'insensitive' };
  if (minPrice) where.price = { gte: Number(minPrice) };
  if (maxPrice) where.price = { lte: Number(maxPrice) };
  if (type) where.type = type;
  if (category) where.category = category;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({ where, skip, take: Number(limit), include: { images: true, owner: { select: { name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.property.count({ where }),
  ]);
  res.json({ properties, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
};

export const getPropertyById = async (req: Request, res: Response) => {
  const property = await prisma.property.findUnique({ where: { id: req.params.id  as string}, include: { images: true, owner: true } });
  if (!property) return res.status(404).json({ error: 'Property not found' });
  await prisma.property.update({ where: { id: req.params.id as string }, data: { views: { increment: 1 } } });
  res.json(property);
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  const property = await prisma.property.findUnique({ where: { id: req.params.id  as string} });
  if (!property) return res.status(404).json({ error: 'Property not found' });
  if (property.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  const updated = await prisma.property.update({ where: { id: req.params.id  as string}, data: req.body });
  res.json(updated);
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  const property = await prisma.property.findUnique({ where: { id: req.params.id as string } });
  if (!property) return res.status(404).json({ error: 'Property not found' });
  if (property.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  // Delete images from Cloudinary
  const images = await prisma.propertyImage.findMany({ where: { propertyId: req.params.id as string } });
  for (const img of images) await cloudinary.uploader.destroy(img.publicId);
  await prisma.property.delete({ where: { id: req.params.id as string } });
  res.json({ message: 'Deleted' });
};