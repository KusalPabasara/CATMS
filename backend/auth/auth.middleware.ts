import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt.util';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded; // Assign token payload to req.user for access
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
