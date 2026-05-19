import type { CourseQuizDto } from '../types';
import api from '@/lib/axios';
import { getData } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';

export interface CreateQuizPayload {
    courseId: string;
    chapterId?: string | null;
    lessonId?: string | null;
    title: string;
    description?: string;
    passingScore: number;
    timeLimitMinutes?: number | null;
    maxAttempts: number;
    isFinalQuiz: boolean;
}

export interface UpdateQuizPayload {
    title?: string;
    description?: string;
    passingScore?: number;
    timeLimitMinutes?: number | null;
    maxAttempts?: number;
    isFinalQuiz?: boolean;
    chapterId?: string | null;
    lessonId?: string | null;
}

export const quizApi = {
    getQuizzesByCourse: async (courseId: string): Promise<CourseQuizDto[]> => {
        const res = await api.get(`/quizzes/course/${courseId}`) as ApiResponseWrapper<CourseQuizDto[]>;
        return getData<CourseQuizDto[]>(res) ?? [];
    },

    createQuiz: async (payload: CreateQuizPayload): Promise<CourseQuizDto> => {
        const res = await api.post('/quizzes', payload) as ApiResponseWrapper<CourseQuizDto>;
        return getData<CourseQuizDto>(res)!;
    },

    updateQuiz: async (quizId: string, payload: UpdateQuizPayload): Promise<CourseQuizDto> => {
        const res = await api.put(`/quizzes/${quizId}`, payload) as ApiResponseWrapper<CourseQuizDto>;
        return getData<CourseQuizDto>(res)!;
    },

    deleteQuiz: async (quizId: string): Promise<void> => {
        await api.delete(`/quizzes/${quizId}`);
    },
};
