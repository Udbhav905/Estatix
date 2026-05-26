import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { uploadImage } from '../middleware/upload';

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading avatar for user:', req.user!.id);
    const result = (await uploadImage(req.file)) as any;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar: result.secure_url },
    });

    res.json({
      message: 'Avatar updated successfully',
      avatar: updatedUser.avatar,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error: any) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload avatar' });
  }
};
