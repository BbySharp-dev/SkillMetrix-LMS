import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
        email: z.string().email('Email không hợp lệ'),
        password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
        confirmPassword: z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp',
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        email: z.string().email('Email không hợp lệ'),
        token: z.string().min(1, 'Token không hợp lệ'),
        password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
        confirmPassword: z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp',
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
