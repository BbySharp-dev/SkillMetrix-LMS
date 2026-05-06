export type { ApiResponse, PaginatedApiResponse } from '@/shared/api';
export type { PaginationMetadata } from '@/shared/api';

export interface CourseListItem {
    id: string;
    title: string | null;
    description: string | null;
    price: number;
    thumbnail: string | null;
    instructorName: string | null;
    chapterCount: number;
    enrollmentCount: number;
    status: string | null;
    createdAt: string;
    rating: number;
}

export interface CourseQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    status?: string;
    instructorId?: string;
    sortBy?: string;
}

export interface CourseEditorData {
    id?: string;
    title?: string | null;
    description?: string | null;
    price?: number;
    thumbnail?: string | null;
    status?: string | null;
    instructorId?: string | null;  
}

export interface LessonDto {
    id: string;
    chapterId: string;
    title: string;
    description?: string | null;
    videoUrl?: string | null;
    durationSeconds: number;
    isFreePreview: boolean;
    orderIndex: number;
    createdAt: string;
}

export interface ChapterWithLessonsDto {
    id: string;
    courseId: string;
    title: string;
    description?: string | null;
    orderIndex: number;
    lessons: LessonDto[];
}

export interface CourseDetailDto {
    id: string;
    title?: string | null;
    description?: string | null;
    price: number;
    thumbnail?: string | null;
    instructorName?: string | null;
    instructorId?: string | null;
    chapterCount: number;
    enrollmentCount: number;
    status?: string | null;
    createdAt: string;
    rating: number;
}

export interface CreateCoursePayload {
    title: string;
    description?: string;
    price: number;
    thumbnail?: string;
    instructorId?: string;
}

export interface UpdateCoursePayload {
    title?: string;
    description?: string;
    price?: number;
    thumbnail?: string;
}
