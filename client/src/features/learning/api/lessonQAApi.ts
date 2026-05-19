import { api } from '@/lib/axios';
import type { LessonQuestionDto } from '@/features/courses/types';

const QA_URL = '/lessons';

export const lessonQAApi = {
  getQuestions: async (lessonId: string): Promise<LessonQuestionDto[]> => {
    const { data } = await api.get<{ data: LessonQuestionDto[] }>(
      `${QA_URL}/${lessonId}/questions`
    );
    return data.data ?? [];
  },

  createQuestion: async (
    lessonId: string,
    payload: { content: string; videoTimestampSeconds?: number }
  ): Promise<LessonQuestionDto> => {
    const { data } = await api.post<{ data: LessonQuestionDto }>(
      `${QA_URL}/${lessonId}/questions`,
      payload
    );
    return data.data;
  },

  deleteQuestion: async (lessonId: string, questionId: string): Promise<void> => {
    await api.delete(`${QA_URL}/${lessonId}/questions/${questionId}`);
  },

  createAnswer: async (
    lessonId: string,
    questionId: string,
    payload: { content: string }
  ): Promise<import('@/features/courses/types').LessonAnswerDto> => {
    const { data } = await api.post<{ data: import('@/features/courses/types').LessonAnswerDto }>(
      `${QA_URL}/${lessonId}/questions/${questionId}/answers`,
      payload
    );
    return data.data;
  },

  deleteAnswer: async (lessonId: string, answerId: string): Promise<void> => {
    await api.delete(`${QA_URL}/${lessonId}/questions/answers/${answerId}`);
  },
};
