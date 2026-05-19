import { useQuery } from '@tanstack/react-query';
import { profileApi, type InstructorCourseQueryParams, type StudentEnrollmentQueryParams } from '../api/profileApi';
import { queryKeys } from '@/shared';

export function useInstructorProfile(instructorId: string) {
    return useQuery({
        queryKey: queryKeys.instructor.profile(instructorId),
        queryFn: () => profileApi.getInstructorProfile(instructorId),
        enabled: !!instructorId,
    });
}

export function useInstructorCourses(instructorId: string, params?: InstructorCourseQueryParams) {
    return useQuery({
        queryKey: [...queryKeys.instructor.all, 'courses', instructorId, params ?? {}] as const,
        queryFn: () => profileApi.getInstructorCourses(instructorId, params),
        enabled: !!instructorId,
    });
}

export function useStudentProfile(studentId: string) {
    return useQuery({
        queryKey: ['profile', 'student', studentId] as const,
        queryFn: () => profileApi.getStudentProfile(studentId),
        enabled: !!studentId,
    });
}

export function useStudentEnrollments(studentId: string, params?: StudentEnrollmentQueryParams) {
    return useQuery({
        queryKey: ['profile', 'student', studentId, 'enrollments', params ?? {}] as const,
        queryFn: () => profileApi.getStudentEnrollments(studentId, params),
        enabled: !!studentId,
    });
}
