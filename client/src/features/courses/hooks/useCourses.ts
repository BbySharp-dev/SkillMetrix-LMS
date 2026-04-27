import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';
import type { CourseQueryParams } from '../types';

export const courseQueryKeys = {
    all: ['courses'] as const,
    list: (params: CourseQueryParams) => [...courseQueryKeys.all, 'list', params] as const,
    detail: (id: string) => [...courseQueryKeys.all, 'detail', id] as const,
    curriculum: (id: string) => [...courseQueryKeys.all, 'curriculum', id] as const,
};

export const useCourses = (params: CourseQueryParams) => {
    return useQuery({
        queryKey: courseQueryKeys.list(params),
        queryFn: () => courseApi.getCourses(params),
        placeholderData: keepPreviousData,
    });
};

export const useCourseDetail = (courseId?: string) => {
    return useQuery({
        enabled: Boolean(courseId),
        queryKey: courseQueryKeys.detail(courseId ?? ''),
        queryFn: () => courseApi.getCourseById(courseId!),
    });
};

export const useCourseCurriculum = (courseId?: string) => {
    return useQuery({
        enabled: Boolean(courseId),
        queryKey: courseQueryKeys.curriculum(courseId ?? ''),
        queryFn: () => courseApi.getCourseCurriculum(courseId!),
    });
};
