import { useState, useMemo, useCallback } from 'react';
import {
    Plus,
    GripVertical,
    Edit2,
    Trash2,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    Video,
    Layers,
    BookOpen,
    ListChecks,
    PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import ChapterEditorModal from './ChapterEditorModal';
import LessonEditorModal from './LessonEditorModal';

import { useParams } from 'react-router-dom';
import { useCurriculum, useChapterMutations, useLessonMutations, useQuizMutations } from '../hooks/useCurriculum';
import type { ChapterWithLessonsDto, LessonDto, CourseQuizDto } from '../types';
import QuizEditorModal from './QuizEditorModal';

interface CurriculumEditorProps {
    courseId?: string;
}

export default function CurriculumEditor({ courseId: propCourseId }: CurriculumEditorProps) {
    const { id: paramId } = useParams<{ id: string }>();
    const courseId = propCourseId ?? (paramId === 'new' ? undefined : paramId);
    const { data: chapters = [], isLoading } = useCurriculum(courseId ?? '');
    const { createChapter, updateChapter, deleteChapter, reorderChapter } = useChapterMutations(courseId ?? '');
    const { createLesson, updateLesson, deleteLesson, uploadVideo } = useLessonMutations(courseId ?? '');
    const { createQuiz, updateQuiz, deleteQuiz } = useQuizMutations(courseId ?? '');

    const [expandedChapters, setExpandedChapters] = useState<string[]>([]);

    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<ChapterWithLessonsDto | null>(null);
    const [editingLesson, setEditingLesson] = useState<LessonDto | null>(null);
    const [targetChapterId, setTargetChapterId] = useState<string | null>(null);
    const [draggingLessonId] = useState<string | null>(null);

    // Quiz modal state
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<CourseQuizDto | null>(null);
    // 'chapter' = quiz at chapter level (after all lessons), 'lesson' = quiz for a specific lesson
    const [quizTarget, setQuizTarget] = useState<{ type: 'chapter' | 'lesson'; id: string } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const toggleChapter = useCallback((id: string) => {
        setExpandedChapters((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = chapters.findIndex((i) => i.id === active.id);
            const newIndex = chapters.findIndex((i) => i.id === over.id);
            reorderChapter.mutate({ id: active.id as string, data: { oldIndex, newIndex } });
        }
    };

    const handleAddChapter = () => {
        setEditingChapter(null);
        setIsChapterModalOpen(true);
    };

    const handleEditChapter = (chapter: ChapterWithLessonsDto) => {
        setEditingChapter(chapter);
        setIsChapterModalOpen(true);
    };

    const handleAddLesson = (chapterId: string) => {
        setTargetChapterId(chapterId);
        setEditingLesson(null);
        setIsLessonModalOpen(true);
        // Auto-expand so user can see the new lesson after creation
        if (!expandedChapters.includes(chapterId)) {
            setExpandedChapters((prev) => [...prev, chapterId]);
        }
    };

    const handleEditLesson = useCallback((lesson: LessonDto) => {
        setEditingLesson(lesson);
        setIsLessonModalOpen(true);
    }, []);

    const handleSaveChapter = (data: { title: string }) => {
        if (!courseId) return;
        if (editingChapter) {
            updateChapter.mutate({ id: editingChapter.id, data });
        } else {
            createChapter.mutate(data);
        }
        setIsChapterModalOpen(false);
    };

    const handleSaveLesson = (data: { title: string; isFreePreview: boolean; videoUrl?: string | null; durationSeconds?: number }) => {
        if (!courseId) return;
        if (editingLesson) {
            updateLesson.mutate({ id: editingLesson.id, data });
            setIsLessonModalOpen(false);
        } else if (targetChapterId) {
            createLesson.mutate(
                { chapterId: targetChapterId, data },
                {
                    onSuccess: (newLesson) => {
                        const created = newLesson as unknown as LessonDto;
                        setEditingLesson(created);
                        setIsLessonModalOpen(false);
                    },
                }
            );
        }
    };

    const handleUploadVideo = async (lessonId: string, file: File, durationSeconds?: number) => {
        const updated = await uploadVideo.mutateAsync({ id: lessonId, file, durationSeconds });
        setEditingLesson(updated as unknown as LessonDto);
    };

    const handleDeleteChapter = (chapter: ChapterWithLessonsDto) => {
        const msg =
            chapter.lessons.length > 0
                ? `Xóa chương "${chapter.title}" sẽ xóa ${chapter.lessons.length} bài học bên trong. Bạn chắc chứ?`
                : `Xóa chương "${chapter.title}"?`;
        if (confirm(msg)) deleteChapter.mutate(chapter.id);
    };

    const handleDeleteLesson = (lesson: LessonDto) => {
        if (confirm(`Xóa bài học "${lesson.title}"?`)) {
            deleteLesson.mutate(lesson.id);
        }
    };

    // ─── Quiz handlers ─────────────────────────────────────────────────────────
    const handleAddQuiz = (target: 'chapter' | 'lesson', targetId: string) => {
        setEditingQuiz(null);
        setQuizTarget({ type: target, id: targetId });
        setIsQuizModalOpen(true);
    };

    const handleEditQuiz = (quiz: CourseQuizDto) => {
        setEditingQuiz(quiz);
        setQuizTarget(null);
        setIsQuizModalOpen(true);
    };

    const handleDeleteQuiz = (quiz: CourseQuizDto) => {
        if (confirm(`Xóa quiz "${quiz.title}"?`)) {
            deleteQuiz.mutate(quiz.id);
        }
    };

    const handleSaveQuiz = (data: {
        title: string;
        description?: string;
        passingScore: number;
        timeLimitMinutes?: number | null;
        maxAttempts: number;
        isFinalQuiz: boolean;
    }) => {
        if (!courseId) return;
        if (editingQuiz) {
            updateQuiz.mutate({
                id: editingQuiz.id,
                data: { ...data, chapterId: editingQuiz.chapterId, lessonId: editingQuiz.lessonId },
            });
        } else if (quizTarget) {
            createQuiz.mutate({
                courseId,
                chapterId: quizTarget.type === 'chapter' ? quizTarget.id : null,
                lessonId: quizTarget.type === 'lesson' ? quizTarget.id : null,
                ...data,
            });
        }
        setIsQuizModalOpen(false);
    };

    const chapterIds = useMemo(() => chapters.map((c) => c.id), [chapters]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="size-9 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-400">Đang tải cấu trúc khóa học...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!courseId ? (
                <div className="text-center py-16 px-6 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200">
                    <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="size-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">Hãy lưu khóa học trước khi thêm chương.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Cấu trúc khóa học</h3>
                            <p className="text-xs font-bold text-gray-400 mt-0.5">
                                {chapters.length} chương · {chapters.reduce((acc, c) => acc + c.lessons.length, 0)} bài học
                            </p>
                        </div>
                        <Button
                            onClick={handleAddChapter}
                            className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-xs shadow-sm transition-colors gap-2"
                        >
                            <Plus className="size-4" />
                            Thêm chương
                        </Button>
                    </div>

                    {/* Empty state */}
                    {chapters.length === 0 && (
                        <div className="text-center py-14 px-8 rounded-3xl bg-linear-to-br from-gray-50 to-indigo-50/40 border-2 border-dashed border-indigo-100">
                            <div className="size-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                                <Layers className="size-7 text-indigo-500" />
                            </div>
                            <p className="font-black text-gray-700 text-base mb-1">Chưa có chương nào</p>
                            <p className="text-sm text-gray-400 font-medium mb-5">
                                Bắt đầu bằng cách thêm chương đầu tiên cho khóa học của bạn.
                            </p>
                            <Button
                                onClick={handleAddChapter}
                                className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-xs shadow-sm transition-colors gap-2"
                            >
                                <Plus className="size-4" />
                                Thêm chương đầu tiên
                            </Button>
                        </div>
                    )}

                    {/* Chapter list */}
                    {chapters.length > 0 && (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={chapterIds} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3">
                                    {chapters.map((chapter, index) => {
                                        const isExpanded = expandedChapters.includes(chapter.id);
                                        return (
                                            <SortableItem key={chapter.id} id={chapter.id}>
                                                {({ listeners }: { listeners?: Record<string, unknown> }) => (
                                                    <div
                                                        className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-200 ${
                                                            isExpanded
                                                                ? 'border-indigo-200 shadow-md'
                                                                : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                                                        }`}
                                                    >
                                                        {/* Chapter header bar */}
                                                        <div className="flex items-center gap-3 p-4 bg-linear-to-r from-gray-50/80 to-white">
                                                            {/* Drag handle */}
                                                            <div
                                                                {...listeners}
                                                                className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                                                            >
                                                                <GripVertical className="size-5" />
                                                            </div>

                                                            {/* Chapter number badge */}
                                                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0">
                                                                {index + 1}
                                                            </span>

                                                            {/* Title & subtitle */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-black text-gray-900 truncate">{chapter.title}</p>
                                                                <p className="text-[11px] text-gray-400 font-bold mt-0.5">
                                                                    {chapter.lessons.length} bài học
                                                                </p>
                                                            </div>

                                                            {/* Action buttons — always visible */}
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {/* Add lesson */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleAddLesson(chapter.id)}
                                                                    className="h-8 px-3 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-black text-xs gap-1 transition-colors"
                                                                >
                                                                    <Plus className="size-3.5" />
                                                                    Bài học
                                                                </Button>

                                                                {/* Edit chapter */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditChapter(chapter)}
                                                                    className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                                                >
                                                                    <Edit2 className="size-3.5" />
                                                                </Button>

                                                                {/* Delete chapter */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteChapter(chapter)}
                                                                    className="h-8 w-8 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </Button>

                                                                {/* Expand / collapse */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => toggleChapter(chapter.id)}
                                                                    className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="size-4" />
                                                                    ) : (
                                                                        <ChevronDown className="size-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Lesson list — smooth height animation */}
                                                        <div
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                                                transition: 'grid-template-rows 0.3s ease-in-out',
                                                            }}
                                                        >
                                                            <div style={{ overflow: 'hidden' }}>
                                                                <div className="px-4 pb-4 pt-2 space-y-2">
                                                                    {chapter.lessons.length === 0 ? (
                                                                        <div className="text-center py-8 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                                                                            <Video className="size-6 text-gray-300 mx-auto mb-2" />
                                                                            <p className="text-xs font-bold text-gray-400">
                                                                                Chưa có bài học nào. Nhấn "+ Bài học" để thêm.
                                                                            </p>
                                                                        </div>
                                                                    ) : (
                                                                        chapter.lessons.map((lesson) => (
                                                                            <div
                                                                                key={lesson.id}
                                                                                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${
                                                                                    draggingLessonId === lesson.id
                                                                                        ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                                                                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                                                }`}
                                                                            >
                                                                                {/* Video status icon */}
                                                                                <div
                                                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                                                                                        lesson.videoUrl ? 'bg-emerald-50' : 'bg-orange-50'
                                                                                    }`}
                                                                                >
                                                                                    {lesson.videoUrl ? (
                                                                                        <PlayCircle className="size-4 text-emerald-600" />
                                                                                    ) : (
                                                                                        <Video className="size-4 text-orange-400" />
                                                                                    )}
                                                                                </div>

                                                                                {/* Title, duration, badges */}
                                                                                <div
                                                                                    className="flex-1 min-w-0 cursor-pointer"
                                                                                    onClick={() => handleEditLesson(lesson)}
                                                                                >
                                                                                    <p className="font-bold text-gray-900 text-sm truncate">{lesson.title}</p>
                                                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                                                            <FileText className="size-2.5" />
                                                                                            {Math.floor(lesson.durationSeconds / 60)}:{(lesson.durationSeconds % 60).toString().padStart(2, '0')}
                                                                                        </span>
                                                                                        {lesson.isFreePreview && (
                                                                                            <Badge className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase border-emerald-100 px-1.5 py-0">
                                                                                                Preview
                                                                                            </Badge>
                                                                                        )}
                                                                                        {!lesson.videoUrl && (
                                                                                            <Badge className="bg-orange-50 text-orange-400 text-[9px] font-black uppercase border-orange-100 px-1.5 py-0">
                                                                                                Chưa có video
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Edit & Delete — always visible with subtle opacity */}
                                                                                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity shrink-0">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleEditLesson(lesson);
                                                                                        }}
                                                                                        className="h-7 w-7 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-indigo-600 transition-colors"
                                                                                    >
                                                                                        <Edit2 className="size-3" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDeleteLesson(lesson);
                                                                                        }}
                                                                                        className="h-7 w-7 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-300 hover:text-red-500 transition-colors"
                                                                                    >
                                                                                        <Trash2 className="size-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )}

                                                                    {/* Add lesson button */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => handleAddLesson(chapter.id)}
                                                                        className="w-full h-10 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all gap-2 mt-2"
                                                                    >
                                                                        <Plus className="size-3.5" />
                                                                        Thêm bài học
                                                                    </Button>

                                                                    {/* Quiz section */}
                                                                    <div className="pt-2">
                                                                        {/* Existing chapter quizzes */}
                                                                        {chapter.quizzes?.map((quiz) => (
                                                                            <div
                                                                                key={quiz.id}
                                                                                className="group flex items-center gap-3 p-3 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 transition-all"
                                                                            >
                                                                                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                                                                    <ListChecks className="size-4 text-purple-600" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEditQuiz(quiz)}>
                                                                                    <p className="font-bold text-gray-900 text-sm truncate">{quiz.title}</p>
                                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                                        <span className="text-[10px] font-bold text-gray-400">
                                                                                            {quiz.questionCount} câu · Đạt {quiz.passingScore}%
                                                                                        </span>
                                                                                        {quiz.isFinalQuiz && (
                                                                                            <Badge className="bg-purple-100 text-purple-700 text-[9px] font-black uppercase border-purple-200 px-1.5 py-0">
                                                                                                Final
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={() => handleEditQuiz(quiz)}
                                                                                        className="h-7 w-7 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-indigo-600 transition-colors"
                                                                                    >
                                                                                        <Edit2 className="size-3" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={() => handleDeleteQuiz(quiz)}
                                                                                        className="h-7 w-7 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-300 hover:text-red-500 transition-colors"
                                                                                    >
                                                                                        <Trash2 className="size-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ))}

                                                                        {/* Add quiz button */}
                                                                        <Button
                                                                            variant="ghost"
                                                                            onClick={() => handleAddQuiz('chapter', chapter.id)}
                                                                            className="w-full h-10 rounded-xl border-2 border-dashed border-purple-200 text-purple-400 hover:border-purple-400 hover:bg-purple-50/40 hover:text-purple-600 font-black text-xs uppercase tracking-widest transition-all gap-2 mt-1"
                                                                        >
                                                                            <PlusCircle className="size-3.5" />
                                                                            Thêm Quiz cuối chương
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </SortableItem>
                                        );
                                    })}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}

                    {/* Footer add chapter */}
                    {chapters.length > 0 && (
                        <Button
                            onClick={handleAddChapter}
                            className="w-full h-12 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all gap-2"
                        >
                            <Plus className="size-4" />
                            Thêm chương mới
                        </Button>
                    )}
                </div>
            )}

            <ChapterEditorModal
                open={isChapterModalOpen}
                onOpenChange={setIsChapterModalOpen}
                initialData={editingChapter ?? undefined}
                onSave={handleSaveChapter}
            />

            <LessonEditorModal
                open={isLessonModalOpen}
                onOpenChange={setIsLessonModalOpen}
                initialData={editingLesson}
                onSave={handleSaveLesson}
                onUploadVideo={handleUploadVideo}
                isUploading={uploadVideo.isPending}
            />

            <QuizEditorModal
                open={isQuizModalOpen}
                onOpenChange={setIsQuizModalOpen}
                initialData={editingQuiz}
                onSave={handleSaveQuiz}
            />
        </div>
    );
}
