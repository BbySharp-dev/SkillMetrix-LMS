import { useState } from 'react';
import { 
    Plus, 
    GripVertical, 
    Edit2, 
    Trash2, 
    PlayCircle, 
    ChevronDown, 
    ChevronUp,
    FileText,
    MoreVertical,
    Video
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
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
import { useCurriculum, useChapterMutations, useLessonMutations } from '../hooks/useCurriculum';
import type { ChapterWithLessonsDto, LessonDto } from '../types';

interface CurriculumEditorProps {
    courseId?: string;
}

export default function CurriculumEditor({ courseId: propCourseId }: CurriculumEditorProps) {
    const { id: paramId } = useParams<{ id: string }>();
    const courseId = propCourseId ?? (paramId === 'new' ? undefined : paramId);
    const { data: chapters = [], isLoading } = useCurriculum(courseId ?? '');
    const { createChapter, updateChapter, deleteChapter, reorderChapter } = useChapterMutations(courseId ?? '');
    const { createLesson, updateLesson, deleteLesson, uploadVideo } = useLessonMutations(courseId ?? '');

    const [expandedChapters, setExpandedChapters] = useState<string[]>([]);

    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<ChapterWithLessonsDto | null>(null);
    const [editingLesson, setEditingLesson] = useState<LessonDto | null>(null);
    const [targetChapterId, setTargetChapterId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const toggleChapter = (id: string) => {
        setExpandedChapters(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = chapters.findIndex((i) => i.id === active.id);
            const newIndex = chapters.findIndex((i) => i.id === over.id);
            
            reorderChapter.mutate({
                id: active.id as string,
                data: { oldIndex, newIndex }
            });
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
    };

    const handleEditLesson = (lesson: LessonDto) => {
        setEditingLesson(lesson);
        setIsLessonModalOpen(true);
    };

    const handleSaveChapter = (data: { title: string }) => {
        if (!courseId) return;
        if (editingChapter) {
            updateChapter.mutate({ id: editingChapter.id, data });
        } else {
            createChapter.mutate(data);
        }
        setIsChapterModalOpen(false);
    };

    const handleSaveLesson = (data: { title: string, isFreePreview: boolean }) => {
        if (!courseId) return;
        if (editingLesson) {
            updateLesson.mutate({ id: editingLesson.id, data });
            setIsLessonModalOpen(false);
        } else if (targetChapterId) {
            createLesson.mutate(
                { chapterId: targetChapterId, data },
                {
                    onSuccess: (newLesson) => {
                        setEditingLesson(newLesson as unknown as LessonDto);
                    },
                }
            );
        }
    };

    const handleUploadVideo = async (lessonId: string, file: File) => {
        const updated = await uploadVideo.mutateAsync({ id: lessonId, file });
        setEditingLesson(updated as unknown as LessonDto);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="size-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }



    return (
        <div className="space-y-6">
            {!courseId ? (
                <div className="text-center py-12 text-sm font-bold text-gray-400">
                    Hãy lưu khóa học trước khi thêm chương.
                </div>
            ) : (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Cấu trúc khóa học</h3>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            {chapters.length} chương • {chapters.reduce((acc, c) => acc + c.lessons.length, 0)} bài học
                        </p>
                    </div>
                    <Button 
                        onClick={handleAddChapter}
                        disabled={!courseId}
                        className="h-10 px-4 rounded-xl bg-gray-900 font-black text-xs uppercase tracking-widest"
                    >
                        <Plus className="size-4 mr-2" />
                        Thêm chương mới
                    </Button>
                </div>

            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={chapters.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {chapters.map((chapter, index) => (
                            <SortableItem key={chapter.id} id={chapter.id}>
                                {({ listeners }: { listeners?: Record<string, unknown> }) => (
                                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className="p-5 flex items-center gap-4 bg-gray-50/50">
                                            <div 
                                                {...listeners}
                                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <GripVertical className="size-5" />
                                            </div>
                                            <div className="flex-1 flex items-center gap-3">
                                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-widest">
                                                    Chương {index + 1}
                                                </span>
                                                <h4 className="font-black text-gray-900">{chapter.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => toggleChapter(chapter.id)}
                                                    className="rounded-xl hover:bg-white"
                                                >
                                                    {expandedChapters.includes(chapter.id) ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl border-gray-100">
                                                        <DropdownMenuItem 
                                                            onClick={() => handleEditChapter(chapter)}
                                                            className="rounded-lg py-2 font-bold text-sm cursor-pointer"
                                                        >
                                                            <Edit2 className="size-4 mr-3 text-gray-400" />
                                                            Đổi tên chương
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                if (confirm('Xóa chương này sẽ xóa tất cả bài học bên trong. Bạn chắc chứ?')) {
                                                                    deleteChapter.mutate(chapter.id);
                                                                }
                                                            }}
                                                            className="rounded-lg py-2 font-bold text-sm text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600"
                                                        >
                                                            <Trash2 className="size-4 mr-3" />
                                                            Xóa chương
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {expandedChapters.includes(chapter.id) && (
                                            <div className="p-4 pt-0 space-y-2">
                                                <div className="border-t border-gray-100 mt-0 pt-4">
                                                    {chapter.lessons.map((lesson) => (
                                                        <div key={lesson.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                                            <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="flex items-center gap-3 flex-1 cursor-pointer group/lesson"
                                                                        onClick={() => handleEditLesson(lesson)}
                                                                    >
                                                                        <div className="cursor-grab active:cursor-grabbing text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <GripVertical className="size-4" />
                                                                        </div>
                                                                        <div className={lesson.videoUrl ? 'w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shadow-sm' : 'w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shadow-sm'}>
                                                                            {lesson.videoUrl
                                                                                ? <PlayCircle className="size-4 text-emerald-600" />
                                                                                : <Video className="size-4 text-orange-500" />}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-bold text-gray-900">{lesson.title}</span>
                                                                                {lesson.isFreePreview && (
                                                                                    <Badge className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border-emerald-100 px-1.5 py-0">
                                                                                        Preview
                                                                                    </Badge>
                                                                                )}
                                                                                {!lesson.videoUrl && (
                                                                                    <Badge className="bg-orange-50 text-orange-500 text-[9px] font-black uppercase tracking-widest border-orange-100 px-1.5 py-0">
                                                                                        Chưa có video
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                                                                <FileText className="size-3" />
                                                                                {Math.floor(lesson.durationSeconds / 60)}:{(lesson.durationSeconds % 60).toString().padStart(2, '0')}
                                                                                {lesson.videoUrl && <span className="text-emerald-400">• Đã có video</span>}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleEditLesson(lesson)}
                                                                            className="h-8 w-8 rounded-lg hover:bg-white border border-transparent hover:border-gray-200"
                                                                        >
                                                                            <Edit2 className="size-3.5 text-gray-500" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                if (confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
                                                                                    deleteLesson.mutate(lesson.id);
                                                                                }
                                                                            }}
                                                                            className="h-8 w-8 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-red-500 hover:text-red-600"
                                                                        >
                                                                            <Trash2 className="size-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                        </div>
                                                    ))}
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleAddLesson(chapter.id)}
                                                        className="w-full mt-4 h-11 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 hover:border-indigo-200 hover:bg-indigo-50/30 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all"
                                                    >
                                                        <Plus className="size-4 mr-2" />
                                                        Thêm bài học mới
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

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
            </div>
            )}
        </div>
    );
}
