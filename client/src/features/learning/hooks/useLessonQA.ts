import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { lessonQAApi } from '../api/lessonQAApi';


export function useLessonQuestions(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-questions', lessonId],
    queryFn: () => lessonQAApi.getQuestions(lessonId!),
    enabled: !!lessonId,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      content,
      videoTimestampSeconds,
    }: {
      lessonId: string;
      content: string;
      videoTimestampSeconds?: number;
    }) => lessonQAApi.createQuestion(lessonId, { content, videoTimestampSeconds }),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-questions', lessonId] });
      toast.success('Câu hỏi đã được đăng.');
    },
    onError: () => {
      toast.error('Đăng câu hỏi thất bại.');
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, questionId }: { lessonId: string; questionId: string }) =>
      lessonQAApi.deleteQuestion(lessonId, questionId),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-questions', lessonId] });
      toast.success('Đã xóa câu hỏi.');
    },
    onError: () => {
      toast.error('Xóa thất bại.');
    },
  });
}

export function useCreateAnswer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      questionId,
      content,
    }: {
      lessonId: string;
      questionId: string;
      content: string;
    }) => lessonQAApi.createAnswer(lessonId, questionId, { content }),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-questions', lessonId] });
      toast.success('Câu trả lời đã được gửi.');
    },
    onError: () => {
      toast.error('Gửi câu trả lời thất bại.');
    },
  });
}

export function useDeleteAnswer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, answerId }: { lessonId: string; answerId: string }) =>
      lessonQAApi.deleteAnswer(lessonId, answerId),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson-questions', lessonId] });
      toast.success('Đã xóa câu trả lời.');
    },
    onError: () => {
      toast.error('Xóa thất bại.');
    },
  });
}
