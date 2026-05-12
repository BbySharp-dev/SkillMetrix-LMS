import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '../api/enrollmentApi';
import { toast } from 'sonner';
import { queryKeys } from '@/shared';
import { ApiError } from '@/shared';

export function useEnrollCourse() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (courseId: string) => enrollmentApi.enroll(courseId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.enrollments.me });
            qc.invalidateQueries({ queryKey: queryKeys.enrollments.all });
            toast.success('Đăng ký khóa học thành công!');
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
        },
    });
}

export function useMyEnrollments() {
    return useQuery({
        queryKey: queryKeys.enrollments.me,
        queryFn: async () => {
            const res = await enrollmentApi.getMyEnrollments();
            return res.data ?? [];
        },
    });
}
