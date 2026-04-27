import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import PrivateRoute from '@/routes/PrivateRoute';
import RoleRoute from '@/routes/RoleRoute';
import ForbiddenPage from '@/features/home/pages/ForbiddenPage';
import DashboardHomePage from '@/features/dashboard/pages/DashboardHomePage';
import HomePage from '@/features/home/pages/HomePage';
import InstructorDashboardPage from '@/features/dashboard/pages/InstructorDashboardPage';
import AdminDashboardPage from '@/features/dashboard/pages/AdminDashboardPage';
import CourseDetailPage from '@/features/courses/pages/CourseDetailPage';
import CoursesPage from '@/features/courses/pages/CoursesPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import MainLayout from '@/layouts/MainLayout';

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