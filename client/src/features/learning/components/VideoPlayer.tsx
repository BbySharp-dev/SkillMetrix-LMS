import { useEffect, useRef, useCallback, useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
    lessonId: string;
    videoUrl: string;
    initialSecond?: number;
    onPersistProgress: (second: number) => void;
}

export default function VideoPlayer({
    videoUrl,
    initialSecond = 0,
    onPersistProgress,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const currentSecondRef = useRef<number>(initialSecond);
    const lastSentSecondRef = useRef<number>(-1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const flushProgress = useCallback(async (force = false) => {
        const sec = Math.floor(currentSecondRef.current);
        const shouldSend = force || sec - lastSentSecondRef.current >= 5;
        if (!shouldSend || sec < 0) return;
        try {
            await onPersistProgress(sec);
            lastSentSecondRef.current = sec;
        } catch {
            // Non-critical — ignore save errors
        }
    }, [onPersistProgress]);

    useEffect(() => {
        currentSecondRef.current = initialSecond;
        lastSentSecondRef.current = -1;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(null);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false);
        if (videoRef.current) {
            videoRef.current.currentTime = initialSecond;
        }
    }, [initialSecond, videoUrl]);

    useEffect(() => {
        intervalRef.current = setInterval(() => { void flushProgress(false); }, 30_000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [flushProgress]);

    useEffect(() => {
        const handleBeforeUnload = () => { void flushProgress(true); };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            void flushProgress(true);
        };
    }, [flushProgress]);

    if (!videoUrl || videoUrl.trim() === '') {
        return (
            <div className="flex flex-col items-center justify-center aspect-video bg-gray-100 border border-gray-200 rounded-xl gap-3">
                <AlertCircle className="w-10 h-10 text-gray-400" />
                <p className="text-sm text-gray-500">Video chưa được tải lên cho bài học này.</p>
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
            {error && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 gap-4">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-sm text-red-300 text-center px-8">{error}</p>
                    <button
                        onClick={() => { setError(null); videoRef.current?.load(); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Thử lại
                    </button>
                </div>
            )}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 pointer-events-none">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full h-full"
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onTimeUpdate={() => {
                    if (videoRef.current) currentSecondRef.current = videoRef.current.currentTime;
                }}
                onPause={() => { void flushProgress(true); }}
                onEnded={() => { void flushProgress(true); }}
                onError={() => {
                    setIsLoading(false);
                    setError('Không thể phát video. URL có thể đã hết hạn hoặc không hợp lệ.');
                }}
            />
        </div>
    );
}
