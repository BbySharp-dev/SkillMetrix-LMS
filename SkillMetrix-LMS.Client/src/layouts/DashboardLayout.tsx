import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="p-4 md:p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
