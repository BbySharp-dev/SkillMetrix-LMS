import type { PaginatedApiResponse, ApiResponseWrapper, ApiResponse } from '@/shared';
import { normalizePaginated } from '@/shared';
import type { EnrollmentDto } from '../types';
import api from '@/lib/axios';

export interface EnrollmentQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
}

export const enrollmentApi = {
    enroll: (courseId: string): Promise<ApiResponse<EnrollmentDto>> =>
        api.post('/enrollments', { courseId }),

    getMyEnrollments: async (params?: EnrollmentQueryParams): Promise<PaginatedApiResponse<EnrollmentDto[]>> => {
        const cleanParams = params ? {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 10,
            search: params.search?.trim() || undefined,
            sortBy: params.sortBy || undefined,
        } : undefined;

        const res = await api.get('/enrollments/me', { params: cleanParams }) as ApiResponseWrapper<EnrollmentDto[]>;
        return normalizePaginated(res);
    },

    checkEnrollment: (courseId: string): Promise<ApiResponse<boolean>> =>
        api.get(`/enrollments/check/${courseId}`),
};

