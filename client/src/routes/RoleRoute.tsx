import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '@/features/auth/types';

interface RoleRouteProps {
    allowedRoles: Role[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
    const userRole = useAuthStore((s) => s.user?.role);
    const isHydrated = useAuthStore((s) => s.isHydrated);

    // Chưa hydrate xong → không redirect
    if (!isHydrated) return null;

    if (!userRole) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}