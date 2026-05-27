import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { lessonNotesApi } from '../api/lessonNotesApi';

export function useLessonNotes(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-notes', lessonId],
    queryFn: () => lessonNotesApi.getAll(lessonId!),
    enabled: !!lessonId,
  });
}

export function useCreateLessonNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      content,
      videoTimestampSeconds,
    }: {
      lessonId: string;
      content: string;
      videoTimestampSeconds: number;
    }) =>
      lessonNotesApi.create(lessonId, { content, videoTimestampSeconds }),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
      toast.success('Đã lưu ghi chú.');
    },
    onError: () => {
      toast.error('Lưu ghi chú thất bại.');
    },
  });
}

export function useUpdateLessonNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      noteId,
      content,
    }: {
      lessonId: string;
      noteId: string;
      content: string;
    }) => lessonNotesApi.update(lessonId, noteId, { content }),
    onMutate: async ({ lessonId, noteId, content }) => {
      await qc.cancelQueries({ queryKey: ['lesson-notes', lessonId] });
      const prev = qc.getQueryData<import('@/features/courses/types').LessonNoteDto[]>(
        ['lesson-notes', lessonId]
      );
      qc.setQueryData<import('@/features/courses/types').LessonNoteDto[]>(
        ['lesson-notes', lessonId],
        (old) => old?.map((n) => n.id === noteId ? { ...n, content } : n)
      );
      return { prev };
    },
    onError: (_, { lessonId }, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['lesson-notes', lessonId], ctx.prev);
      }
      toast.error('Cập nhật thất bại.');
    },
    onSettled: (_, __, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
    },
    onSuccess: () => {
      toast.success('Đã cập nhật ghi chú.');
    },
  });
}

export function useDeleteLessonNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, noteId }: { lessonId: string; noteId: string }) =>
      lessonNotesApi.delete(lessonId, noteId),
    onMutate: async ({ lessonId, noteId }) => {
      await qc.cancelQueries({ queryKey: ['lesson-notes', lessonId] });
      const prev = qc.getQueryData<import('@/features/courses/types').LessonNoteDto[]>(
        ['lesson-notes', lessonId]
      );
      qc.setQueryData<import('@/features/courses/types').LessonNoteDto[]>(
        ['lesson-notes', lessonId],
        (old) => old?.filter((n) => n.id !== noteId)
      );
      return { prev };
    },
    onError: (_, { lessonId }, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['lesson-notes', lessonId], ctx.prev);
      }
      toast.error('Xóa thất bại.');
    },
    onSettled: (_, __, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
    },
    onSuccess: () => {
      toast.success('Đã xóa ghi chú.');
    },
  });
}
