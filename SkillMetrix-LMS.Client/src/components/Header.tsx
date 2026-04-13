import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authApi } from "../api/authApi";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("smx_refresh_token") ?? "";
      await authApi.logout(refreshToken);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="font-bold text-lg">
          SkillMetrix
        </Link>

        <input
          placeholder="Tìm khóa học..."
          className="hidden md:block border rounded px-3 py-2 w-96"
        />

        {!user ? (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-2 border rounded">
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-2 bg-indigo-600 text-white rounded"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm">{user.fullName}</span>
            <button onClick={handleLogout} className="px-3 py-2 border rounded">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
