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
import TransactionsPage from '@/features/transactions/pages/TransactionsPage';
import EnrollmentsPage from '@/features/enrollments/pages/EnrollmentsPage';
import UsersPage from '@/features/admin/pages/UsersPage';
import ApprovalsPage from '@/features/admin/pages/ApprovalsPage';
import SettingsPage from '@/features/admin/pages/SettingsPage';
import InstructorCoursesPage from '@/features/courses/pages/InstructorCoursesPage';

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
                    { path: 'my-enrollments', element: <EnrollmentsPage /> },
                    { path: 'my-transactions', element: <TransactionsPage /> },
                ],
            },
            {
                element: <RoleRoute allowedRoles={['Instructor', 'Admin']} />,
                children: [
                    {
                        path: '/dashboard/instructor',
                        element: <DashboardLayout />,
                        children: [
                            { index: true, element: <InstructorDashboardPage /> },
                            { path: 'courses', element: <InstructorCoursesPage /> },
                        ],
                    },
                ],
            },
            {
                element: <RoleRoute allowedRoles={['Admin']} />,
                children: [
                    {
                        path: '/dashboard/admin',
                        element: <DashboardLayout />,
                        children: [
                            { index: true, element: <AdminDashboardPage /> },
                            { path: 'users', element: <UsersPage /> },
                            { path: 'approvals', element: <ApprovalsPage /> },
                            { path: 'settings', element: <SettingsPage /> },
                        ],
                    },
                ],
            },
        ],
    },
]);