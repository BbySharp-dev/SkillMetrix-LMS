import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogIn, Shield, BookOpen, GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { authApi, type ApiError } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { loginSchema, type LoginFormValues } from '../schemas';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui';
import { Input } from '@/components/ui';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const setAuth = useAuthStore((s) => s.setAuth);

    const handleQuickLogin = (role: 'admin' | 'instructor' | 'student') => {
        let email = '';
        if (role === 'admin') email = 'admin@skillmetrix.dev';
        else if (role === 'instructor') email = 'instructor1@skillmetrix.dev';
        else email = 'student1@skillmetrix.dev';

        loginMutation.mutate({
            email,
            password: 'Password@123',
        });
    };

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (result) => {
            setAuth(result.accessToken, result.refreshToken, result.user);
            
            const returnUrl = searchParams.get('returnUrl');
            const stateFrom = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
            
            if (returnUrl || stateFrom) {
                navigate(returnUrl ?? stateFrom!, { replace: true });
            } else {
                const role = result.user.role;
                if (role === 'Admin' || role === 'Moderator') {
                    navigate('/admin', { replace: true });
                } else if (role === 'Instructor') {
                    navigate('/instructor', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message || 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
        },
    });

    const onSubmit = (values: LoginFormValues) => {
        loginMutation.mutate(values);
    };

    const isSubmitting = loginMutation.isPending;

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 overflow-hidden">
            {/* Background Animation */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-white/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-indigo-200 shadow-lg">
                        <LogIn className="text-white size-5" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight">Chào mừng trở lại</CardTitle>
                    <CardDescription className="text-gray-500">
                        Đăng nhập để tiếp tục hành trình học tập của bạn
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="email" 
                                                placeholder="name@example.com" 
                                                disabled={isSubmitting} 
                                                autoComplete="email"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Mật khẩu</FormLabel>
                                            <Link
                                                to="/forgot-password"
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Quên mật khẩu?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                disabled={isSubmitting}
                                                autoComplete="current-password" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 font-bold text-lg shadow-indigo-100 shadow-lg hover:shadow-xl transition-all"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <div className="relative w-full my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/80 backdrop-blur-md px-2 text-gray-400 font-bold tracking-wider">
                                Đăng nhập nhanh Demo
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleQuickLogin('admin')}
                            disabled={isSubmitting}
                            className="flex flex-col items-center justify-center h-20 border-rose-100 hover:border-rose-400 hover:bg-rose-50/50 transition-all group rounded-xl"
                        >
                            <Shield className="size-5 text-rose-500 group-hover:scale-110 transition-transform mb-1" />
                            <span className="text-[10px] font-black text-rose-700">Admin</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleQuickLogin('instructor')}
                            disabled={isSubmitting}
                            className="flex flex-col items-center justify-center h-20 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group rounded-xl"
                        >
                            <BookOpen className="size-5 text-indigo-500 group-hover:scale-110 transition-transform mb-1" />
                            <span className="text-[10px] font-black text-indigo-700">Giảng viên</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleQuickLogin('student')}
                            disabled={isSubmitting}
                            className="flex flex-col items-center justify-center h-20 border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group rounded-xl"
                        >
                            <GraduationCap className="size-5 text-emerald-500 group-hover:scale-110 transition-transform mb-1" />
                            <span className="text-[10px] font-black text-emerald-700">Học viên</span>
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-500 pt-2">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                            Đăng ký ngay
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}