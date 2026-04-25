import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import PrivateRoute from '@/routes/PrivateRoute';
import RoleRoute from '@/routes/RoleRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import DashboardHomePage from '@/pages/dashboard/DashboardHomePage';
import HomePage from '@/pages/HomePage';
import InstructorDashboardPage from '@/pages/dashboard/InstructorDashboardPage';
import AdminDashboardPage from '@/pages/dashboard/AdminDashboardPage';
import CourseDetailPage from "@/pages/CourseDetailPage";
import CoursesPage from "@/pages/CoursesPage";

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <CoursesPage /> },
            { path: 'home', element: <HomePage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
            { path: 'courses', element: <CoursesPage /> },
            { path: 'courses/:id', element: <CourseDetailPage /> },
            { path: '403', element: <ForbiddenPage /> },
        ],
    },
    {
        element: <PrivateRoute />,
        children: [
            {
                path: '/dashboard',
                element: <DashboardLayout />,
                children: [
                    { index: true, element: <DashboardHomePage /> },
                ],
            },
            {
                element: <RoleRoute allowedRoles={['Instructor', 'Admin']} />,
                children: [
                    {
                        path: '/dashboard/instructor',
                        element: <DashboardLayout />,
                        children: [{ index: true, element: <InstructorDashboardPage /> }],
                    },
                ],
            },
            {
                element: <RoleRoute allowedRoles={['Admin']} />,
                children: [
                    {
                        path: '/dashboard/admin',
                        element: <DashboardLayout />,
                        children: [{ index: true, element: <AdminDashboardPage /> }],
                    },
                ],
            },
        ],
    },
]);