import type { ApiResponse } from '@/types/api';
import type { EnrollmentDto } from '../types/enrollment';
import api from '@/lib/axios';

export const enrollmentApi = {
    enroll: (courseId: string): Promise<ApiResponse<EnrollmentDto>> =>
        api.post('/Enrollments', { courseId }),

    getMyEnrollments: (): Promise<ApiResponse<EnrollmentDto[]>> =>
        api.get('/Enrollments/me'),

    checkEnrollment: (courseId: string): Promise<ApiResponse<boolean>> =>
        api.get(`/Enrollments/check/${courseId}`),
};
