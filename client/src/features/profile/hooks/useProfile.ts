import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import { queryKeys } from '@/shared';


export function useInstructorProfile(instructorId: string) {
    return useQuery({
        queryKey: queryKeys.instructor.profile(instructorId),
        queryFn: () => profileApi.getInstructorProfile(instructorId),
        enabled: !!instructorId,
    });
}

export function useInstructorCourses(instructorId: string, status?: string) {
    return useQuery({
        queryKey: [...queryKeys.instructor.all, 'courses', instructorId, status] as const,
        queryFn: () => profileApi.getInstructorCourses(instructorId, status),
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

export function useStudentEnrollments(studentId: string) {
    return useQuery({
        queryKey: ['profile', 'student', studentId, 'enrollments'] as const,
        queryFn: () => profileApi.getStudentEnrollments(studentId),
        enabled: !!studentId,
    });
}
