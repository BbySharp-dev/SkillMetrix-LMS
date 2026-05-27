import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { authApi, type ApiError } from '@/features/auth/api/authApi';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui';
import { Input } from '@/components/ui';

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const mutation = useMutation({
        mutationFn: authApi.forgotPassword,
        onSuccess: (_, email) => {
            setSubmitted(true);
            setSubmittedEmail(email);
            toast.success('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        },
    });

    const onSubmit = (values: ForgotPasswordFormValues) => {
        mutation.mutate(values.email);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-white/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-indigo-200 shadow-lg">
                        <Mail className="text-white size-5" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight">
                        {submitted ? 'Kiểm tra email' : 'Quên mật khẩu'}
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        {submitted
                            ? 'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.'
                            : 'Nhập địa chỉ email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {submitted ? (
                        <div className="space-y-4">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
                                <p className="font-semibold mb-1">Email: <span className="font-mono">{submittedEmail}</span></p>
                                <p className="text-indigo-600 text-xs mt-1">
                                    Kiểm tra hộp thư (và thư rác) để tìm liên kết đặt lại mật khẩu.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full font-bold"
                                onClick={() => mutation.reset()}
                            >
                                Gửi lại email
                            </Button>
                        </div>
                    ) : (
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
                                                    autoComplete="email"
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
                                            Đang gửi...
                                        </>
                                    ) : (
                                        'Gửi yêu cầu'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Link
                        to="/login"
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="size-3.5" />
                        Quay lại đăng nhập
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
