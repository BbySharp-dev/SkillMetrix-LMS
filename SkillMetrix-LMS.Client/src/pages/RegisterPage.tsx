import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../stores/authStore";
import { registerSchema, type RegisterFormValues } from "./register.schema";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await authApi.register(values);
      setAuth(result.accessToken, result.refreshToken, result.user);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      // Bắt lỗi cụ thể từ server (email đã tồn tại, v.v.)
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Đăng ký thất bại, vui lòng thử lại";
      setError("root", { message });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center p-4">
      <form
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Tiêu đề */}
        <h1 className="text-2xl font-bold mb-1">Tạo tài khoản</h1>
        <p className="text-sm text-gray-500 mb-6">
          Bắt đầu học ngay hôm nay, miễn phí.
        </p>

        {/* Lỗi server (email trùng, server lỗi...) */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-3 py-2 mb-4">
            {errors.root.message}
          </div>
        )}

        {/* Họ tên */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">
            Họ và tên
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400
              ${errors.fullName ? "border-red-400" : "border-gray-300"}`}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400
              ${errors.email ? "border-red-400" : "border-gray-300"}`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự, có chữ hoa và số"
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400
              ${errors.password ? "border-red-400" : "border-gray-300"}`}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="confirmPassword"
          >
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400
              ${errors.confirmPassword ? "border-red-400" : "border-gray-300"}`}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Nút submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed
            text-white font-medium py-2 rounded transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Đang tạo tài khoản...
            </span>
          ) : (
            "Tạo tài khoản"
          )}
        </button>

        {/* Link sang trang đăng nhập */}
        <p className="text-sm text-center mt-4 text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
