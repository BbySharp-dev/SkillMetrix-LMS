import { useState, useRef, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Video, Loader2 } from 'lucide-react';

interface LessonEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { title: string, isFreePreview: boolean }) => void;
    initialData?: { id?: string; title?: string; isFreePreview?: boolean; videoUrl?: string | null } | null;
    onUploadVideo?: (lessonId: string, file: File) => Promise<void>;
    isUploading?: boolean;
    onUploadSuccess?: (updatedLesson: { videoUrl: string }) => void;
}

export default function LessonEditorModal({ 
    open, 
    onOpenChange, 
    onSave, 
    initialData,
    onUploadVideo,
    isUploading,
    onUploadSuccess,
}: LessonEditorModalProps) {
    const [title, setTitle] = useState(initialData?.title ?? '');
    const [isFreePreview, setIsFreePreview] = useState(initialData?.isFreePreview ?? false);
    const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(initialData?.videoUrl ?? null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && initialData?.id && onUploadVideo) {
            const objectUrl = URL.createObjectURL(file);
            setLocalVideoUrl(objectUrl);
            await onUploadVideo(initialData.id, file);

            if (onUploadSuccess) {
                onUploadSuccess({ videoUrl: objectUrl });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150 rounded-3xl p-8">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                        {initialData?.id ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Tiêu đề bài học</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="VD: Cách cài đặt Node.js"
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Video bài giảng</label>
                        
                        {initialData?.id ? (
                            localVideoUrl ? (
                            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-100 bg-black group">
                                <video
                                    key={localVideoUrl}
                                    src={localVideoUrl}
                                    className="w-full h-full object-contain"
                                    controls
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="rounded-xl font-black"
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        THAY ĐỔI VIDEO
                                    </Button>
                                </div>
                            </div>
                            ) : (
                            <div
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                className={`aspect-video rounded-2xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center p-6 group transition-all cursor-pointer ${
                                    isUploading ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-200 hover:bg-gray-100 hover:border-indigo-300'
                                }`}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="size-8 text-indigo-600 animate-spin mb-2" />
                                        <p className="text-sm font-black text-indigo-600">Đang tải video lên...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                                            <Video className="size-6 text-orange-500" />
                                        </div>
                                        <p className="text-sm font-black text-gray-900">Tải video lên</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest text-center">MP4, MOV, AVI • Tối đa 500MB</p>
                                    </>
                                )}
                            </div>
                            )
                        ) : (
                            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-4">
                                <Video className="size-6 text-amber-500" />
                                <p className="text-sm font-bold text-amber-700">
                                    Lưu bài học trước để tải video lên.
                                </p>
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

                    <div 
                        onClick={() => setIsFreePreview(!isFreePreview)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${
                            isFreePreview ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isFreePreview ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                        }`}>
                            {isFreePreview && <Check className="size-3 text-white" />}
                        </div>
                        <span className="text-sm font-bold text-gray-900">Cho phép xem trước (Preview)</span>
                    </div>
                </div>
                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl font-black border-gray-200 hover:bg-gray-50">
                        HỦY BỎ
                    </Button>
                    <Button
                        onClick={() => onSave({ title, isFreePreview })}
                        disabled={!title.trim() || isUploading}
                        className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black"
                    >
                        {initialData?.id ? "LƯU THAY ĐỔI" : "TẠO BÀI HỌC"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
