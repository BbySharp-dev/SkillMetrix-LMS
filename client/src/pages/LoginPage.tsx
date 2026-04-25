import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { loginSchema, type LoginFormValues } from '@/pages/login.schema';

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

            const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
            navigate(from ?? '/dashboard', { replace: true });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            setError('root', { message });
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center p-4">
            <form className="w-full max-w-md bg-white rounded-2xl p-6 shadow" onSubmit={handleSubmit(onSubmit)}>
                <h1 className="text-2xl font-bold mb-6">Đăng nhập</h1>

                <label className="block mb-2">Email</label>
                <input className="w-full border rounded px-3 py-2 mb-1" {...register('email')} />
                {errors.email && <p className="text-red-500 text-sm mb-3">{errors.email.message}</p>}

                <label className="block mb-2">Mật khẩu</label>
                <input type="password" className="w-full border rounded px-3 py-2 mb-1" {...register('password')} />
                {errors.password && <p className="text-red-500 text-sm mb-3">{errors.password.message}</p>}

                {errors.root && (
                    <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm border border-red-200">
                        {errors.root.message}
                    </div>
                )}

                <button disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded mt-2">
                    {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>

                <p className="text-sm mt-4">
                    Chưa có tài khoản? <Link to="/register" className="text-indigo-600">Đăng ký</Link>
                </p>
            </form>
        </div>
    );
}