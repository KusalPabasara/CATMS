export interface JwtPayload {
  user_id: number;
  role: string;
  branch_id: number;
  branch_name?: string;
  staff_title?: string;
  email: string;
  full_name?: string;
  iat: number;
  exp: number;
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    // Manual JWT decoding (no external dependencies)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload as JwtPayload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const extractUserFromToken = (token: string) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    user_id: decoded.user_id,
    role: decoded.role,
    branch_id: decoded.branch_id,
    branch_name: decoded.branch_name,
    staff_title: decoded.staff_title,
    email: decoded.email,
    full_name: decoded.full_name
  };
};

