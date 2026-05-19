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
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
      toast.success('Đã cập nhật ghi chú.');
    },
    onError: () => {
      toast.error('Cập nhật thất bại.');
    },
  });
}

export function useDeleteLessonNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, noteId }: { lessonId: string; noteId: string }) =>
      lessonNotesApi.delete(lessonId, noteId),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
      toast.success('Đã xóa ghi chú.');
    },
    onError: () => {
      toast.error('Xóa thất bại.');
    },
  });
}
