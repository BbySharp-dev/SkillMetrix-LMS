import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chapterApi } from '../api/chapterApi';
import { lessonApi } from '../api/lessonApi';
import { courseApi } from '../api/courseApi';
import { toast } from 'sonner';

export const curriculumQueryKeys = {
    all: ['curriculum'] as const,
    detail: (courseId: string) => [...curriculumQueryKeys.all, courseId] as const,
};

export const useCurriculum = (courseId: string) => {
    return useQuery({
        queryKey: curriculumQueryKeys.detail(courseId),
        queryFn: () => courseApi.getCourseCurriculum(courseId),
        enabled: !!courseId,
    });
};

export const useChapterMutations = (courseId: string) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: { title: string }) => chapterApi.createChapter(courseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(courseId) });
            toast.success('Đã thêm chương mới');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { title: string } }) => 
            chapterApi.updateChapter(courseId, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(courseId) });
            toast.success('Đã cập nhật chương');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => chapterApi.deleteChapter(courseId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(courseId) });
            toast.success('Đã xóa chương');
        },
    });

    const reorderMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { oldIndex: number, newIndex: number } }) => 
            chapterApi.reorderChapter(courseId, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(courseId) });
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
        mutationFn: ({ chapterId, data }: { chapterId: string, data: { title: string } }) => 
            lessonApi.createLesson(chapterId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(courseId) });
            toast.success('Đã thêm bài học');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { title: string, isFreePreview: boolean } }) => 
            lessonApi.updateLesson(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(courseId) });
            toast.success('Đã cập nhật bài học');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => lessonApi.deleteLesson(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(courseId) });
            toast.success('Đã xóa bài học');
        },
    });

    const uploadVideoMutation = useMutation({
        mutationFn: ({ id, file }: { id: string, file: File }) => 
            lessonApi.uploadVideo(id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(courseId) });
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
