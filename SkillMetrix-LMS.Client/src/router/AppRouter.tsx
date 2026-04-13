import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardHomePage from "../pages/dashboard/DashboardHomePage";
import DashboardLayout from "@/layouts/DashboardLayout";
import MainLayout from "@/layouts/MainLayout";
import ForbiddenPage from "@/pages/ForbiddenPage";

function HomePage() {
  return <div>Home / Courses</div>;
}

function InstructorDashboardPage() {
  return <div>Instructor dashboard</div>;
}

function AdminDashboardPage() {
  return <div>Admin dashboard</div>;
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "403", element: <ForbiddenPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [{ index: true, element: <DashboardHomePage /> }],
      },
      {
        element: <RoleRoute allowedRoles={["Instructor", "Admin"]} />,
        children: [
          {
            path: "/dashboard/instructor",
            element: <DashboardLayout />,
            children: [{ index: true, element: <InstructorDashboardPage /> }],
          },
        ],
      },
      {
        element: <RoleRoute allowedRoles={["Admin"]} />,
        children: [
          {
            path: "/dashboard/admin",
            element: <DashboardLayout />,
            children: [{ index: true, element: <AdminDashboardPage /> }],
          },
        ],
      },
    ],
  },
]);
