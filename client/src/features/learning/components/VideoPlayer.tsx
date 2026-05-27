/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback, useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useVideoPlayerContext } from '../context/useVideoPlayerContext';

interface VideoPlayerProps {
    lessonId: string;
    videoUrl: string;
    initialSecond?: number;
    onPersistProgress: (second: number) => void;
}

// Global script loader helper
let apiLoaded = false;
function loadYoutubeApi() {
    if (apiLoaded || (window as any).YT) return;
    apiLoaded = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
}

function getYoutubeId(url: string): string | null {
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
}

export default function VideoPlayer({
    videoUrl,
    initialSecond = 0,
    onPersistProgress,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const youtubeContainerRef = useRef<HTMLDivElement>(null);
    const { currentTimeRef, seekToRef } = useVideoPlayerContext();
    const currentSecondRef = useRef<number>(initialSecond);
    const lastSentSecondRef = useRef<number>(-1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const ytPlayerRef = useRef<any>(null);

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

    // Handle HTML5 Video Player Seek exposure
    useEffect(() => {
        if (!isYoutube) {
            seekToRef.current = (time: number) => {
                if (videoRef.current) {
                    videoRef.current.currentTime = time;
                    videoRef.current.play().catch(() => {});
                }
            };
        }
    }, [isYoutube, seekToRef]);

    // Handle YouTube Video Player
    useEffect(() => {
        if (!isYoutube || !videoUrl) return;

        loadYoutubeApi();

        let checkInterval: any;
        let progressInterval: any;

        const initPlayer = () => {
            const win = window as any;
            if (!win.YT || !win.YT.Player || !youtubeContainerRef.current) return;

            clearInterval(checkInterval);

            const videoId = getYoutubeId(videoUrl);
            if (!videoId) {
                setError('Đường dẫn YouTube không hợp lệ.');
                return;
            }

            setIsLoading(true);

            ytPlayerRef.current = new win.YT.Player(youtubeContainerRef.current, {
                videoId: videoId,
                playerVars: {
                    start: Math.floor(initialSecond),
                    autoplay: 0,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                },
                events: {
                    onReady: () => {
                        setIsLoading(false);
                    },
                    onStateChange: (event: any) => {
                        // event.data: 1 (playing), 2 (paused), 0 (ended)
                        if (event.data === 1) {
                            setIsLoading(false);
                            if (progressInterval) clearInterval(progressInterval);
                            progressInterval = setInterval(() => {
                                if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
                                    const t = ytPlayerRef.current.getCurrentTime();
                                    currentSecondRef.current = t;
                                    currentTimeRef.current = t;
                                }
                            }, 1000);
                        } else {
                            if (progressInterval) {
                                clearInterval(progressInterval);
                                progressInterval = null;
                            }
                            void flushProgress(true);
                        }
                    },
                    onError: () => {
                        setIsLoading(false);
                        setError('Không thể phát video YouTube này. Vui lòng kiểm tra lại liên kết.');
                    }
                }
            });
        };

        const win = window as any;
        if (win.YT && win.YT.Player) {
            initPlayer();
        } else {
            checkInterval = setInterval(() => {
                const w = window as any;
                if (w.YT && w.YT.Player) {
                    initPlayer();
                }
            }, 100);
        }

        // Expose seek function via context
        seekToRef.current = (time: number) => {
            if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
                ytPlayerRef.current.seekTo(time, true);
                ytPlayerRef.current.playVideo();
            }
        };

        return () => {
            clearInterval(checkInterval);
            if (progressInterval) clearInterval(progressInterval);
            if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
                try {
                    ytPlayerRef.current.destroy();
                } catch {
                    // Ignore
                }
            }
        };
    }, [isYoutube, videoUrl, initialSecond, seekToRef, flushProgress, currentTimeRef]);

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
                        onClick={() => {
                            setError(null);
                            if (isYoutube) {
                                window.location.reload();
                            } else {
                                videoRef.current?.load();
                            }
                        }}
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
            
            {isYoutube ? (
                /* Youtube Container */
                <div className="w-full h-full aspect-video">
                    <div ref={youtubeContainerRef} className="w-full h-full" />
                </div>
            ) : (
                /* Standard HTML5 Video Player */
                <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    onLoadStart={() => setIsLoading(true)}
                    onCanPlay={() => setIsLoading(false)}
                    onTimeUpdate={() => {
                        if (videoRef.current) {
                            const t = videoRef.current.currentTime;
                            currentSecondRef.current = t;
                            currentTimeRef.current = t;
                        }
                    }}
                    onLoadedMetadata={() => {
                        if (videoRef.current) {
                            videoRef.current.currentTime = initialSecond;
                        }
                    }}
                    onPause={() => { void flushProgress(true); }}
                    onEnded={() => { void flushProgress(true); }}
                    onError={() => {
                        setIsLoading(false);
                        setError('Không thể phát video. URL có thể đã hết hạn hoặc không hợp lệ.');
                    }}
                />
            )}
        </div>
    );
}
