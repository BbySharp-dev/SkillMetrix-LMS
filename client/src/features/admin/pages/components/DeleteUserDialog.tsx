import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { useState } from 'react';

interface DeleteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: { id: string; name: string } | null;
    onConfirm: () => void;
    isPending: boolean;
}

export function DeleteUserDialog({ open, onOpenChange, user, onConfirm, isPending }: DeleteUserDialogProps) {
    const [confirmName, setConfirmName] = useState('');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="size-5" />
                        Xóa tài khoản
                    </DialogTitle>
                    <DialogDescription>
                        Hành động này không thể hoàn tác. Tài khoản sẽ bị xóa vĩnh viễn.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                        <AlertTriangle className="size-4" />
                        Lưu ý quan trọng:
                    </div>
                    <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                        <li>Tài khoản <strong>{user?.name}</strong> sẽ bị xóa vĩnh viễn.</li>
                        <li>Tất cả dữ liệu liên quan sẽ bị mất.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                        Nhập tên tài khoản để xác nhận:
                    </label>
                    <input
                        type="text"
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        placeholder={user?.name ?? ''}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 font-medium text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        className="h-10 rounded-xl font-bold border-gray-200"
                        onClick={() => { setConfirmName(''); onOpenChange(false); }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                        onClick={onConfirm}
                        disabled={isPending || confirmName !== user?.name}
                    >
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        <span className="ml-1.5">Xóa vĩnh viễn</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
