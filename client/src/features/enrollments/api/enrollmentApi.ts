import type { ApiResponse } from '@/shared/api';
import type { EnrollmentDto } from '../types';
import api from '@/lib/axios';

export const enrollmentApi = {
    enroll: (courseId: string): Promise<ApiResponse<EnrollmentDto>> =>
        api.post('/enrollments', { courseId }),

    getMyEnrollments: (): Promise<ApiResponse<EnrollmentDto[]>> =>
        api.get('/enrollments/me'),

    checkEnrollment: (courseId: string): Promise<ApiResponse<boolean>> =>
        api.get(`/enrollments/check/${courseId}`),
};
