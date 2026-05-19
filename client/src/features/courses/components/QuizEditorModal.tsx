import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, ListChecks, Clock, Repeat, Target, ToggleLeft, ToggleRight } from 'lucide-react';
import type { CourseQuizDto } from '../types';

interface QuizEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: CourseQuizDto | null;
    onSave: (data: {
        title: string;
        description?: string;
        passingScore: number;
        timeLimitMinutes?: number | null;
        maxAttempts: number;
        isFinalQuiz: boolean;
    }) => void;
}

export default function QuizEditorModal({
    open,
    onOpenChange,
    initialData,
    onSave,
}: QuizEditorModalProps) {
    const [title, setTitle] = useState(initialData?.title ?? '');
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [passingScore, setPassingScore] = useState(initialData?.passingScore ?? 70);
    const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>(
        initialData?.timeLimitMinutes ?? ''
    );
    const [maxAttempts, setMaxAttempts] = useState(initialData?.maxAttempts ?? 1);
    const [isFinalQuiz, setIsFinalQuiz] = useState(initialData?.isFinalQuiz ?? false);

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({
            title: title.trim(),
            description: description.trim() || undefined,
            passingScore,
            timeLimitMinutes: timeLimitMinutes === '' ? null : Number(timeLimitMinutes),
            maxAttempts,
            isFinalQuiz,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
    };

    const isEditing = !!initialData;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-xl rounded-3xl p-0 overflow-hidden"
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Colored top bar */}
                <div className="h-1.5 w-full bg-linear-to-r from-purple-500 to-indigo-500" />

                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <ListChecks className="size-5 text-purple-600" />
                                </div>
                                <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                                    {isEditing ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}
                                </DialogTitle>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-5">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                Tiêu đề Quiz <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="VD: Bài kiểm tra cuối chương 1"
                                autoFocus
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 focus:bg-white focus:border-purple-400 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                Mô tả
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả ngắn về quiz này (không bắt buộc)"
                                rows={2}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-medium text-gray-900 focus:bg-white focus:border-purple-400 outline-none transition-all placeholder:text-gray-300 resize-none"
                            />
                        </div>

                        {/* Settings grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Passing score */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                    <Target className="size-3" />
                                    Điểm đạt (%)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={passingScore}
                                    onChange={(e) =>
                                        setPassingScore(Math.max(1, Math.min(100, Number(e.target.value))))
                                    }
                                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 text-center focus:bg-white focus:border-purple-400 outline-none transition-all"
                                />
                            </div>

                            {/* Time limit */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                    <Clock className="size-3" />
                                    Thời gian (phút)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={timeLimitMinutes}
                                    onChange={(e) =>
                                        setTimeLimitMinutes(e.target.value === '' ? '' : Number(e.target.value))
                                    }
                                    placeholder="Không giới hạn"
                                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 text-center focus:bg-white focus:border-purple-400 outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>

                            {/* Max attempts */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                    <Repeat className="size-3" />
                                    Số lần làm
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={maxAttempts}
                                    onChange={(e) =>
                                        setMaxAttempts(Math.max(1, Math.min(99, Number(e.target.value))))
                                    }
                                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 text-center focus:bg-white focus:border-purple-400 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Final quiz toggle */}
                        <div
                            onClick={() => setIsFinalQuiz((v) => !v)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isFinalQuiz
                                    ? 'bg-purple-50 border-purple-300'
                                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                            }`}
                        >
                            <div
                                className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    isFinalQuiz ? 'bg-purple-100' : 'bg-gray-100'
                                }`}
                            >
                                {isFinalQuiz ? (
                                    <ToggleRight className="size-5 text-purple-600" />
                                ) : (
                                    <ToggleLeft className="size-5 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={`font-black text-sm ${isFinalQuiz ? 'text-purple-700' : 'text-gray-700'}`}>
                                    Quiz cuối khóa
                                </p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    Học viên chỉ có thể làm quiz này sau khi hoàn thành tất cả bài học
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="mt-8 gap-3 flex-row-reverse">
                        <Button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="h-11 px-7 rounded-xl bg-purple-600 hover:bg-purple-700 font-black text-sm shadow-sm transition-colors gap-2 disabled:opacity-40"
                        >
                            <CheckCircle className="size-4" />
                            {isEditing ? 'Lưu thay đổi' : 'Tạo Quiz'}
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
