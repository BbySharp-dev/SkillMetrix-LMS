import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { Role } from '@/types/auth';

interface RoleRouteProps {
  allowedRoles: Role[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const userRole = useAuthStore((s) => s.user?.role);

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}