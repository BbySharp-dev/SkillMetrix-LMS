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
const QuizTakingPage = Loadable(lazy(() => import('@/features/quizzes/pages/QuizTakingPage')));
const QuizListPage = Loadable(lazy(() => import('@/features/quizzes/pages/QuizListPage').then(m => ({ default: m.QuizListPage }))));
const QuizEditPage = Loadable(lazy(() => import('@/features/quizzes/pages/QuizEditPage')));
const CourseDetailPage = Loadable(lazy(() => import('@/features/courses/pages/CourseDetailPage')));
const InstructorCoursesPage = Loadable(lazy(() => import('@/features/courses/pages/InstructorCoursesPage')));
const CourseEditorPage = Loadable(lazy(() => import('@/features/courses/pages/CourseEditorPage')));
const LoginPage = Loadable(lazy(() => import('@/features/auth/pages/LoginPage')));
const RegisterPage = Loadable(lazy(() => import('@/features/auth/pages/RegisterPage')));
const EnrollmentsPage = Loadable(lazy(() => import('@/features/enrollments/pages/EnrollmentsPage')));
const TransactionsPage = Loadable(lazy(() => import('@/features/transactions/pages/TransactionsPage')));
const UsersPage = Loadable(lazy(() => import('@/features/admin/pages/UsersPage')));
const ApprovalsPage = Loadable(lazy(() => import('@/features/admin/pages/ApprovalsPage')));
const AdminCoursesPage = Loadable(lazy(() => import('@/features/admin/pages/AdminCoursesPage')));
const SettingsPage = Loadable(lazy(() => import('@/features/admin/pages/SettingsPage')));
const ForbiddenPage = Loadable(lazy(() => import('@/features/home/pages/ForbiddenPage')));
const NotFoundPage = Loadable(lazy(() => import('@/features/home/pages/NotFoundPage')));
const LearningPage = Loadable(lazy(() => import('@/features/learning/pages/LearningPage')));
const InstructorDashboardPage = Loadable(lazy(() => import('@/features/dashboard/pages/InstructorDashboardPage')));
const InstructorProfilePage = Loadable(lazy(() => import('@/features/profile/pages/InstructorProfilePage').then(module => ({ default: module.InstructorProfilePage }))));
const StudentProfilePage = Loadable(lazy(() => import('@/features/profile/pages/StudentProfilePage').then(module => ({ default: module.StudentProfilePage }))));

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
      { path: 'learning/:courseId', element: <LearningPage /> },
      { path: 'quiz/:quizId', element: <QuizTakingPage /> },
      { path: 'profile/instructor/:instructorId', element: <InstructorProfilePage /> },
      { path: 'profile/student/:studentId', element: <StudentProfilePage /> },
      { path: '403', element: <ForbiddenPage /> },
    ],
  },

  {
    element: <PrivateRoute />,
    children: [

      {
        element: <RoleRoute allowedRoles={['Student', 'Instructor', 'Admin', 'Moderator']} />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardHomePage /> },
              { path: 'my-enrollments', element: <EnrollmentsPage /> },
              { path: 'my-transactions', element: <TransactionsPage /> },
            ],
          },
        ],
      },


      {
        element: <RoleRoute allowedRoles={['Instructor', 'Admin']} />,
        children: [
          {
            path: 'instructor',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <InstructorDashboardPage /> },
              { path: 'courses', element: <InstructorCoursesPage /> },
              { path: 'courses/:id', element: <CourseEditorPage /> },
              { path: 'quiz/:courseId', element: <QuizListPage /> },
              { path: 'quiz/:quizId/edit', element: <QuizEditPage /> },
              { path: 'my-enrollments', element: <EnrollmentsPage /> },
              { path: 'my-transactions', element: <TransactionsPage /> },
            ],
          },
        ],
      },


      {
        element: <RoleRoute allowedRoles={['Admin']} />,
        children: [
          {
            path: 'admin',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardHomePage /> },
              { path: 'users', element: <UsersPage /> },
              { path: 'approvals', element: <ApprovalsPage /> },
              { path: 'courses', element: <AdminCoursesPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);