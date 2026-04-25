import type {
    ApiResponse,
    CourseDetailDto,
    CourseListItem,
    CourseQueryParams,
    ChapterWithLessonsDto
} from "@/types/course.ts";
import api from "@/api/axios.ts";

export const courseApi = {
    getCourses: async (params: CourseQueryParams): Promise<ApiResponse<CourseListItem[]>> => {
        const cleanParams = {
            ...params,
            search: params.search?.trim() || undefined,
        };

        const res = await api.get('/courses', {
            params: cleanParams,
        });

        return res as unknown as ApiResponse<CourseListItem[]>;
    },

    getCourseById: async (courseId: string): Promise<CourseDetailDto> => {
        const res = await api.get(`/courses/${courseId}`) as unknown as ApiResponse<CourseDetailDto>;
        return res.data!;
    },

    getCourseCurriculum: async (courseId: string): Promise<ChapterWithLessonsDto[]> => {
        const res = await api.get(`/courses/${courseId}/curriculum`) as unknown as ApiResponse<ChapterWithLessonsDto[]>;
        return res.data!;
    }
};