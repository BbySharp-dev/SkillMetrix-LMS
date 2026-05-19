import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { lessonApi } from '../api/lessonApi';

export function useLessonDocuments(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-documents', lessonId],
    queryFn: () => lessonApi.getDocuments(lessonId!),
    enabled: !!lessonId,
  });
}

export function useCreateLessonDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      payload,
    }: {
      lessonId: string;
      payload: Parameters<typeof lessonApi.createDocument>[1];
    }) => lessonApi.createDocument(lessonId, payload),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-documents', lessonId] });
      toast.success('Tài liệu đã được thêm.');
    },
    onError: () => {
      toast.error('Thêm tài liệu thất bại.');
    },
  });
}

export function useDeleteLessonDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, docId }: { lessonId: string; docId: string }) =>
      lessonApi.deleteDocument(lessonId, docId),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-documents', lessonId] });
      toast.success('Tài liệu đã được xóa.');
    },
    onError: () => {
      toast.error('Xóa tài liệu thất bại.');
    },
  });
}
