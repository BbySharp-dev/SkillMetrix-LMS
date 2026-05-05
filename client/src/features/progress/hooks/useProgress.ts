import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api/progressApi';

export const progressQueryKeys = {
    all: ['progress'] as const,
    lesson: (lessonId: string) => [...progressQueryKeys.all, 'lesson', lessonId] as const,
    course: (courseId: string) => [...progressQueryKeys.all, 'course', courseId] as const,
};

export const useLessonProgress = (lessonId?: string) => {
    return useQuery({
        enabled: Boolean(lessonId),
        queryKey: progressQueryKeys.lesson(lessonId ?? ''),
        queryFn: () => progressApi.getLessonProgress(lessonId!),
        retry: false,
    });
};

export const useCourseProgress = (courseId?: string) => {
    return useQuery({
        enabled: Boolean(courseId),
        queryKey: progressQueryKeys.course(courseId ?? ''),
        queryFn: () => progressApi.getCourseProgress(courseId!),
    });
};

export const useUpdateLessonProgress = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, lastWatchedSecond }: { lessonId: string; lastWatchedSecond: number }) =>
            progressApi.updateLessonProgress(lessonId, { lastWatchedSecond }).then((res) => res.data),
        onSuccess: (data, { lessonId }) => {
            qc.setQueryData(progressQueryKeys.lesson(lessonId), data);
            qc.invalidateQueries({ queryKey: ['my-enrollments'] });
        },
    });
};
