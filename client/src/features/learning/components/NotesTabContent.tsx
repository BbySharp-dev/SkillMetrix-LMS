import { useState, useRef, useEffect } from 'react';
import { StickyNote, Clock, Trash2, Edit3, Check, X } from 'lucide-react';
import { useLessonNotes, useCreateLessonNote, useUpdateLessonNote, useDeleteLessonNote } from '../hooks/useLessonNotes';
import { useVideoPlayerContext } from '../context/useVideoPlayerContext';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Badge } from '@/components/ui';
import type { LessonNoteDto } from '@/features/courses/types';

interface NotesTabContentProps {
    lessonId: string;
}

function NoteItem({
    note,
    onDelete,
    onUpdate,
    onSeek,
}: {
    note: LessonNoteDto;
    onDelete: (noteId: string) => void;
    onUpdate: (noteId: string, content: string) => void;
    onSeek: (seconds: number) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(note.content);

    const handleSave = () => {
        if (!editValue.trim()) return;
        onUpdate(note.id, editValue.trim());
        setEditing(false);
    };

    const handleCancel = () => {
        setEditValue(note.content);
        setEditing(false);
    };

    return (
        <div className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
            <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                    <button
                        onClick={() => onSeek(note.videoTimestampSeconds)}
                        title={`Nhảy đến ${note.formattedTimestamp}`}
                        className="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                    >
                        <Clock className="size-3" />
                        {note.formattedTimestamp}
                    </button>
                </div>
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="min-h-15 text-sm"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button size="sm" className="h-7 px-3 text-xs font-bold" onClick={handleSave}>
                                    <Check className="size-3 mr-1" /> Lưu
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 px-3 text-xs font-bold" onClick={handleCancel}>
                                    <X className="size-3 mr-1" /> Hủy
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(note.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </>
                    )}
                </div>
                {!editing && (
                    <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600" onClick={() => setEditing(true)}>
                            <Edit3 className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => onDelete(note.id)}>
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function NotesTabContent({ lessonId }: NotesTabContentProps) {
    const [newNote, setNewNote] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { data: notes = [], isLoading } = useLessonNotes(lessonId);
    const createNote = useCreateLessonNote();
    const updateNote = useUpdateLessonNote();
    const deleteNote = useDeleteLessonNote();
    const { currentTimeRef, seekToRef } = useVideoPlayerContext();

    const handleCreate = async () => {
        if (!newNote.trim()) return;
        await createNote.mutateAsync({
            lessonId,
            content: newNote.trim(),
            videoTimestampSeconds: Math.floor(currentTimeRef.current),
        });
        setNewNote('');
        inputRef.current?.focus();
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleUpdate = (noteId: string, content: string) => {
        updateNote.mutate({ lessonId, noteId, content });
    };

    const handleDelete = (noteId: string) => {
        deleteNote.mutate({ lessonId, noteId });
    };

    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');

    useEffect(() => {
        const update = () => {
            const s = Math.floor(currentTimeRef.current);
            const mm = Math.floor(s / 60).toString().padStart(2, '0');
            const ss = (s % 60).toString().padStart(2, '0');
            setCurrentTimestamp(`${mm}:${ss}`);
        };
        update();
        const interval = setInterval(update, 500);
        return () => clearInterval(interval);
    }, [currentTimeRef]);

    const handleSeek = (seconds: number) => {
        seekToRef.current?.(seconds);
    };

    return (
        <div className="space-y-4">
            {/* Create note */}
            <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                        <StickyNote className="size-3.5" />
                        Ghi chú tại
                        <Badge variant="outline" className="font-mono text-[10px] text-indigo-600 border-indigo-200 bg-white">
                            <Clock className="size-3 mr-0.5" />
                            {currentTimestamp}
                        </Badge>
                    </span>
                </div>
                <Textarea
                    ref={inputRef}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Viết ghi chú của bạn tại thời điểm này..."
                    className="min-h-20 text-sm resize-none bg-white"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            handleCreate();
                        }
                    }}
                />
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                        onClick={handleCreate}
                        disabled={!newNote.trim() || createNote.isPending}
                    >
                        <StickyNote className="size-3.5 mr-1.5" />
                        Lưu ghi chú
                    </Button>
                </div>
            </div>

            {/* Notes list */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <StickyNote size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Chưa có ghi chú nào cho bài học này.</p>
                    <p className="text-xs mt-1">Nhấn <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500">Ctrl+Enter</kbd> để lưu nhanh.</p>
                </div>
            ) : (
                <div ref={listRef} className="space-y-3">
                    {notes.map((note) => (
                        <NoteItem
                            key={note.id}
                            note={note}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onSeek={handleSeek}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
