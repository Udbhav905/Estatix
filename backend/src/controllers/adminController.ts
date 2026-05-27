import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { PropertyStatus } from '@prisma/client';

export const getPendingProperties = async (req: AuthRequest, res: Response) => {
  const properties = await prisma.property.findMany({
    where: { status: PropertyStatus.PENDING },
    include: { owner: true, images: true },
  });
  res.json(properties);
};

export const approveProperty = async (req: AuthRequest, res: Response) => {
  const property = await prisma.property.update({
    where: { id: req.params.id as string },
    data: { status: PropertyStatus.APPROVED },
  });
  res.json(property);
};

export const rejectProperty = async (req: AuthRequest, res: Response) => {
  const property = await prisma.property.update({
    where: { id: req.params.id as string },
    data: { status: PropertyStatus.REJECTED },
  });
  res.json(property);
};

export const banUser = async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.params.id as string },
    data: { isBanned: true },
  });
  res.json({ message: 'User banned' });
};
// POST /api/reports
export const createReport = async (req: AuthRequest, res: Response) => {
  const { propertyId, reportedUserId, reason } = req.body;
  const reporterId = req?.user?.id;

  if (!reason) return res.status(400).json({ error: 'Reason is required' });
  if (!propertyId && !reportedUserId) {
    return res.status(400).json({ error: 'Either propertyId or reportedUserId is required' });
  }

  const report = await prisma.report.create({
    data: {
      reporterId,
      propertyId: propertyId || null,
      reportedUserId: reportedUserId || null,
      reason,
      status: 'PENDING',
    },
  });
  res.status(201).json(report);
};
export const getReports = async (req: AuthRequest, res: Response) => {
  const reports = await prisma.report.findMany({
    include: { reporter: true, property: true, reportedUser: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reports);
};

export const resolveReport = async (req: AuthRequest, res: Response) => {
  await prisma.report.update({
    where: { id: req.params.id as string },
    data: { status: 'RESOLVED' }, // (string is OK if your schema uses string)
  });
  res.json({ message: 'Report resolved' });
};