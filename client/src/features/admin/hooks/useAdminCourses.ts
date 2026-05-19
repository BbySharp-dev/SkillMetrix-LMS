import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi, type AdminCourseQueryParams } from '../api/adminApi';
import { queryKeys } from '@/shared';
import { ApiError } from '@/shared';

export const useAdminCourses = (params: AdminCourseQueryParams) => {
    return useQuery({
        queryKey: queryKeys.admin.courses(params),
        queryFn: () => adminApi.getCourses(params),
        placeholderData: keepPreviousData,
    });
};

export const usePendingCourses = (params: Omit<AdminCourseQueryParams, 'status'> = {}) => {
    return useQuery({
        queryKey: queryKeys.admin.approvals(),
        queryFn: () => adminApi.getCourses({ ...params, status: 'Pending' }),
        placeholderData: keepPreviousData,
        refetchInterval: 30000, // refresh mỗi 30s để thấy course mới nộp
    });
};

export const useAdminCourseMutations = () => {
    const qc = useQueryClient();

    const approveMutation = useMutation({
        mutationFn: (courseId: string) => adminApi.approveCourse(courseId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.admin.all });
            toast.success('Đã duyệt khóa học thành công');
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Duyệt khóa học thất bại');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ courseId, reason }: { courseId: string; reason: string }) =>
            adminApi.rejectCourse(courseId, { reason }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.admin.all });
            toast.success('Đã từ chối khóa học');
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Từ chối khóa học thất bại');
        },
    });

    const restoreMutation = useMutation({
        mutationFn: (courseId: string) => adminApi.restoreCourse(courseId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.admin.all });
            toast.success('Đã khôi phục khóa học');
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Khôi phục khóa học thất bại');
        },
    });

    return { approveCourse: approveMutation, rejectCourse: rejectMutation, restoreCourse: restoreMutation };
};
