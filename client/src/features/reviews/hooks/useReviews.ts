import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewsApi, type CreateReviewDto, type UpdateReviewDto } from '../api/reviewsApi';

export function useCourseReviews(courseId: string, page = 1) {
    return useQuery({
        queryKey: ['reviews', 'course', courseId, page] as const,
        queryFn: () => reviewsApi.getCourseReviews(courseId, page),
        enabled: !!courseId,
    });
}

export function useCourseReviewStats(courseId: string) {
    return useQuery({
        queryKey: ['reviews', 'stats', courseId] as const,
        queryFn: () => reviewsApi.getCourseReviewStats(courseId),
        enabled: !!courseId,
    });
}

export function useUserReview(courseId: string) {
    return useQuery({
        queryKey: ['reviews', 'user', courseId] as const,
        queryFn: () => reviewsApi.getUserReview(courseId),
        enabled: !!courseId,
    });
}

export function useCreateReview() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReviewDto) => reviewsApi.createReview(data),
        onSuccess: (_, variables) => {
            toast.success('Đã gửi đánh giá!');
            qc.invalidateQueries({ queryKey: ['reviews', 'course', variables.courseId] });
            qc.invalidateQueries({ queryKey: ['reviews', 'stats', variables.courseId] });
        },
        onError: (error) => {
            toast.error(error?.message || 'Gửi đánh giá thất bại');
        },
    });
}

export function useUpdateReview() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, data }: { reviewId: string; data: UpdateReviewDto }) =>
            reviewsApi.updateReview(reviewId, data),
        onSuccess: () => {
            toast.success('Cập nhật đánh giá thành công!');
            qc.invalidateQueries({ queryKey: ['reviews'] });
        },
        onError: (error) => {
            toast.error(error?.message || 'Cập nhật thất bại');
        },
    });
}

export function useDeleteReview() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: string) => reviewsApi.deleteReview(reviewId),
        onSuccess: () => {
            toast.success('Xóa đánh giá thành công!');
            qc.invalidateQueries({ queryKey: ['reviews'] });
        },
        onError: (error) => {
            toast.error(error?.message || 'Xóa thất bại');
        },
    });
}
