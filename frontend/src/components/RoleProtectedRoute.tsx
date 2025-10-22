import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user } = useAuthStore();

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the allowed roles
  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
