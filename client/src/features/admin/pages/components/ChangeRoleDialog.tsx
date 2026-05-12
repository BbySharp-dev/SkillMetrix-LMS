import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui';
import { Button } from '@/components/ui';
import type { UserRole } from '../../api/adminApi';

const roleConfig: Record<string, { label: string; icon: typeof ShieldCheck; color: string }> = {
    Moderator: { label: 'Kiểm duyệt viên', icon: ShieldCheck, color: 'text-violet-600' },
    Instructor: { label: 'Giảng viên', icon: ShieldCheck, color: 'text-indigo-600' },
    Student: { label: 'Học viên', icon: ShieldCheck, color: 'text-emerald-600' },
};

interface ChangeRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: { id: string; name: string; currentRole: UserRole } | null;
    newRole: UserRole | null;
    onRoleChange: (newRole: UserRole) => void;
    isPending: boolean;
    onSubmit: () => void;
}

export function ChangeRoleDialog({
    open,
    onOpenChange,
    user,
    newRole,
    onRoleChange,
    isPending,
    onSubmit,
}: ChangeRoleDialogProps) {
    const roles = ['Moderator', 'Instructor', 'Student'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-600">
                        <ShieldCheck className="size-5" />
                        Đổi vai trò người dùng
                    </DialogTitle>
                    <DialogDescription>
                        Thay đổi vai trò cho tài khoản <strong>{user?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 pt-2">
                    <p className="text-sm font-bold text-gray-500">Chọn vai trò mới:</p>
                    <div className="grid grid-cols-3 gap-2">
                        {roles.map(role => {
                            const cfg = roleConfig[role];
                            const Icon = cfg.icon;
                            return (
                                <button
                                    key={role}
                                    onClick={() => onRoleChange(role as UserRole)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                                        newRole === role 
                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700' 
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className={`size-5 ${cfg.color}`} />
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button
                        variant="outline"
                        className="h-10 rounded-xl font-bold border-gray-200"
                        onClick={() => onOpenChange(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        className="h-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={onSubmit}
                        disabled={isPending || !newRole || newRole === user?.currentRole}
                    >
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                        <span className="ml-1.5">Lưu thay đổi</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
