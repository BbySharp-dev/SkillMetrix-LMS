import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded px-3 py-2 text-sm",
    isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100",
  ].join(" ");

export default function Sidebar() {
  return (
    <aside className="border-r bg-white p-4">
      <h2 className="font-semibold mb-4">Dashboard</h2>
      <nav className="space-y-2">
        <NavLink to="/dashboard" end className={linkClass}>
          Tổng quan
        </NavLink>
        <NavLink to="/dashboard/instructor" className={linkClass}>
          Instructor
        </NavLink>
        <NavLink to="/dashboard/admin" className={linkClass}>
          Admin
        </NavLink>
      </nav>
    </aside>
  );
}
