import { CheckCircle2 } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    durationSeconds: number;
    isFreePreview?: boolean;
    isCompleted?: boolean;
}

interface LessonSidebarProps {
    chapters: Array<{
        id: string;
        title: string;
        orderIndex: number;
        lessons: Lesson[];
    }>;
    activeLessonId: string;
    onSelectLesson: (lessonId: string) => void;
}

const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const ss = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mm}:${ss}`;
};

export default function LessonSidebar({ chapters, activeLessonId, onSelectLesson }: LessonSidebarProps) {
    return (
        <aside className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-900">Nội dung khóa học</h2>
            </div>

            <div className="max-h-[75vh] overflow-auto divide-y divide-gray-50">
                {chapters
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((chapter, chapterIdx) => {
                        const sortedLessons = chapter.lessons;

                        return (
                            <div key={chapter.id} className="py-3">
                                {/* Chapter header */}
                                <div className="px-5 py-2 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                                        {chapterIdx + 1}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900 leading-tight">{chapter.title}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                            {sortedLessons.length} bài học
                                        </p>
                                    </div>
                                </div>

                                {/* Lessons */}
                                <div className="space-y-0.5 px-5">
                                    {sortedLessons.map((lesson, lessonIdx) => {
                                        const isActive = lesson.id === activeLessonId;
                                        const isCompleted = lesson.isCompleted;

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => onSelectLesson(lesson.id)}
                                                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                                                    isActive
                                                        ? 'bg-indigo-50 shadow-sm'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                                                            isActive
                                                                ? 'bg-indigo-600 text-white'
                                                                : isCompleted
                                                                    ? 'bg-emerald-100 text-emerald-600'
                                                                    : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                            {isCompleted && !isActive ? (
                                                                <CheckCircle2 className="size-4" />
                                                            ) : (
                                                                lessonIdx + 1
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-sm font-bold leading-tight truncate ${
                                                                isActive ? 'text-indigo-900' : 'text-gray-700'
                                                            }`}>
                                                                {lesson.title}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {lesson.isFreePreview && (
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                                Miễn phí
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                                            {formatTime(lesson.durationSeconds)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </aside>
    );
}