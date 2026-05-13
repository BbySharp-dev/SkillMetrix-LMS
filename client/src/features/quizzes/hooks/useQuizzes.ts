import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quizApi } from '../api/quizApi';
import type {
    CreateQuizPayload,
    UpdateQuizPayload,
    CreateQuestionPayload,
    CreateOptionPayload,
    SubmitAnswerPayload,
} from '../types';

const QUIZ_KEYS = {
    all: ['quizzes'] as const,
    list: (courseId: string) => [...QUIZ_KEYS.all, 'list', courseId] as const,
    detail: (quizId: string) => [...QUIZ_KEYS.all, 'detail', quizId] as const,
    taking: (quizId: string) => [...QUIZ_KEYS.all, 'taking', quizId] as const,
    attempts: (quizId: string) => [...QUIZ_KEYS.all, 'attempts', quizId] as const,
    result: (quizId: string, attemptId: string) => [...QUIZ_KEYS.all, 'result', quizId, attemptId] as const,
};


export const useQuizzesByCourse = (courseId?: string) =>
    useQuery({
        queryKey: QUIZ_KEYS.list(courseId ?? ''),
        queryFn: () => quizApi.getQuizzesByCourse(courseId!),
        enabled: Boolean(courseId),
    });

export const useQuizDetail = (quizId?: string) =>
    useQuery({
        queryKey: QUIZ_KEYS.detail(quizId ?? ''),
        queryFn: () => quizApi.getQuizById(quizId!),
        enabled: Boolean(quizId),
    });

export const useCreateQuiz = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQuizPayload) => quizApi.createQuiz(data),
        onSuccess: (_, { courseId }) => {
            qc.invalidateQueries({ queryKey: QUIZ_KEYS.list(courseId) });
            toast.success('Quiz created successfully');
        },
        onError: () => toast.error('Failed to create quiz'),
    });
};

export const useUpdateQuiz = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ quizId, data }: { quizId: string; data: UpdateQuizPayload }) =>
            quizApi.updateQuiz(quizId, data),
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: QUIZ_KEYS.detail(result.id) });
            toast.success('Quiz updated successfully');
        },
        onError: () => toast.error('Failed to update quiz'),
    });
};

export const useDeleteQuiz = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ quizId }: { quizId: string; courseId: string }) =>
            quizApi.deleteQuiz(quizId),
        onSuccess: (_, { courseId }) => {
            qc.invalidateQueries({ queryKey: QUIZ_KEYS.list(courseId) });
            toast.success('Quiz deleted');
        },
        onError: () => toast.error('Failed to delete quiz'),
    });
};


export const useAddQuestion = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ quizId, data }: { quizId: string; data: CreateQuestionPayload }) =>
            quizApi.addQuestion(quizId, data),
        onSuccess: (_, { quizId }) => {
            qc.invalidateQueries({ queryKey: QUIZ_KEYS.detail(quizId) });
            toast.success('Question added');
        },
        onError: () => toast.error('Failed to add question'),
    });
};

export const useDeleteQuestion = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
            quizApi.deleteQuestion(quizId, questionId),
        onSuccess: (_, { quizId }) => {
            qc.invalidateQueries({ queryKey: QUIZ_KEYS.detail(quizId) });
            toast.success('Question deleted');
        },
        onError: () => toast.error('Failed to delete question'),
    });
};


export const useAddOption = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ quizId, questionId, data }: { quizId: string; questionId: string; data: CreateOptionPayload }) =>
            quizApi.addOption(quizId, questionId, data),
        onSuccess: (_, { quizId }) => {
            qc.invalidateQueries({ queryKey: QUIZ_KEYS.detail(quizId) });
        },
        onError: () => toast.error('Failed to add option'),
    });
};

export const useDeleteOption = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ quizId, questionId, optionId }: { quizId: string; questionId: string; optionId: string }) =>
            quizApi.deleteOption(quizId, questionId, optionId),
        onSuccess: (_, { quizId }) => {
            qc.invalidateQueries({ queryKey: QUIZ_KEYS.detail(quizId) });
        },
        onError: () => toast.error('Failed to delete option'),
    });
};


export const useQuizForTaking = (quizId?: string) =>
    useQuery({
        queryKey: QUIZ_KEYS.taking(quizId ?? ''),
        queryFn: () => quizApi.getQuizForTaking(quizId!),
        enabled: Boolean(quizId),
    });

export const useStartAttempt = () => {
    return useMutation({
        mutationFn: (quizId: string) => quizApi.startAttempt(quizId),
        onError: () => toast.error('Failed to start quiz'),
    });
};

export const useSubmitAttempt = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ quizId, attemptId, answers }: { quizId: string; attemptId: string; answers: SubmitAnswerPayload[] }) =>
            quizApi.submitAttempt(quizId, attemptId, answers),
        onSuccess: (_, { quizId }) => {
            qc.invalidateQueries({ queryKey: QUIZ_KEYS.attempts(quizId) });
            toast.success('Quiz submitted!');
        },
        onError: () => toast.error('Failed to submit quiz'),
    });
};

export const useUserAttempts = (quizId?: string) =>
    useQuery({
        queryKey: QUIZ_KEYS.attempts(quizId ?? ''),
        queryFn: () => quizApi.getUserAttempts(quizId!),
        enabled: Boolean(quizId),
    });

export const useAttemptResult = (quizId?: string, attemptId?: string) =>
    useQuery({
        queryKey: QUIZ_KEYS.result(quizId ?? '', attemptId ?? ''),
        queryFn: () => quizApi.getAttemptResult(quizId!, attemptId!),
        enabled: Boolean(quizId && attemptId),
    });
