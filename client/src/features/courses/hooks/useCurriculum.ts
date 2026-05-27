import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chapterApi } from '../api/chapterApi';
import { lessonApi } from '../api/lessonApi';
import { courseApi } from '../api/courseApi';
import { queryKeys } from '@/shared';
import { toast } from 'sonner';

export const useCurriculum = (courseId: string) => {
    return useQuery({
        queryKey: queryKeys.courses.curriculum(courseId),
        queryFn: () => courseApi.getCourseCurriculum(courseId),
        enabled: !!courseId,
    });
};

export const useChapterMutations = (courseId: string) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: { title: string }) => chapterApi.createChapter(courseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã thêm chương mới');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { title: string } }) => 
            chapterApi.updateChapter(courseId, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã cập nhật chương');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => chapterApi.deleteChapter(courseId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã xóa chương');
        },
    });

    const reorderMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { oldIndex: number, newIndex: number } }) => 
            chapterApi.reorderChapter(courseId, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
        },
    });

    return {
        createChapter: createMutation,
        updateChapter: updateMutation,
        deleteChapter: deleteMutation,
        reorderChapter: reorderMutation,
    };
};

export const useLessonMutations = (courseId: string) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: ({ chapterId, data }: { chapterId: string, data: { title: string; description?: string; durationSeconds?: number; isFreePreview?: boolean; videoUrl?: string | null } }) => 
            lessonApi.createLesson(chapterId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã thêm bài học');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { title?: string; description?: string; durationSeconds?: number; isFreePreview?: boolean; videoUrl?: string | null } }) => 
            lessonApi.updateLesson(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã cập nhật bài học');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => lessonApi.deleteLesson(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã xóa bài học');
        },
    });

    const uploadVideoMutation = useMutation({
        mutationFn: ({ id, file }: { id: string, file: File }) => 
            lessonApi.uploadVideo(id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Upload video thành công');
        },
    });

    return {
        createLesson: createMutation,
        updateLesson: updateMutation,
        deleteLesson: deleteMutation,
        uploadVideo: uploadVideoMutation,
    };
};

import { quizApi, type CreateQuizPayload, type UpdateQuizPayload } from '../api/quizApi';

export const useQuizMutations = (courseId: string) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (payload: CreateQuizPayload) => quizApi.createQuiz(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã tạo quiz mới');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateQuizPayload }) =>
            quizApi.updateQuiz(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã cập nhật quiz');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => quizApi.deleteQuiz(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.curriculum(courseId) });
            toast.success('Đã xóa quiz');
        },
    });

    return {
        createQuiz: createMutation,
        updateQuiz: updateMutation,
        deleteQuiz: deleteMutation,
    };
};
