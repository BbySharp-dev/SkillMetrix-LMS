import { useState } from 'react';
import { UserPlus, Loader2, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { UserRole } from '../../api/adminApi';

const roleConfig: Record<string, { label: string; color: string }> = {
    Moderator: { label: 'Kiểm duyệt viên', color: 'text-violet-600' },
    Instructor: { label: 'Giảng viên', color: 'text-indigo-600' },
    Student: { label: 'Học viên', color: 'text-emerald-600' },
};

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
    const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'Student' as UserRole });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createUser = useMutation({
        mutationFn: async (data: typeof form) => {
            const res = await fetch('http://localhost:5015/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message ?? 'Tạo người dùng thất bại');
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success('Tạo người dùng thành công!');
            setForm({ email: '', password: '', fullName: '', role: 'Student' });
            setErrors({});
            onOpenChange(false);
            onSuccess();
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.email) newErrors.email = 'Email là bắt buộc';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email không hợp lệ';
        if (!form.password) newErrors.password = 'Mật khẩu là bắt buộc';
        else if (form.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        if (!form.fullName) newErrors.fullName = 'Họ tên là bắt buộc';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) createUser.mutate(form);
    };

    const roles = ['Moderator', 'Instructor', 'Student'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                            <UserPlus className="size-5" />
                            Tạo người dùng mới
                        </DialogTitle>
                        <DialogDescription>
                            Điền thông tin để tạo tài khoản người dùng mới.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    className={`pl-10 h-11 rounded-xl border-2 ${errors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-indigo-400'}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Họ tên</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    placeholder="Nguyễn Văn A"
                                    value={form.fullName}
                                    onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    className={`pl-10 h-11 rounded-xl border-2 ${errors.fullName ? 'border-red-300' : 'border-gray-200 focus:border-indigo-400'}`}
                                />
                            </div>
                            {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                    className={`pl-10 h-11 rounded-xl border-2 ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-indigo-400'}`}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Vai trò</label>
                            <div className="grid grid-cols-3 gap-2">
                                {roles.map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, role: role as UserRole }))}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-xs ${
                                            form.role === role 
                                                ? 'border-indigo-400 bg-indigo-50 text-indigo-700' 
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <ShieldCheck className={`size-4 ${roleConfig[role].color}`} />
                                        {roleConfig[role].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" className="h-10 rounded-xl font-bold border-gray-200" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" className="h-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700" disabled={createUser.isPending}>
                            {createUser.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                            <span className="ml-1.5">Tạo người dùng</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
