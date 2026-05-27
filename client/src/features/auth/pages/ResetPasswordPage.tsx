import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { authApi, type ApiError } from '@/features/auth/api/authApi';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui';
import { Input } from '@/components/ui';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get('email') ?? '';
    const token = searchParams.get('token') ?? '';
    const [success, setSuccess] = useState(false);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email, token, password: '', confirmPassword: '' },
    });

    // Sync URL params into form after mount
    useEffect(() => {
        form.reset({ email, token, password: '', confirmPassword: '' });
    }, [email, token, form]);

    const mutation = useMutation({
        mutationFn: authApi.resetPassword,
        onSuccess: () => {
            setSuccess(true);
            toast.success('Đặt lại mật khẩu thành công!');
            setTimeout(() => navigate('/login'), 2000);
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message || 'Token không hợp lệ hoặc đã hết hạn.');
        },
    });

    const onSubmit = (values: ResetPasswordFormValues) => {
        mutation.mutate({
            email: values.email,
            token: values.token,
            newPassword: values.password,
        });
    };

    if (!email || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <Lock className="text-red-500 size-5" />
                        </div>
                        <p className="text-gray-600">Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
                        <Button asChild className="font-bold">
                            <Link to="/forgot-password">Yêu cầu liên kết mới</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-white/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-indigo-200 shadow-lg">
                        {success ? (
                            <CheckCircle className="text-white size-5" />
                        ) : (
                            <Lock className="text-white size-5" />
                        )}
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight">
                        {success ? 'Thành công!' : 'Đặt lại mật khẩu'}
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        {success
                            ? 'Mật khẩu của bạn đã được đặt lại. Đang chuyển hướng...'
                            : 'Nhập mật khẩu mới cho tài khoản của bạn.'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {success ? (
                        <div className="text-center space-y-3">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-sm text-green-700">
                                    Mật khẩu đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập trong giây lát.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mật khẩu mới</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-11 font-bold text-lg shadow-indigo-100 shadow-lg hover:shadow-xl transition-all"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Đặt lại mật khẩu'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    )}
                </CardContent>

                {!success && (
                    <CardFooter className="flex justify-center">
                        <Link
                            to="/login"
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="size-3.5" />
                            Quay lại đăng nhập
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

