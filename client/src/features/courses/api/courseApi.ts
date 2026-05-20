import type {
    PaginatedApiResponse,
    CourseDetailDto,
    CourseListItem,
    CourseQueryParams,
    ChapterWithLessonsDto,
    CreateCoursePayload,
    UpdateCoursePayload,
    CourseQuizDto,
} from '../types';
import api from '@/lib/axios';
import { getData, normalizePaginated } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';

interface ServerCourseDetailDto {
    id?: string;
    Id?: string;
    title?: string | null;
    Title?: string | null;
    description?: string | null;
    Description?: string | null;
    price: number;
    Price: number;
    thumbnail?: string | null;
    Thumbnail?: string | null;
    instructorName?: string | null;
    InstructorName?: string | null;
    instructorId?: string | null;
    InstructorId?: string | null;
    chapterCount: number;
    ChapterCount: number;
    enrollmentCount: number;
    EnrollmentCount: number;
    status?: string | null;
    Status?: string | null;
    createdAt: string;
    CreatedAt: string;
    rating: number;
    Rating: number;
    curriculum?: ChapterWithLessonsDto[];
    Curriculum?: ChapterWithLessonsDto[];
    quizzes?: CourseQuizDto[];
    Quizzes?: CourseQuizDto[];
}

function toClientCourseDetail(raw: ServerCourseDetailDto): CourseDetailDto {
    return {
        id: raw.id ?? raw.Id ?? '',
        title: raw.title ?? raw.Title ?? null,
        description: raw.description ?? raw.Description ?? null,
        price: raw.price ?? raw.Price ?? 0,
        thumbnail: raw.thumbnail ?? raw.Thumbnail ?? null,
        instructorName: raw.instructorName ?? raw.InstructorName ?? null,
        instructorId: raw.instructorId ?? raw.InstructorId ?? null,
        chapterCount: raw.chapterCount ?? raw.ChapterCount ?? 0,
        enrollmentCount: raw.enrollmentCount ?? raw.EnrollmentCount ?? 0,
        status: raw.status ?? raw.Status ?? null,
        createdAt: raw.createdAt ?? raw.CreatedAt ?? '',
        rating: raw.rating ?? raw.Rating ?? 0,
        curriculum: raw.curriculum ?? raw.Curriculum ?? undefined,
        quizzes: raw.quizzes ?? raw.Quizzes ?? undefined,
    };
}

export const courseApi = {
    getCourses: async (params: CourseQueryParams): Promise<PaginatedApiResponse<CourseListItem[]>> => {
        const cleanParams = {
            ...params,
            search: params.search?.trim() || undefined,
        };
        const res = await api.get('/courses', { params: cleanParams }) as ApiResponseWrapper<CourseListItem[]>;
        return normalizePaginated(res);
    },

    getCourseById: async (courseId: string): Promise<CourseDetailDto> => {
        const res = await api.get(`/courses/${courseId}`) as ApiResponseWrapper<ServerCourseDetailDto>;
        const raw = getData<ServerCourseDetailDto>(res);
        if (!raw) throw new Error('Course not found');
        return toClientCourseDetail(raw);
    },

    getCourseCurriculum: async (courseId: string): Promise<ChapterWithLessonsDto[]> => {
        const res = await api.get(`/courses/${courseId}/curriculum`) as ApiResponseWrapper<ChapterWithLessonsDto[]>;
        return getData<ChapterWithLessonsDto[]>(res) ?? [];
    },

    createCourse: async (data: CreateCoursePayload): Promise<CourseDetailDto> => {
        const res = await api.post('/courses', data) as ApiResponseWrapper<ServerCourseDetailDto>;
        const raw = getData<ServerCourseDetailDto>(res);
        if (!raw) throw new Error('No data returned from server');
        const normalized = toClientCourseDetail(raw);
        if (!normalized.id) throw new Error('Server did not return a course ID');
        return normalized;
    },

    updateCourse: async (id: string, data: UpdateCoursePayload): Promise<CourseDetailDto> => {
        const res = await api.put(`/courses/${id}`, data) as ApiResponseWrapper<ServerCourseDetailDto>;
        const raw = getData<ServerCourseDetailDto>(res);
        if (!raw) throw new Error('Update failed');
        return toClientCourseDetail(raw);
    },

    deleteCourse: async (id: string): Promise<void> => {
        await api.delete(`/courses/${id}`);
    },

    restoreCourse: async (id: string): Promise<void> => {
        await api.post(`/courses/${id}/restore`);
    },

    submitCourse: async (id: string): Promise<void> => {
        await api.put(`/courses/${id}/submit`);
    },

    getMyCourses: async (params: Omit<CourseQueryParams, 'instructorId'>): Promise<PaginatedApiResponse<CourseListItem[]>> => {
        const cleanParams = {
            ...params,
            search: params.search?.trim() || undefined,
        };
        const res = await api.get('/courses/instructor/mine', { params: cleanParams }) as ApiResponseWrapper<CourseListItem[]>;
        return normalizePaginated(res);
    },
};