import type {
    PaginatedApiResponse,
    CourseDetailDto,
    CourseListItem,
    CourseQueryParams,
    ChapterWithLessonsDto,
    CreateCoursePayload,
    UpdateCoursePayload,
} from '../types';
import api from '@/lib/axios';
import { getData, normalizePaginated } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';

export const courseApi = {
    getCourses: async (params: CourseQueryParams): Promise<PaginatedApiResponse<CourseListItem[]>> => {
        const cleanParams = {
            ...params,
            search: params.search?.trim() || undefined,
        };
        const res = await api.get('/courses', { params: cleanParams }) as ApiResponseWrapper<CourseListItem[]>;
        return normalizePaginated(res);
    },

    getCourseById: async (courseId: string): Promise<CourseDetailDto> => {
        const res = await api.get(`/courses/${courseId}`) as ApiResponseWrapper<CourseDetailDto & { Id?: string }>;
        const data = getData<CourseDetailDto>(res);
        if (!data) throw new Error('Course not found');
        return { ...data, id: data.id ?? res.Data?.Id ?? '' };
    },

    getCourseCurriculum: async (courseId: string): Promise<ChapterWithLessonsDto[]> => {
        const res = await api.get(`/courses/${courseId}/curriculum`) as ApiResponseWrapper<ChapterWithLessonsDto[]>;
        return getData<ChapterWithLessonsDto[]>(res) ?? [];
    },

    createCourse: async (data: CreateCoursePayload): Promise<CourseDetailDto> => {
        const res = await api.post('/courses', data) as ApiResponseWrapper<CourseDetailDto & { Id?: string }>;
        const courseData = getData<CourseDetailDto>(res);
        if (!courseData) throw new Error('No data returned from server');
        return { ...courseData, id: courseData.id ?? res.Data?.Id ?? '' };
    },

    updateCourse: async (id: string, data: UpdateCoursePayload): Promise<CourseDetailDto> => {
        const res = await api.put(`/courses/${id}`, data) as ApiResponseWrapper<CourseDetailDto & { Id?: string }>;
        const courseData = getData<CourseDetailDto>(res);
        if (!courseData) throw new Error('Update failed');
        return { ...courseData, id: courseData.id ?? res.Data?.Id ?? '' };
    },

    deleteCourse: async (id: string): Promise<void> => {
        await api.delete(`/courses/${id}`);
    },

    restoreCourse: async (id: string): Promise<void> => {
        await api.post(`/courses/${id}/restore`);
    },

    submitCourse: async (id: string): Promise<void> => {
        await api.put(`/courses/${id}/submit`);
    },

    getMyCourses: async (params: Omit<CourseQueryParams, 'instructorId'>): Promise<PaginatedApiResponse<CourseListItem[]>> => {
        const cleanParams = {
            ...params,
            search: params.search?.trim() || undefined,
        };
        const res = await api.get('/courses/instructor/mine', { params: cleanParams }) as ApiResponseWrapper<CourseListItem[]>;
        return normalizePaginated(res);
    },
};