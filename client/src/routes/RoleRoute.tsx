import type {Role} from "../types/auth.ts";
import {useAuthStore} from "../stores/authStore.ts";
import {Navigate, Outlet} from "react-router-dom";

interface RoleRouteProps {
    allowedRoles: Role[];
}

export default function RoleRoute({allowedRoles}: RoleRouteProps) {
    const userRole = useAuthStore((s) => s.user?.role);

    if(!userRole) return <Navigate to="/login" replace/>

    if(!allowedRoles.includes(userRole)) {
        return <Navigate to="/403" replace/>
    }

    return <Outlet/>
}