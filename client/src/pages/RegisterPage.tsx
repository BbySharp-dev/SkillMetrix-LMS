import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';
import { registerSchema, type RegisterFormValues } from './register.schema';

export default function RegisterPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (values: RegisterFormValues) => {
        // Backend yêu cầu cả confirmPassword trong body register
        const result = await authApi.register(values);
        setAuth(result.accessToken, result.refreshToken, result.user);
        navigate('/dashboard', { replace: true });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center p-4">
            <form className="w-full max-w-md bg-white rounded-2xl p-6 shadow" onSubmit={handleSubmit(onSubmit)}>
                <h1 className="text-2xl font-bold mb-6">Đăng ký</h1>

                <label className="block mb-2">Họ tên</label>
                <input className="w-full border rounded px-3 py-2 mb-1" {...register('fullName')} />
                {errors.fullName && <p className="text-red-500 text-sm mb-3">{errors.fullName.message}</p>}

                <label className="block mb-2">Email</label>
                <input className="w-full border rounded px-3 py-2 mb-1" {...register('email')} />
                {errors.email && <p className="text-red-500 text-sm mb-3">{errors.email.message}</p>}

                <label className="block mb-2">Mật khẩu</label>
                <input type="password" className="w-full border rounded px-3 py-2 mb-1" {...register('password')} />
                {errors.password && <p className="text-red-500 text-sm mb-3">{errors.password.message}</p>}

                <label className="block mb-2">Nhập lại mật khẩu</label>
                <input type="password" className="w-full border rounded px-3 py-2 mb-1" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-red-500 text-sm mb-3">{errors.confirmPassword.message}</p>}

                <button disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded mt-2">
                    {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
                </button>

                <p className="text-sm mt-4">
                    Đã có tài khoản? <Link to="/login" className="text-indigo-600">Đăng nhập</Link>
                </p>
            </form>
        </div>
    );
}