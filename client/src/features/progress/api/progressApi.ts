import type { ApiResponse } from '@/types/api';
import type { LessonProgressDto, CourseProgressSummary } from '../types/progress';
import api from '@/lib/axios';

export const progressApi = {
    markLessonComplete: (lessonId: string): Promise<ApiResponse<void>> =>
        api.post(`/Progress/lessons/${lessonId}/complete`),

    updateWatchTime: (lessonId: string, second: number): Promise<ApiResponse<void>> =>
        api.post(`/Progress/lessons/${lessonId}/watch`, { second }),

    getLessonProgress: (lessonId: string): Promise<ApiResponse<LessonProgressDto>> =>
        api.get(`/Progress/lessons/${lessonId}`),

    getCourseProgress: (courseId: string): Promise<ApiResponse<CourseProgressSummary>> =>
        api.get(`/Progress/courses/${courseId}`),
};
