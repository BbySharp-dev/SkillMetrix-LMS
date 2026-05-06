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
    type: 'enrollment' | 'lesson_upload' | 'review' | 'rating';
    studentName: string;
    courseTitle: string;
    createdAt: string;
}

export const instructorStatsApi = {
    getOverview: async (): Promise<InstructorOverviewDto> => {
        const res = await api.get('/instructors/stats/overview') as unknown as ApiResponse<InstructorOverviewDto>;
        return res.data!;
    },

    getRevenueSeries: async (year?: number): Promise<RevenuePoint[]> => {
        const params = year ? { year } : {};
        const res = await api.get('/instructors/stats/revenue', { params }) as unknown as ApiResponse<RevenuePoint[]>;
        return res.data ?? [];
    },

    getRecentActivity: async (limit = 10): Promise<RecentActivity[]> => {
        const res = await api.get('/instructors/stats/activity', { params: { limit } }) as unknown as ApiResponse<RecentActivity[]>;
        return res.data ?? [];
    },

    getCoursePerformance: async (courseId?: string): Promise<InstructorOverviewDto[]> => {
        const params = courseId ? { courseId } : {};
        const res = await api.get('/instructors/stats/performance', { params }) as unknown as ApiResponse<InstructorOverviewDto[]>;
        return res.data ?? [];
    },
};