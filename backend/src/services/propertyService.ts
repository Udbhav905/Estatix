import { prisma } from "../utils/prisma";
import cloudinary from "../config/cloudinary";
import { Prisma, PropertyStatus, PropertyType } from "@prisma/client";

type UploadedFile = Express.Multer.File;

export const createPropertyWithImages = async (propertyData: any, imageFiles: UploadedFile[], ownerId: string) => {
  const property = await prisma.property.create({
    data: { ...propertyData, ownerId },
  });

  if (imageFiles?.length) {
    const uploads = imageFiles.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { folder: "properties" });
      return prisma.propertyImage.create({
        data: { url: result.secure_url, publicId: result.public_id, propertyId: property.id },
      });
    });
    await Promise.all(uploads);
  }
  return property;
};

export const getFilteredProperties = async (filters: { search?: string; minPrice?: number; maxPrice?: number; type?: PropertyType; category?: string; page: number; limit: number }) => {
  const { search, minPrice, maxPrice, type, category, page, limit } = filters;
  const skip = (page - 1) * limit;
  const where: any = { status: PropertyStatus.APPROVED };

  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();
    
    // AI-like smart search: extract keywords and numbers, ignoring common stop words
    const stopWords = ['i', 'want', 'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and', 'or', 'is', 'are', 'my', 'find', 'looking', 'show', 'me', 'some', 'any', 'like', 'house', 'property', 'under', 'around', 'near', 'about', 'just'];
    const words = trimmedSearch.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/).filter(w => w.length > 0);
    const keywords = words.filter(word => !stopWords.includes(word));
    const numbers = words.map(w => parseInt(w, 10)).filter(n => !isNaN(n));
    
    const orConditions: any[] = [];
    
    if (keywords.length > 0) {
      keywords.forEach(word => {
        if (isNaN(Number(word))) {
          orConditions.push({ title: { contains: word, mode: "insensitive" } });
          orConditions.push({ description: { contains: word, mode: "insensitive" } });
          orConditions.push({ city: { contains: word, mode: "insensitive" } });
          orConditions.push({ category: { contains: word, mode: "insensitive" } });
          orConditions.push({ address: { contains: word, mode: "insensitive" } });
        }
      });
    }
    
    if (numbers.length > 0) {
      numbers.forEach(num => {
        // Provide a 20% margin around the requested number for prices
        orConditions.push({ price: { gte: num * 0.8, lte: num * 1.2 } });
        // Also allow matching the number exactly in text fields
        orConditions.push({ title: { contains: num.toString(), mode: "insensitive" } });
        orConditions.push({ description: { contains: num.toString(), mode: "insensitive" } });
      });
    }

    if (orConditions.length > 0) {
      where.OR = orConditions;
    } else {
      where.OR = [
        { title: { contains: trimmedSearch, mode: "insensitive" } },
        { description: { contains: trimmedSearch, mode: "insensitive" } },
        { city: { contains: trimmedSearch, mode: "insensitive" } },
        { category: { contains: trimmedSearch, mode: "insensitive" } }
      ];
    }
  }

  // Apply price range filters (overwrites exact price if both present)
  if (minPrice !== undefined) where.price = { ...(where.price as any), gte: minPrice };
  if (maxPrice !== undefined) where.price = { ...(where.price as any), lte: maxPrice };

  if (type) where.type = type;
  if (category) where.category = category;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      include: { images: true, owner: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
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
  if (!property) throw new Error("Property not found");
  if (property.ownerId !== userId && !isAdmin) throw new Error("Unauthorized");
  const images = await prisma.propertyImage.findMany({ where: { propertyId } });
  for (const img of images) await cloudinary.uploader.destroy(img.publicId);
  await prisma.property.delete({ where: { id: propertyId } });
  return true;
};
