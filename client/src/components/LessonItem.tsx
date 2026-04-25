import { type LessonDto } from '@/types/course';

interface LessonItemProps {
    lesson: LessonDto;
}

const toTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const ss = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mm}:${ss}`;
};

export default function LessonItem({ lesson }: LessonItemProps) {
    return (
        <div className="flex items-center justify-between py-2 px-4 text-sm hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">▶</span>
                <span>{lesson.title}</span>
                {lesson.isFreePreview && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                        Preview
                    </span>
                )}
            </div>
            <span className="text-gray-500">{toTime(lesson.durationSeconds)}</span>
        </div>
    );
}
