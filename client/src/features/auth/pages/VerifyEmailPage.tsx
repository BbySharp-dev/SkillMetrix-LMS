import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

import { authApi, type ApiError } from '@/features/auth/api/authApi';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error' | 'already_verified';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId') ?? '';
    const token = searchParams.get('token') ?? '';
    const [status, setStatus] = useState<VerifyStatus>('idle');
    const [resendEmail, setResendEmail] = useState('');

    const verifyMutation = useMutation({
        mutationFn: () => authApi.verifyEmail(userId, token),
        onSuccess: () => setStatus('success'),
        onError: (err: unknown) => {
            const error = err as ApiError;
            const msg = error?.message ?? '';
            if (msg.toLowerCase().includes('đã được xác thực')) {
                setStatus('already_verified');
            } else {
                setStatus('error');
            }
        },
    });

    const resendMutation = useMutation({
        mutationFn: (email: string) => authApi.resendVerification(email),
        onSuccess: () => toast.success('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.'),
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message || 'Không thể gửi lại email.');
        },
    });

    useEffect(() => {
        if (userId && token) {
            verifyMutation.mutate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-white/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-indigo-200 shadow-lg">
                        {status === 'success' || status === 'already_verified' ? (
                            <CheckCircle className="text-white size-6" />
                        ) : status === 'error' ? (
                            <XCircle className="text-red-500 size-6" />
                        ) : (
                            <Mail className="text-white size-6" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Xác thực email</CardTitle>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="size-8 mx-auto text-indigo-500 animate-spin" />
                            <p className="text-gray-500 text-sm">Đang xác thực email của bạn...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                                <p className="text-sm text-green-800 font-semibold">
                                    Email của bạn đã được xác thực thành công!
                                </p>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Cảm ơn bạn đã xác thực. Bây giờ bạn có thể đăng nhập và bắt đầu học tập.
                            </p>
                            <Button asChild className="w-full font-bold bg-indigo-600 hover:bg-indigo-700">
                                <Link to="/login">Đăng nhập ngay</Link>
                            </Button>
                        </>
                    )}

                    {status === 'already_verified' && (
                        <>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                                <p className="text-sm text-amber-800 font-semibold">
                                    Email này đã được xác thực trước đó.
                                </p>
                            </div>
                            <Button asChild className="w-full font-bold bg-indigo-600 hover:bg-indigo-700">
                                <Link to="/login">Đăng nhập ngay</Link>
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                                <p className="text-sm text-red-800 font-semibold">
                                    Xác thực không thành công. Liên kết có thể đã hết hạn hoặc không hợp lệ.
                                </p>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-gray-600">Nhập email để gửi lại email xác thực:</label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                    />
                                    <Button
                                        variant="outline"
                                        className="font-bold gap-1.5 shrink-0"
                                        onClick={() => resendMutation.mutate(resendEmail)}
                                        disabled={!resendEmail || resendMutation.isPending}
                                    >
                                        <RefreshCw className={`size-3.5 ${resendMutation.isPending ? 'animate-spin' : ''}`} />
                                        Gửi lại
                                    </Button>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full text-xs text-gray-400"
                                asChild
                            >
                                <Link to="/login">Quay lại đăng nhập</Link>
                            </Button>
                        </>
                    )}
                </CardContent>

                {(status === 'success' || status === 'already_verified' || status === 'error') && (
                    <CardFooter className="flex justify-center">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                            Quay lại trang đăng nhập
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
