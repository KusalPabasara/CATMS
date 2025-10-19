import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const role = user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ 
        error: 'Access denied: insufficient permissions',
        userRole: role,
        allowedRoles: allowedRoles
      });
    }

    next();
  };
};
