import { PlayCircle, Lock, Clock } from 'lucide-react';
import type { LessonDto } from '../types';

interface LessonItemProps {
    lesson: LessonDto;
    index: number;
}

const toTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
};

export default function LessonItem({ lesson, index }: LessonItemProps) {
    return (
        <div className="flex items-center justify-between py-3.5 px-4 text-sm hover:bg-white hover:shadow-sm cursor-pointer rounded-xl transition-all duration-300 group border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 text-xs font-black text-gray-300 group-hover:text-indigo-400 transition-colors">
                    {index.toString().padStart(2, '0')}
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        {lesson.isFreePreview ? (
                            <PlayCircle className="size-4" />
                        ) : (
                            <Lock className="size-3.5" />
                        )}
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-700 group-hover:text-indigo-900 transition-colors">{lesson.title}</span>
                        {lesson.isFreePreview && (
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Học thử miễn phí</span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-mono text-gray-400 bg-gray-100/50 px-2 py-1 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Clock className="size-3" />
                    {toTime(lesson.durationSeconds)}
                </span>
            </div>
        </div>
    );
}
