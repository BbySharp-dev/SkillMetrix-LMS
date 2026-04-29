import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '../api/enrollmentApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useMyEnrollments() {
    return useQuery({
        queryKey: ['my-enrollments'],
        queryFn: async () => {
            const response = await enrollmentApi.getMyEnrollments();
            return response.data;
        },
    });
}

export function useEnrollCourse() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (courseId: string) => enrollmentApi.enroll(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
            queryClient.invalidateQueries({ queryKey: ['enrollment-check'] });
            toast.success('Đăng ký khóa học thành công!');
            navigate('/dashboard/my-enrollments');
        },
        onError: (error: unknown) => {
            const message =
                (error as { response?: { data?: { message?: string } }})?.response?.data?.message
                ?? "Đăng ký thất bại. Vui lòng thử lại."
            toast.error(message);
        }
    });
}
