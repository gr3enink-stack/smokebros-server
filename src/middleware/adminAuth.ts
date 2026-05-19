import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

// Admin authorization middleware
export const adminAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }
  next();
};
