import { createContext, useRef, type RefObject } from 'react';
import type { MutableRefObject } from 'react';

interface VideoPlayerContextValue {
    currentTimeRef: MutableRefObject<number>;
    seekToRef: RefObject<((time: number) => void) | undefined>;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue>({
    currentTimeRef: { current: 0 },
    seekToRef: { current: undefined },
});

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
    const currentTimeRef = useRef(0);
    const seekToRef = useRef<((time: number) => void) | undefined>(undefined);

    return (
        <VideoPlayerContext.Provider value={{ currentTimeRef, seekToRef }}>
            {children}
        </VideoPlayerContext.Provider>
    );
}

// Only export the hook from a separate file (useVideoPlayerContext.ts)
export { VideoPlayerContext };
