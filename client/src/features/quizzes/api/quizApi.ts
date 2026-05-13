import api from '@/lib/axios';
import { getData } from '@/shared';
import type {
    ApiResponseWrapper,
} from '@/shared';
import type {
    QuizResponseDto,
    QuizDetailDto,
    QuizForTakingDto,
    CreateQuizPayload,
    UpdateQuizPayload,
    CreateQuestionPayload,
    CreateOptionPayload,
    QuizAttemptSummaryDto,
    QuizAttemptResultDto,
    SubmitAnswerPayload,
} from '../types';

export const quizApi = {

    getQuizzesByCourse: async (courseId: string): Promise<QuizResponseDto[]> => {
        const res = await api.get(`/quizzes/course/${courseId}`) as ApiResponseWrapper<QuizResponseDto[]>;
        return getData(res) ?? [];
    },

    getQuizById: async (quizId: string): Promise<QuizDetailDto> => {
        const res = await api.get(`/quizzes/${quizId}`) as ApiResponseWrapper<QuizDetailDto>;
        const data = getData(res);
        if (!data) throw new Error('Quiz not found');
        return data;
    },

    createQuiz: async (data: CreateQuizPayload): Promise<QuizResponseDto> => {
        const res = await api.post('/quizzes', data) as ApiResponseWrapper<QuizResponseDto>;
        const d = getData(res);
        if (!d) throw new Error('Failed to create quiz');
        return d;
    },

    updateQuiz: async (quizId: string, data: UpdateQuizPayload): Promise<QuizResponseDto> => {
        const res = await api.put(`/quizzes/${quizId}`, data) as ApiResponseWrapper<QuizResponseDto>;
        const d = getData(res);
        if (!d) throw new Error('Failed to update quiz');
        return d;
    },

    deleteQuiz: async (quizId: string): Promise<void> => {
        await api.delete(`/quizzes/${quizId}`);
    },


    addQuestion: async (quizId: string, data: CreateQuestionPayload): Promise<void> => {
        await api.post(`/quizzes/${quizId}/questions`, data);
    },

    deleteQuestion: async (quizId: string, questionId: string): Promise<void> => {
        await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
    },


    addOption: async (quizId: string, questionId: string, data: CreateOptionPayload): Promise<void> => {
        await api.post(`/quizzes/${quizId}/questions/${questionId}/options`, data);
    },

    deleteOption: async (quizId: string, questionId: string, optionId: string): Promise<void> => {
        await api.delete(`/quizzes/${quizId}/questions/${questionId}/options/${optionId}`);
    },


    getQuizForTaking: async (quizId: string): Promise<QuizForTakingDto> => {
        const res = await api.get(`/quizzes/${quizId}/take`) as ApiResponseWrapper<QuizForTakingDto>;
        const data = getData(res);
        if (!data) throw new Error('Quiz not found');
        return data;
    },

    startAttempt: async (quizId: string): Promise<string> => {
        const res = await api.post(`/quizzes/${quizId}/attempts`) as ApiResponseWrapper<string>;
        const data = getData(res);
        if (!data) throw new Error('Failed to start attempt');
        return data;
    },

    submitAttempt: async (quizId: string, attemptId: string, answers: SubmitAnswerPayload[]): Promise<QuizAttemptResultDto> => {
        const res = await api.post(`/quizzes/${quizId}/attempts/${attemptId}/submit`, answers) as ApiResponseWrapper<QuizAttemptResultDto>;
        const data = getData(res);
        if (!data) throw new Error('Failed to submit attempt');
        return data;
    },

    getUserAttempts: async (quizId: string): Promise<QuizAttemptSummaryDto[]> => {
        const res = await api.get(`/quizzes/${quizId}/attempts`) as ApiResponseWrapper<QuizAttemptSummaryDto[]>;
        return getData(res) ?? [];
    },

    getAttemptResult: async (quizId: string, attemptId: string): Promise<QuizAttemptResultDto> => {
        const res = await api.get(`/quizzes/${quizId}/attempts/${attemptId}`) as ApiResponseWrapper<QuizAttemptResultDto>;
        const data = getData(res);
        if (!data) throw new Error('Attempt not found');
        return data;
    },
};
