import { useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useCourseCurriculum } from '@/features/courses/hooks/useCourses';
import { useLessonProgress, useUpdateLessonProgress } from '@/features/progress/hooks/useProgress';
import LessonSidebar from '../components/LessonSidebar';
import VideoPlayer from '../components/VideoPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function LearningPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [localCompletedMap, setLocalCompletedMap] = useState<Record<string, boolean>>({});

    const { data: curriculum, isLoading: curriculumLoading } = useCourseCurriculum(courseId);

    const allLessons = useMemo(() => {
        return curriculum?.flatMap((ch) =>
            [...ch.lessons].sort((a, b) => a.orderIndex - b.orderIndex).map((ls) => ({
                ...ls,
                chapterId: ch.id,
                chapterTitle: ch.title,
            }))
        ) ?? [];
    }, [curriculum]);

    const defaultLessonId = allLessons[0]?.id;
    const activeLessonId = searchParams.get('lessonId') ?? defaultLessonId;

    const activeLesson = useMemo(() =>
        allLessons.find((x) => x.id === activeLessonId) ?? allLessons[0],
        [allLessons, activeLessonId]
    );

    const { data: lessonProgressData } = useLessonProgress(activeLesson?.id);
    const updateProgressMutation = useUpdateLessonProgress();

    const mutateRef = useRef(updateProgressMutation.mutateAsync);
    mutateRef.current = updateProgressMutation.mutateAsync;
    const activeLessonIdRef = useRef(activeLesson?.id);
    activeLessonIdRef.current = activeLesson?.id;

    const lessonsForSidebar = useMemo(() => {
        return curriculum?.map((chapter) => ({
            ...chapter,
            lessons: [...chapter.lessons].sort((a, b) => a.orderIndex - b.orderIndex).map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                durationSeconds: lesson.durationSeconds,
                isFreePreview: lesson.isFreePreview,
                isCompleted: localCompletedMap[lesson.id] ?? false,
            })),
        })) ?? [];
    }, [curriculum, localCompletedMap]);

    const onSelectLesson = useCallback((lessonId: string) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set('lessonId', lessonId);
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const persistProgress = useCallback(async (second: number) => {
        const lessonId = activeLessonIdRef.current;
        if (!lessonId) return;

        try {
            const result = await mutateRef.current({
                lessonId,
                lastWatchedSecond: second,
            });

            if (result?.data?.isCompleted) {
                setLocalCompletedMap((prev) => ({ ...prev, [lessonId]: true }));
            }
        } catch {
            return;
        }
    }, []);

    if (!courseId) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <AlertCircle className="size-6 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Không tìm thấy khóa học</h3>
                <p className="text-gray-500 mb-6">Vui lòng kiểm tra lại đường dẫn.</p>
                <Button onClick={() => navigate('/courses')}>Quay lại danh sách</Button>
            </div>
        );
    }

    if (curriculumLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
                <Skeleton className="h-[60vh] w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
            </div>
        );
    }

    if (!curriculum?.length || !activeLesson) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <AlertCircle className="size-6 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Khóa học chưa có nội dung</h3>
                <p className="text-gray-500 mb-6">Khóa học này chưa có bài học nào.</p>
                <Button asChild><Link to="/courses">Khám phá khóa học khác</Link></Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
                <section className="space-y-6">
                    <VideoPlayer
                        lessonId={activeLesson.id}
                        videoUrl={activeLesson.videoUrl ?? ''}
                        initialSecond={lessonProgressData?.data?.lastWatchedSecond ?? 0}
                        onPersistProgress={persistProgress}
                    />

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Bài {allLessons.findIndex((l) => l.id === activeLesson.id) + 1} / {allLessons.length}
                            </p>
                            <h1 className="text-2xl font-black text-gray-900 leading-tight">
                                {activeLesson.title}
                            </h1>
                            {activeLesson.description && (
                                <p className="text-sm text-gray-500 mt-2">{activeLesson.description}</p>
                            )}
                        </div>
                    </div>
                </section>

                <div className="xl:sticky xl:top-8">
                    <LessonSidebar
                        chapters={lessonsForSidebar}
                        activeLessonId={activeLesson.id}
                        onSelectLesson={onSelectLesson}
                    />
                </div>
            </div>
        </div>
    );
}
