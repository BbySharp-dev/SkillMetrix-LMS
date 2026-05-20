import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ClipboardList, Clock, Target, PlayCircle,
    FileText, StickyNote, MessageCircleQuestion, ExternalLink,
    Trash2, Upload } from 'lucide-react';
import { useCourseCurriculum } from '@/features/courses/hooks/useCourses';
import { useLessonProgress, useUpdateLessonProgress } from '@/features/progress/hooks/useProgress';
import { useQuizzesByCourse } from '@/features/quizzes/hooks/useQuizzes';
import {
    useLessonDocuments,
    useCreateLessonDocument,
    useDeleteLessonDocument,
} from '../hooks/useLessonDocuments';
import {
    useLessonNotes,
    useCreateLessonNote,
    useDeleteLessonNote,
    useUpdateLessonNote,
} from '../hooks/useLessonNotes';
import {
    useLessonQuestions,
    useCreateQuestion,
    useDeleteQuestion,
    useCreateAnswer,
    useDeleteAnswer,
} from '../hooks/useLessonQA';
import { useUpload } from '@/features/upload/hooks/useUpload';
import NotesTabContent from '../components/NotesTabContent';
import QATabContent from '../components/QATabContent';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { VideoPlayerProvider } from '../context/VideoPlayerContext';
import { useVideoPlayerContext } from '../context/useVideoPlayerContext';
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
function NotesTabContent({ lessonId }: { lessonId: string }) {
    const [draft, setDraft] = useState('');
    const { data: notes = [], isLoading } = useLessonNotes(lessonId);
    const createNote = useCreateLessonNote();
    const deleteNote = useDeleteLessonNote();
    const { currentTimeRef, seekToRef } = useVideoPlayerContext();
    const [displayTime, setDisplayTime] = useState(0);

    // Sync ref → state for render reactivity
    useEffect(() => {
        const id = setInterval(() => setDisplayTime(Math.floor(currentTimeRef.current)), 500);
        return () => clearInterval(id);
    }, [currentTimeRef]);

    const handleSaveNote = async () => {
        if (!draft.trim()) return;
        await createNote.mutateAsync({
            lessonId,
            content: draft.trim(),
            videoTimestampSeconds: Math.floor(currentTimeRef.current),
        });
        setDraft('');
    };

    const handleSeek = (seconds: number) => {
        seekToRef.current?.(seconds);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSaveNote();
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">Viết ghi chú</label>
                    <span className="text-xs text-gray-400">
                        {Math.floor(displayTime / 60)}:
                        {String(Math.floor(displayTime % 60)).padStart(2, '0')}
                    </span>
                </div>
                <textarea
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    rows={3}
                    placeholder="Viết ghi chú tại thời điểm này của video... (Ctrl+Enter để lưu)"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={createNote.isPending}
                />
                <Button
                    onClick={handleSaveNote}
                    disabled={!draft.trim() || createNote.isPending}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <StickyNote size={14} className="mr-1" />
                    {createNote.isPending ? 'Đang lưu...' : 'Lưu ghi chú'}
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                    <StickyNote size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Chưa có ghi chú nào cho bài học này.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {notes.length} ghi chú
                    </p>
                    {notes.map((note) => (
                        <div key={note.id} className="group relative rounded-xl border border-gray-100 bg-white p-3">
                            <button
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold hover:bg-indigo-700"
                                onClick={() => handleSeek(note.videoTimestampSeconds)}
                                title={`Nhảy đến ${note.formattedTimestamp}`}
                            >
                                {note.formattedTimestamp}
                            </button>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">{note.formattedTimestamp}</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                                    onClick={() => deleteNote.mutate({ lessonId, noteId: note.id })}
                                    disabled={deleteNote.isPending}
                                >
                                    <Trash2 size={12} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function QATabContent({ lessonId }: { lessonId: string }) {
    const [questionDraft, setQuestionDraft] = useState('');
    const [replyMap, setReplyMap] = useState<Record<string, string>>({});
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const userId = useAuthStore((s) => s.user?.id);

    const { data: questions = [], isLoading } = useLessonQuestions(lessonId);
    const createQuestion = useCreateQuestion();
    const deleteQuestion = useDeleteQuestion();
    const createAnswer = useCreateAnswer();
    const deleteAnswer = useDeleteAnswer();
    const { currentTimeRef, seekToRef } = useVideoPlayerContext();

    const handlePostQuestion = async () => {
        if (!questionDraft.trim()) return;
        await createQuestion.mutateAsync({
            lessonId,
            content: questionDraft.trim(),
            videoTimestampSeconds: Math.floor(currentTimeRef.current),
        });
        setQuestionDraft('');
    };

    const handleReply = async (questionId: string) => {
        const content = replyMap[questionId];
        if (!content?.trim()) return;
        await createAnswer.mutateAsync({ lessonId, questionId, content: content.trim() });
        setReplyMap((prev) => { const next = { ...prev }; delete next[questionId]; return next; });
        setExpandedIds((prev) => new Set(prev).add(questionId));
    };

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="space-y-6">
            {/* Ask question */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Đặt câu hỏi</label>
                <textarea
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    rows={3}
                    placeholder="Viết câu hỏi của bạn về bài học này..."
                    value={questionDraft}
                    onChange={(e) => setQuestionDraft(e.target.value)}
                    disabled={createQuestion.isPending}
                />
                <div className="flex justify-end">
                    <Button
                        onClick={handlePostQuestion}
                        disabled={!questionDraft.trim() || createQuestion.isPending}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <MessageCircleQuestion size={14} className="mr-1" />
                        {createQuestion.isPending ? 'Đang gửi...' : 'Gửi câu hỏi'}
                    </Button>
                </div>
            </div>

            {/* Questions list */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <MessageCircleQuestion size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Chưa có câu hỏi nào. Hãy là người đầu tiên!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {questions.length} câu hỏi
                    </p>
                    {questions.map((q) => {
                        const isExpanded = expandedIds.has(q.id);
                        const isOwn = q.userId === userId;
                        return (
                            <div key={q.id} className="space-y-2 rounded-xl border border-gray-100 bg-white overflow-hidden">
                                {/* Question */}
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                                            {q.userFullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-gray-900">{q.userFullName}</span>
                                                {q.formattedTimestamp && (
                                                    <button
                                                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                                                        onClick={() => seekToRef.current?.(q.videoTimestampSeconds!)}
                                                    >
                                                        @ {q.formattedTimestamp}
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700">{q.content}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    className="text-xs text-gray-400 hover:text-indigo-600"
                                                    onClick={() => toggleExpand(q.id)}
                                                >
                                                    {q.answerCount} câu trả lời {isExpanded ? '▲' : '▼'}
                                                </button>
                                                {isOwn && (
                                                    <button
                                                        className="text-xs text-gray-400 hover:text-red-500"
                                                        onClick={() => deleteQuestion.mutate({ lessonId, questionId: q.id })}
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Answers */}
                                {isExpanded && (
                                    <div className="border-t border-gray-50 bg-gray-50 p-4 space-y-3">
                                        {q.answers.map((a) => {
                                            const isOwnAnswer = a.userId === userId;
                                            return (
                                                <div key={a.id} className="flex gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                        {a.userFullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-xs font-bold text-gray-700">{a.userFullName}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600">{a.content}</p>
                                                        {isOwnAnswer && (
                                                            <button
                                                                className="text-xs text-gray-400 hover:text-red-500 mt-0.5"
                                                                onClick={() => deleteAnswer.mutate({ lessonId, answerId: a.id })}
                                                            >
                                                                Xóa
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Reply input */}
                                        <div className="flex gap-2 mt-2">
                                            <textarea
                                                className="flex-1 rounded-lg border border-gray-200 p-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                                                rows={2}
                                                placeholder="Viết câu trả lời..."
                                                value={replyMap[q.id] ?? ''}
                                                onChange={(e) => setReplyMap((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                                disabled={createAnswer.isPending}
                                            />
                                            <Button
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
                                                onClick={() => handleReply(q.id)}
                                                disabled={!replyMap[q.id]?.trim() || createAnswer.isPending}
                                            >
                                                Gửi
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
