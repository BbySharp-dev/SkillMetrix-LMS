import type { ApiResponse } from '@/shared';
import type { LessonProgressDto, CourseProgressDto, UpdateProgressPayload } from '../types';
import api from '@/lib/axios';

export const progressApi = {
    getLessonProgress: (lessonId: string): Promise<ApiResponse<LessonProgressDto>> =>
        api.get(`/lessons/${lessonId}/progress`),

    updateLessonProgress: (lessonId: string, payload: UpdateProgressPayload): Promise<ApiResponse<LessonProgressDto>> =>
        api.put(`/lessons/${lessonId}/progress`, payload),

    getCourseProgress: (courseId: string): Promise<ApiResponse<CourseProgressDto>> =>
        api.get(`/courses/${courseId}/progress`),
};
