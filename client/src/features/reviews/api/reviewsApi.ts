import { api } from '@/lib';

export interface ReviewDto {
    id: string;
    courseId: string;
    userId: string;
    userFullName: string;
    userAvatarUrl: string | null;
    rating: number;
    comment: string | null;
    createdAt: string;
}

export interface CourseReviewStatsDto {
    totalReviews: number;
    averageRating: number;
    rating1Count: number;
    rating2Count: number;
    rating3Count: number;
    rating4Count: number;
    rating5Count: number;
}

export interface CreateReviewDto {
    courseId: string;
    rating: number;
    comment?: string;
}

export interface UpdateReviewDto {
    rating: number;
    comment?: string;
}

export const reviewsApi = {
    getCourseReviews: async (courseId: string, page = 1): Promise<ReviewDto[]> => {
        const res = await api.get(`/reviews/courses/${courseId}`, { params: { page } });
        return (res as { data: ReviewDto[] }).data ?? [];
    },

    getCourseReviewStats: async (courseId: string): Promise<CourseReviewStatsDto> => {
        const res = await api.get(`/reviews/courses/${courseId}/stats`);
        return (res as { data: CourseReviewStatsDto }).data!;
    },

    createReview: async (data: CreateReviewDto): Promise<ReviewDto> => {
        const res = await api.post('/reviews', data);
        return (res as { data: ReviewDto }).data!;
    },

    updateReview: async (reviewId: string, data: UpdateReviewDto): Promise<ReviewDto> => {
        const res = await api.put(`/reviews/${reviewId}`, data);
        return (res as { data: ReviewDto }).data!;
    },

    deleteReview: async (reviewId: string): Promise<void> => {
        await api.delete(`/reviews/${reviewId}`);
    },

    getUserReview: async (courseId: string): Promise<ReviewDto | null> => {
        const res = await api.get(`/reviews/courses/${courseId}/my-review`);
        return (res as { data: ReviewDto | null }).data ?? null;
    },
};
