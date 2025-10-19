import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

export const authenticatePatient = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔐 Patient Auth Middleware: Starting authentication check');
  console.log('🔐 Patient Auth Middleware: Request URL:', req.url);
  console.log('🔐 Patient Auth Middleware: Request method:', req.method);
  
  const authHeader = req.headers.authorization;
  console.log('🔐 Patient Auth Middleware: Auth header present:', !!authHeader);
  console.log('🔐 Patient Auth Middleware: Auth header value:', authHeader ? `${authHeader.substring(0, 20)}...` : 'None');
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🔐 Patient Auth Middleware: Token extracted:', !!token);
  console.log('🔐 Patient Auth Middleware: Token value:', token ? `${token.substring(0, 20)}...` : 'None');

  if (!token) {
    console.log('❌ Patient Auth Middleware: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    console.log('🔐 Patient Auth Middleware: Verifying token...');
    const payload = verifyToken(token);
    console.log('🔐 Patient Auth Middleware: Token verified successfully');
    console.log('🔐 Patient Auth Middleware: Token payload:', {
      patient_id: (payload as any).patient_id,
      email: (payload as any).email,
      full_name: (payload as any).full_name,
      type: (payload as any).type
    });
    
    // Check if this is a patient token
    if ((payload as any).type !== 'patient') {
      console.log('❌ Patient Auth Middleware: Invalid token type:', (payload as any).type);
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Add patient info to request object
    (req as any).patient = {
      patient_id: (payload as any).patient_id,
      email: (payload as any).email,
      full_name: (payload as any).full_name
    };

    console.log('✅ Patient Auth Middleware: Authentication successful, proceeding to next middleware');
    next();
  } catch (error) {
    console.log('❌ Patient Auth Middleware: Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};