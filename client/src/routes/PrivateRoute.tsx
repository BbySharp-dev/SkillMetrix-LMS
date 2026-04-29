import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

export default function PrivateRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isHydrated = useAuthStore((s) => s.isHydrated);
    const location = useLocation();

    // Chưa hydrate xong → không redirect (tránh redirect nhầm khi F5 trên trang dashboard)
    if (!isHydrated) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}