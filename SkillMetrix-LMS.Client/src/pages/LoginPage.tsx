import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';
import { loginSchema, type LoginFormValues } from './login.schema';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await authApi.login(values);
      setAuth(result.accessToken, result.refreshToken, result.user);

      // Quay lại trang user định vào trước khi bị redirect, mặc định /dashboard
      const from =
        (location.state as { from?: { pathname?: string } } | null)
          ?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    } catch {
      // Hiển thị lỗi từ server (sai mật khẩu, tài khoản không tồn tại...)
      setError('root', { message: 'Email hoặc mật khẩu không chính xác' });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center p-4">
      <form
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Tiêu đề */}
        <h1 className="text-2xl font-bold mb-6">Đăng nhập</h1>

        {/* Lỗi server (sai mật khẩu, tài khoản bị khóa...) */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-3 py-2 mb-4">
            {errors.root.message}
          </div>
        )}

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
              ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Tối thiểu 6 ký tự"
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400
              ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
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
              {/* Spinner đơn giản */}
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Đang đăng nhập...
            </span>
          ) : (
            'Đăng nhập'
          )}
        </button>

        {/* Link sang trang đăng ký */}
        <p className="text-sm text-center mt-4 text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
}