import { useRef, useState, useLayoutEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Upload,
    CheckCircle,
    X,
    Loader2,
    Eye,
    EyeOff,
    AlertCircle,
} from 'lucide-react';

interface LessonEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { title: string; isFreePreview: boolean; videoUrl?: string | null; durationSeconds?: number }) => void;
    initialData?: { id?: string; title?: string; isFreePreview?: boolean; videoUrl?: string | null; durationSeconds?: number } | null;
    onUploadVideo?: (lessonId: string, file: File) => Promise<void>;
    isUploading?: boolean;
}

export default function LessonEditorModal({
    open,
    onOpenChange,
    onSave,
    initialData,
    onUploadVideo,
    isUploading,
}: LessonEditorModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);
    const wasOpenRef = useRef(false);
    const [title, setTitle] = useState(initialData?.title ?? '');
    const [isFreePreview, setIsFreePreview] = useState(initialData?.isFreePreview ?? false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const uploadDone = !!(initialData?.videoUrl);

    // YouTube state
    const initialIsYoutube = !!(initialData?.videoUrl && (initialData.videoUrl.includes('youtube.com') || initialData.videoUrl.includes('youtu.be')));
    const [videoSource, setVideoSource] = useState<'file' | 'youtube'>(initialIsYoutube ? 'youtube' : 'file');
    const [youtubeUrl, setYoutubeUrl] = useState(initialIsYoutube ? (initialData?.videoUrl ?? '') : '');
    const initialDuration = initialData?.durationSeconds ?? 0;
    const [durationMinutes, setDurationMinutes] = useState(Math.floor(initialDuration / 60));
    const [durationSecondsVal, setDurationSecondsVal] = useState(initialDuration % 60);

    useLayoutEffect(() => {
        if (open && !wasOpenRef.current) {
            setTitle(initialData?.title ?? '');
            setIsFreePreview(initialData?.isFreePreview ?? false);
            setUploadProgress(0);
            
            const isYt = !!(initialData?.videoUrl && (initialData.videoUrl.includes('youtube.com') || initialData.videoUrl.includes('youtu.be')));
            setVideoSource(isYt ? 'youtube' : 'file');
            setYoutubeUrl(isYt ? (initialData?.videoUrl ?? '') : '');
            
            const dur = initialData?.durationSeconds ?? 0;
            setDurationMinutes(Math.floor(dur / 60));
            setDurationSecondsVal(dur % 60);
            
            setTimeout(() => titleRef.current?.focus(), 100);
        }
        wasOpenRef.current = open;
    }, [open, initialData]);

    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevUploadingRef = useRef(isUploading);
    useLayoutEffect(() => {
        const wasUploading = prevUploadingRef.current;
        prevUploadingRef.current = isUploading;

        if (!wasUploading && isUploading) {
            progressIntervalRef.current = setInterval(() => {
                setUploadProgress((p) => {
                    if (p >= 90) {
                        clearInterval(progressIntervalRef.current!);
                        progressIntervalRef.current = null;
                        return 90;
                    }
                    return p + Math.random() * 15;
                });
            }, 300);
        } else if (wasUploading && !isUploading) {
            clearInterval(progressIntervalRef.current!);
            progressIntervalRef.current = null;
            const t = setTimeout(() => {
                setUploadProgress(100);
                setTimeout(() => setUploadProgress(0), 1000);
            }, 0);
            return () => clearTimeout(t);
        }
    }, [isUploading]);

    const handleFile = async (file: File) => {
        if (!initialData?.id || !onUploadVideo) return;
        if (!file.type.startsWith('video/')) {
            alert('Vui lòng chọn file video.');
            return;
        }
        if (file.size > 500 * 1024 * 1024) {
            alert('File video tối đa 500MB.');
            return;
        }
        await onUploadVideo(initialData.id, file);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await handleFile(file);
        e.target.value = '';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) await handleFile(file);
    };

    const getYoutubeId = (url: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
        const shortsRegExp = /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/;
        const shortsMatch = url.match(shortsRegExp);
        if (shortsMatch && shortsMatch[1]) {
            return shortsMatch[1];
        }
        return null;
    };

    const handleSave = () => {
        const totalDuration = Number(durationMinutes) * 60 + Number(durationSecondsVal);
        
        if (videoSource === 'youtube') {
            if (youtubeUrl.trim() !== '') {
                const ytId = getYoutubeId(youtubeUrl);
                if (!ytId) {
                    alert('Đường dẫn YouTube không hợp lệ. Vui lòng kiểm tra lại.');
                    return;
                }
                onSave({
                    title: title.trim() || 'Bài học mới',
                    isFreePreview,
                    videoUrl: youtubeUrl.trim(),
                    durationSeconds: totalDuration,
                });
            } else {
                onSave({
                    title: title.trim() || 'Bài học mới',
                    isFreePreview,
                    videoUrl: '',
                    durationSeconds: totalDuration,
                });
            }
        } else {
            onSave({
                title: title.trim() || 'Bài học mới',
                isFreePreview,
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden"
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Colored top bar */}
                <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 to-purple-500" />

                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                                {initialData?.id ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                            </DialogTitle>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Title input */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                Tiêu đề bài học
                            </label>
                            <input
                                ref={titleRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="VD: Cách cài đặt Node.js"
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 focus:bg-white focus:border-indigo-400 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>

                        {/* Video upload or link area */}
                        {initialData?.id ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                        Nguồn Video bài giảng
                                    </label>
                                    <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-black">
                                        <button
                                            type="button"
                                            onClick={() => setVideoSource('file')}
                                            className={`px-3 py-1.5 rounded-md transition-all ${
                                                videoSource === 'file'
                                                    ? 'bg-white text-indigo-600 shadow-xs'
                                                    : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        >
                                            Tải tệp lên
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVideoSource('youtube')}
                                            className={`px-3 py-1.5 rounded-md transition-all ${
                                                videoSource === 'youtube'
                                                    ? 'bg-white text-indigo-600 shadow-xs'
                                                    : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        >
                                            Liên kết YouTube
                                        </button>
                                    </div>
                                </div>

                                {videoSource === 'file' ? (
                                    <div className="space-y-2">
                                        {initialData.videoUrl && !initialIsYoutube || uploadDone ? (
                                            /* Has video file — show video player */
                                            <div className="relative rounded-xl overflow-hidden border-2 border-gray-100 bg-black aspect-video group">
                                                <video
                                                    src={initialData.videoUrl!}
                                                    className="w-full h-full object-contain"
                                                    controls
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={isUploading}
                                                        className="rounded-xl font-black gap-2 shadow-lg"
                                                    >
                                                        <Upload className="size-3.5" />
                                                        Thay đổi video
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* No video yet — drag & drop upload zone */
                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setIsDragOver(true);
                                                }}
                                                onDragLeave={() => setIsDragOver(false)}
                                                onDrop={handleDrop}
                                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                                className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden ${
                                                    isDragOver
                                                        ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                                                        : isUploading
                                                        ? 'border-indigo-300 bg-indigo-50/50'
                                                        : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30'
                                                }`}
                                            >
                                                {/* Progress overlay */}
                                                {isUploading && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                                        <Loader2 className="size-10 text-indigo-600 animate-spin mb-3" />
                                                        <p className="text-sm font-black text-indigo-600 mb-3">
                                                            Đang tải video lên...
                                                        </p>
                                                        {/* Progress bar */}
                                                        <div className="w-48 h-2 bg-indigo-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-400 mt-2">
                                                            {Math.round(uploadProgress)}%
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Drop overlay */}
                                                {isDragOver && !isUploading && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/90 z-10">
                                                        <Upload className="size-10 text-indigo-500 mb-2" />
                                                        <p className="text-sm font-black text-indigo-600">Thả file vào đây</p>
                                                    </div>
                                                )}

                                                {/* Default content */}
                                                {!isUploading && (
                                                    <>
                                                        <div
                                                            className={`size-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                                                                isDragOver ? 'bg-indigo-100' : 'bg-indigo-50'
                                                            }`}
                                                        >
                                                            <Upload className={`size-6 ${isDragOver ? 'text-indigo-600' : 'text-indigo-400'}`} />
                                                        </div>
                                                        <p className="text-sm font-black text-gray-700">Tải video lên</p>
                                                        <p className="text-[11px] text-gray-400 font-medium mt-1">
                                                            Kéo thả file hoặc nhấn để chọn · MP4, MOV, AVI · Tối đa 500MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                                Đường dẫn video YouTube
                                            </label>
                                            <input
                                                type="text"
                                                value={youtubeUrl}
                                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                                placeholder="VD: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 focus:bg-white focus:border-indigo-400 outline-none transition-all placeholder:text-gray-300 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                                Thời lượng bài học
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={durationMinutes}
                                                        onChange={(e) => setYoutubeUrl(y => {
                                                            setDurationMinutes(Math.max(0, parseInt(e.target.value) || 0));
                                                            return y;
                                                        })}
                                                        className="w-20 px-3 py-2 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 focus:bg-white focus:border-indigo-400 outline-none transition-all text-center"
                                                    />
                                                    <span className="text-sm text-gray-500 font-bold">phút</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="59"
                                                        value={durationSecondsVal}
                                                        onChange={(e) => setYoutubeUrl(y => {
                                                            setDurationSecondsVal(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)));
                                                            return y;
                                                        })}
                                                        className="w-20 px-3 py-2 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 focus:bg-white focus:border-indigo-400 outline-none transition-all text-center"
                                                    />
                                                    <span className="text-sm text-gray-500 font-bold">giây</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Youtube Preview */}
                                        {getYoutubeId(youtubeUrl) && (
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                                    Xem trước Video YouTube
                                                </label>
                                                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-100 bg-black">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                                                        className="w-full h-full"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* No lesson ID yet — prompt to create first */
                            <div className="rounded-xl bg-amber-50 border border-amber-100 p-5 flex items-start gap-4">
                                <div className="size-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                    <AlertCircle className="size-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-amber-800">Tạo bài học trước đã</p>
                                    <p className="text-xs text-amber-600 font-medium mt-1">
                                        Nhấn "Tạo bài học" bên dưới, sau đó phần tải video sẽ hiện ra ngay.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Preview toggle */}
                        <div
                            onClick={() => setIsFreePreview((v) => !v)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isFreePreview
                                    ? 'bg-indigo-50 border-indigo-300'
                                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                            }`}
                        >
                            <div
                                className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    isFreePreview ? 'bg-indigo-100' : 'bg-gray-100'
                                }`}
                            >
                                {isFreePreview ? (
                                    <Eye className="size-5 text-indigo-600" />
                                ) : (
                                    <EyeOff className="size-5 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={`font-black text-sm ${isFreePreview ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Cho phép xem trước
                                </p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    Học viên có thể xem trước bài học này miễn phí
                                </p>
                            </div>
                            {/* Toggle switch */}
                            <div
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                                    isFreePreview ? 'bg-indigo-500' : 'bg-gray-200'
                                }`}
                            >
                                <div
                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                        isFreePreview ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="mt-8 gap-3 flex-row-reverse">
                        <Button
                            onClick={handleSave}
                            disabled={isUploading}
                            className="h-11 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-sm shadow-sm transition-colors gap-2"
                        >
                            {initialData?.id ? (
                                <>
                                    <CheckCircle className="size-4" />
                                    Lưu thay đổi
                                </>
                            ) : (
                                <>
                                    <Plus className="size-4" />
                                    Tạo bài học
                                </>
                            )}
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

function Plus({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}
