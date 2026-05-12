import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api/progressApi';
import { queryKeys } from '@/shared';

export const useLessonProgress = (lessonId?: string) => {
    return useQuery({
        enabled: Boolean(lessonId),
        queryKey: queryKeys.progress.lesson(lessonId ?? ''),
        queryFn: () => progressApi.getLessonProgress(lessonId!),
        retry: false,
    });
};

export const useCourseProgress = (courseId?: string) => {
    return useQuery({
        enabled: Boolean(courseId),
        queryKey: queryKeys.progress.course(courseId ?? ''),
        queryFn: () => progressApi.getCourseProgress(courseId!),
    });
};

export const useUpdateLessonProgress = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, lastWatchedSecond }: { lessonId: string; lastWatchedSecond: number }) =>
            progressApi.updateLessonProgress(lessonId, { lastWatchedSecond }),
        onSuccess: (data, { lessonId }) => {
            qc.setQueryData(queryKeys.progress.lesson(lessonId), data);
            qc.invalidateQueries({ queryKey: queryKeys.enrollments.me });
        },
    });
};
