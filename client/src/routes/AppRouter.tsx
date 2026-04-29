/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import { type ComponentType, lazy, Suspense } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PrivateRoute from '@/routes/PrivateRoute';
import RoleRoute from '@/routes/RoleRoute';
import MainLayout from '@/layouts/MainLayout';

import HomePage from '@/features/home/pages/HomePage';
import DashboardHomePage from '@/features/dashboard/pages/DashboardHomePage';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 opacity-40">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}

const Loadable = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => (
    <Suspense fallback={<PageLoader />}>
      <Component {...props} />
    </Suspense>
  );
};

const CoursesPage = Loadable(lazy(() => import('@/features/courses/pages/CoursesPage')));
const CourseDetailPage = Loadable(lazy(() => import('@/features/courses/pages/CourseDetailPage')));
const InstructorCoursesPage = Loadable(lazy(() => import('@/features/courses/pages/InstructorCoursesPage')));
const LoginPage = Loadable(lazy(() => import('@/features/auth/pages/LoginPage')));
const RegisterPage = Loadable(lazy(() => import('@/features/auth/pages/RegisterPage')));
const EnrollmentsPage = Loadable(lazy(() => import('@/features/enrollments/pages/EnrollmentsPage')));
const TransactionsPage = Loadable(lazy(() => import('@/features/transactions/pages/TransactionsPage')));
const InstructorDashboardPage = Loadable(lazy(() => import('@/features/dashboard/pages/InstructorDashboardPage')));
const AdminDashboardPage = Loadable(lazy(() => import('@/features/dashboard/pages/AdminDashboardPage')));
const UsersPage = Loadable(lazy(() => import('@/features/admin/pages/UsersPage')));
const ApprovalsPage = Loadable(lazy(() => import('@/features/admin/pages/ApprovalsPage')));
const SettingsPage = Loadable(lazy(() => import('@/features/admin/pages/SettingsPage')));
const ForbiddenPage = Loadable(lazy(() => import('@/features/home/pages/ForbiddenPage')));
const NotFoundPage = Loadable(lazy(() => import('@/features/home/pages/NotFoundPage')));

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
          {
            element: <RoleRoute allowedRoles={['Instructor', 'Admin']} />,
            children: [
              { index: true, element: <InstructorDashboardPage /> },
              { path: 'instructor', element: <InstructorDashboardPage /> },
              { path: 'instructor/courses', element: <InstructorCoursesPage /> },
            ],
          },
          {
            element: <RoleRoute allowedRoles={['Admin']} />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'admin', element: <AdminDashboardPage /> },
              { path: 'admin/users', element: <UsersPage /> },
              { path: 'admin/approvals', element: <ApprovalsPage /> },
              { path: 'admin/settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);