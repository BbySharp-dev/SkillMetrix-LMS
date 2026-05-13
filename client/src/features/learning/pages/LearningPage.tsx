import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ClipboardList, Clock, Target, PlayCircle } from 'lucide-react';
import { useCourseCurriculum } from '@/features/courses/hooks/useCourses';
import { useLessonProgress, useUpdateLessonProgress } from '@/features/progress/hooks/useProgress';
import { useQuizzesByCourse } from '@/features/quizzes/hooks/useQuizzes';
import LessonSidebar from '../components/LessonSidebar';
import VideoPlayer from '../components/VideoPlayer';
import { Skeleton } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';

export default function LearningPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [localCompletedMap, setLocalCompletedMap] = useState<Record<string, boolean>>({});

    const { data: curriculum, isLoading: curriculumLoading } = useCourseCurriculum(courseId);
    const { data: quizzes = [] } = useQuizzesByCourse(courseId);

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
    const activeLessonIdRef = useRef(activeLesson?.id);

    useEffect(() => {
        mutateRef.current = updateProgressMutation.mutateAsync;
        activeLessonIdRef.current = activeLesson?.id;
    }, [updateProgressMutation.mutateAsync, activeLesson?.id]);

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

                <div className="xl:sticky xl:top-8 space-y-4">
                    <LessonSidebar
                        chapters={lessonsForSidebar}
                        activeLessonId={activeLesson.id}
                        onSelectLesson={onSelectLesson}
                    />

                    {quizzes.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="size-4 text-indigo-600" />
                                    <h3 className="text-sm font-black text-gray-900">Bài kiểm tra</h3>
                                    <Badge className="ml-auto bg-indigo-600 text-white text-[10px]">{quizzes.length}</Badge>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {quizzes.map((quiz) => (
                                    <Link
                                        key={quiz.id}
                                        to={`/quiz/${quiz.id}`}
                                        className="flex items-center gap-3 px-5 py-4 hover:bg-indigo-50/50 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                            <ClipboardList className="size-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{quiz.title}</p>
                                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                <span className="flex items-center gap-1">
                                                    <Target className="size-3" />
                                                    Đạt {quiz.passingScore}%
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <PlayCircle className="size-3" />
                                                    {quiz.questionCount} câu
                                                </span>
                                                {quiz.timeLimitMinutes && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {quiz.timeLimitMinutes}p
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                                            <svg className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}