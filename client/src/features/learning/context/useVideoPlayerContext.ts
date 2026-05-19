import { useContext } from 'react';
import { VideoPlayerContext } from './VideoPlayerContext';

export function useVideoPlayerContext() {
    return useContext(VideoPlayerContext);
}
