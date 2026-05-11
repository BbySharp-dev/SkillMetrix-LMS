import api from '@/lib/axios';
import type { ApiResponse } from '@/shared/api';

export interface InstructorOverviewDto {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
    publishedCourses: number;
    pendingCourses: number;
}

export interface RevenuePoint {
    month: string;
    revenue: number;
    orderCount: number;
}

export interface RecentActivity {
    id: string;
    type: 'enrollment' | 'review' | 'rating';
    studentName: string;
    courseTitle: string;
    createdAt: string;
}

export interface CoursePerformanceDto {
    courseId: string;
    courseTitle: string;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
    reviewCount: number;
    lessonCount: number;
}

export const instructorStatsApi = {
    getOverview: async (): Promise<InstructorOverviewDto> => {
        const res = await api.get('/statistics/instructor/overview') as unknown as ApiResponse<InstructorOverviewDto>;
        return res.data!;
    },

    getRevenueSeries: async (months = 12): Promise<RevenuePoint[]> => {
        const res = await api.get('/statistics/instructor/revenue', { params: { months } }) as unknown as ApiResponse<RevenuePoint[]>;
        return res.data ?? [];
    },

    getRecentActivity: async (limit = 10): Promise<RecentActivity[]> => {
        const res = await api.get('/statistics/instructor/activity', { params: { limit } }) as unknown as ApiResponse<RecentActivity[]>;
        return res.data ?? [];
    },

    getCoursePerformance: async (courseId?: string): Promise<CoursePerformanceDto[]> => {
        const params = courseId ? { courseId } : {};
        const res = await api.get('/statistics/instructor/performance', { params }) as unknown as ApiResponse<CoursePerformanceDto[]>;
        return res.data ?? [];
    },
};