import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ClipboardList, Clock, Target, PlayCircle,
    FileText, ExternalLink,
    Trash2, Upload } from 'lucide-react';
import { useCourseCurriculum } from '@/features/courses/hooks/useCourses';
import { useLessonProgress, useUpdateLessonProgress } from '@/features/progress/hooks/useProgress';
import { useQuizzesByCourse } from '@/features/quizzes/hooks/useQuizzes';

import { useLessonDocuments, useCreateLessonDocument, useDeleteLessonDocument } from '../hooks/useLessonDocuments';
import { useUpload } from '@/features/upload/hooks/useUpload';
import NotesTabContent from '../components/NotesTabContent';
import QATabContent from '../components/QATabContent';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { VideoPlayerProvider } from '../context/VideoPlayerContext';
import LessonSidebar from '../components/LessonSidebar';
import VideoPlayer from '../components/VideoPlayer';
import { Skeleton } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs';

export default function LearningPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [localCompletedMap, setLocalCompletedMap] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<string>('video');

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

    // Document hooks
    const { data: documents = [], isLoading: docsLoading } = useLessonDocuments(activeLesson?.id);
    const createDocMutation = useCreateLessonDocument();
    const deleteDocMutation = useDeleteLessonDocument();
    const { uploadDocument } = useUpload();
    const userRole = useAuthStore((s) => s.user?.role);
    const canManageDocs = userRole === 'Admin' || userRole === 'Instructor';

    const handleAddDocument = async (file: File) => {
        if (!activeLesson?.id) return;
        const uploaded = await uploadDocument.mutateAsync(file);
        await createDocMutation.mutateAsync({
            lessonId: activeLesson.id,
            payload: {
                fileName: uploaded.fileName,
                fileUrl: uploaded.url,
                fileType: uploaded.fileType,
                fileSizeBytes: uploaded.fileSizeBytes,
                orderIndex: documents.length,
            },
        });
    };

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
        <VideoPlayerProvider>
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

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList variant="line" className="gap-4 bg-transparent p-0 border-b border-border rounded-none">
                            <TabsTrigger
                                value="video"
                                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent pb-3 px-1 font-bold transition-colors"
                            >
                                Video
                            </TabsTrigger>
                            <TabsTrigger
                                value="documents"
                                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent pb-3 px-1 font-bold transition-colors"
                            >
                                Tài liệu
                            </TabsTrigger>
                            <TabsTrigger
                                value="notes"
                                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent pb-3 px-1 font-bold transition-colors"
                            >
                                Ghi chú
                            </TabsTrigger>
                            <TabsTrigger
                                value="qa"
                                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent pb-3 px-1 font-bold transition-colors"
                            >
                                Q&A
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="video" className="mt-4">
                            <p className="text-sm text-gray-500 italic">
                                Video đang phát ở trên. Hoàn thành bài học để chuyển sang bài tiếp theo.
                            </p>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-4">
                                {canManageDocs && (
                                    <div className="mb-4">
                                        <AddDocumentButton onAdd={handleAddDocument} isLoading={uploadDocument.isPending || createDocMutation.isPending} />
                                    </div>
                                )}

                                {docsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">
                                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Chưa có tài liệu cho bài học này.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {documents.map((doc) => (
                                            <DocumentCard
                                                key={doc.id}
                                                doc={doc}
                                                canDelete={canManageDocs}
                                                onDelete={() =>
                                                    deleteDocMutation.mutate({ lessonId: activeLesson!.id, docId: doc.id })
                                                }
                                                isDeleting={deleteDocMutation.isPending}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="notes" className="mt-4">
                            <NotesTabContent lessonId={activeLesson.id} />
                        </TabsContent>

                        <TabsContent value="qa" className="mt-4">
                            <QATabContent lessonId={activeLesson.id} />
                        </TabsContent>
                    </Tabs>
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
        </VideoPlayerProvider>
    );
}

function AddDocumentButton({ onAdd, isLoading }: { onAdd: (file: File) => void; isLoading: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onAdd(file);
            e.target.value = '';
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.zip,.rar,.7z,.txt,.csv,.mp3,.mp4,.wav"
                className="hidden"
                onChange={handleFileChange}
            />
            <Button
                variant="outline"
                className="w-full border-dashed border-2"
                onClick={() => inputRef.current?.click()}
                disabled={isLoading}
            >
                <Upload size={16} className="mr-2" />
                {isLoading ? 'Đang tải lên...' : 'Thêm tài liệu'}
            </Button>
        </>
    );
}

const FILE_TYPE_COLORS: Record<string, string> = {
    pdf: 'text-red-500 bg-red-50',
    docx: 'text-blue-500 bg-blue-50',
    doc: 'text-blue-500 bg-blue-50',
    xlsx: 'text-green-500 bg-green-50',
    xls: 'text-green-500 bg-green-50',
    pptx: 'text-orange-500 bg-orange-50',
    ppt: 'text-orange-500 bg-orange-50',
    zip: 'text-yellow-600 bg-yellow-50',
    rar: 'text-yellow-600 bg-yellow-50',
    txt: 'text-gray-500 bg-gray-50',
    csv: 'text-green-500 bg-green-50',
    mp3: 'text-purple-500 bg-purple-50',
    mp4: 'text-purple-500 bg-purple-50',
    wav: 'text-purple-500 bg-purple-50',
};

function DocumentCard({
    doc,
    canDelete,
    onDelete,
    isDeleting,
}: {
    doc: import('@/features/courses/types').LessonDocumentDto;
    canDelete: boolean;
    onDelete: () => void;
    isDeleting: boolean;
}) {
    const colorClass = FILE_TYPE_COLORS[doc.fileType.toLowerCase()] ?? 'text-gray-500 bg-gray-50';

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${colorClass}`}>
                {doc.fileTypeLabel}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{doc.title ?? doc.fileName}</p>
                <p className="text-xs text-gray-400">{doc.formattedSize}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-blue-600"
                    asChild
                >
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} />
                    </a>
                </Button>
                {canDelete && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-red-600"
                        onClick={onDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 size={14} />
                    </Button>
                )}
            </div>
        </div>
    );
}
