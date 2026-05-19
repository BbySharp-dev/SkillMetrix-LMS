import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Layers } from 'lucide-react';

interface ChapterEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { title: string }) => void;
    initialData?: { id?: string; title: string };
}

export default function ChapterEditorModal({
    open,
    onOpenChange,
    onSave,
    initialData,
}: ChapterEditorModalProps) {
    const [title, setTitle] = useState(initialData?.title ?? '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
        }
    }, [open]);

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ title: title.trim() });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-lg rounded-3xl p-0 overflow-hidden"
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Colored top bar */}
                <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 to-purple-500" />

                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                                {initialData?.id ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
                            </DialogTitle>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                            Tiêu đề chương
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300">
                                <Layers className="size-4" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="VD: Tổng quan về dự án"
                                className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 focus:bg-white focus:border-indigo-400 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-8 gap-3 flex-row-reverse">
                        <Button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="h-11 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-sm shadow-sm transition-colors gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="size-4" />
                            {initialData?.id ? 'Lưu thay đổi' : 'Tạo chương'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-11 px-6 rounded-xl font-black text-sm border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
