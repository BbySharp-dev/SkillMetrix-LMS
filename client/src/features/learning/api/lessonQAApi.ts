import api from '@/lib/axios';
import { getData } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';
import type { LessonQuestionDto, LessonAnswerDto } from '@/features/courses/types';

export const lessonQAApi = {
    getQuestions: async (lessonId: string): Promise<LessonQuestionDto[]> => {
        const res = await api.get(`/lessons/${lessonId}/questions`) as ApiResponseWrapper<LessonQuestionDto[]>;
        return getData(res) ?? [];
    },

    createQuestion: async (
        lessonId: string,
        payload: { content: string; videoTimestampSeconds?: number }
    ): Promise<LessonQuestionDto> => {
        const res = await api.post(`/lessons/${lessonId}/questions`, payload) as ApiResponseWrapper<LessonQuestionDto>;
        const data = getData(res);
        if (!data) throw new Error('Failed to create question');
        return data;
    },

    deleteQuestion: async (lessonId: string, questionId: string): Promise<void> => {
        await api.delete(`/lessons/${lessonId}/questions/${questionId}`);
    },

    createAnswer: async (
        lessonId: string,
        questionId: string,
        payload: { content: string }
    ): Promise<LessonAnswerDto> => {
        const res = await api.post(`/lessons/${lessonId}/questions/${questionId}/answers`, payload) as ApiResponseWrapper<LessonAnswerDto>;
        const data = getData(res);
        if (!data) throw new Error('Failed to create answer');
        return data;
    },

    deleteAnswer: async (lessonId: string, answerId: string): Promise<void> => {
        await api.delete(`/lessons/${lessonId}/questions/answers/${answerId}`);
    },
};
