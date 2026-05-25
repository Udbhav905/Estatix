import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { notifyUser } from '../services/pushNotificationService';

export const createVisitRequest = async (req: AuthRequest, res: Response) => {
  const { propertyId, date, notes } = req.body;
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return res.status(404).json({ error: 'Property not found' });
  if (property.ownerId === req.user!.id) return res.status(400).json({ error: 'Cannot request visit on your own property' });

  const visit = await prisma.visit.create({
    data: {
      propertyId,
      requesterId: req.user!.id,
      ownerId: property.ownerId,
      date: new Date(date),
      notes,
      status: 'PENDING',
    },
  });
  await notifyUser(property.ownerId, 'New Visit Request', `${req.user!.id} wants to visit your property on ${date}`, { type: 'visit', visitId: visit.id });
  res.status(201).json(visit);
};

export const getMyVisitRequests = async (req: AuthRequest, res: Response) => {
  const visits = await prisma.visit.findMany({
    where: { ownerId: req.user!.id },
    include: { property: true, requester: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(visits);
};

export const getMyVisitBookings = async (req: AuthRequest, res: Response) => {
  const visits = await prisma.visit.findMany({
    where: { requesterId: req.user!.id },
    include: { property: true, owner: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(visits);
};

export const updateVisitStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const visit = await prisma.visit.findUnique({ where: { id: req.params.id  as string} });
  if (!visit) return res.status(404).json({ error: 'Visit not found' });
  if (visit.ownerId !== req.user!.id) return res.status(403).json({ error: 'Unauthorized' });

  const updated = await prisma.visit.update({ where: { id: req.params.id as string }, data: { status } });
  await notifyUser(visit.requesterId, 'Visit Request Updated', `Your visit request is ${status}`, { type: 'visit', visitId: visit.id });
  res.json(updated);
};