import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { authApi, type ApiError } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { loginSchema, type LoginFormValues } from '../schemas';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const setAuth = useAuthStore((s) => s.setAuth);

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
            

            navigate(returnUrl ?? stateFrom ?? '/', { replace: true });
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
                                                title="Chức năng đang phát triển"
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
                    <div className="text-center text-sm text-gray-500">
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