import { useEffect, useRef, useCallback } from 'react';

interface VideoPlayerProps {
    lessonId: string;
    videoUrl: string;
    initialSecond?: number;
    onPersistProgress: (second: number) => void;
}

export default function VideoPlayer({
    lessonId,
    videoUrl,
    initialSecond = 0,
    onPersistProgress,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const currentSecondRef = useRef<number>(initialSecond);
    const lastSentSecondRef = useRef<number>(-1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const flushProgress = useCallback(async (force = false) => {
        const sec = Math.floor(currentSecondRef.current);
        const shouldSend = force || sec - lastSentSecondRef.current >= 5;
        if (!shouldSend || sec < 0) return;

        try {
            await onPersistProgress(sec);
            lastSentSecondRef.current = sec;
        } catch {
            return;
        }
    }, [onPersistProgress]);

    useEffect(() => {
        currentSecondRef.current = initialSecond;
        lastSentSecondRef.current = -1;

        if (videoRef.current) {
            videoRef.current.currentTime = initialSecond;
        }
    }, [lessonId, initialSecond]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            void flushProgress(false);
        }, 30_000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [flushProgress]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            void flushProgress(true);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            void flushProgress(true); // unmount cleanup
        };
    }, [flushProgress]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            currentSecondRef.current = videoRef.current.currentTime;
        }
    };

    const handlePause = () => {
        void flushProgress(true);
    };

    const handleEnded = () => {
        void flushProgress(true);
    };

    return (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
            <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onPause={handlePause}
                onEnded={handleEnded}
            />
        </div>
    );
}