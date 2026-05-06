import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { instructorStatsApi } from '../api/instructorStatsApi';
import { queryKeys } from '@/shared/queryKeys';

export const useInstructorOverview = () => {
    return useQuery({
        queryKey: queryKeys.instructor.overview(),
        queryFn: instructorStatsApi.getOverview,
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
    });
};

export const useInstructorRevenue = (year?: number) => {
    return useQuery({
        queryKey: queryKeys.instructor.revenue(year),
        queryFn: () => instructorStatsApi.getRevenueSeries(year),
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
    });
};

export const useInstructorRecentActivity = (limit = 10) => {
    return useQuery({
        queryKey: queryKeys.instructor.activity(limit),
        queryFn: () => instructorStatsApi.getRecentActivity(limit),
        placeholderData: keepPreviousData,
        staleTime: 2 * 60 * 1000,
    });
};

export const useCoursePerformance = (courseId?: string) => {
    return useQuery({
        queryKey: queryKeys.instructor.performance(courseId),
        queryFn: () => instructorStatsApi.getCoursePerformance(courseId),
        enabled: true,
        placeholderData: keepPreviousData,
    });
};