export type { ApiResponse, PaginatedApiResponse } from '@/shared';
export type { PaginationMetadata } from '@/shared';

export type CourseStatus = 'Draft' | 'Pending' | 'Published' | 'Rejected';

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
    isDeleted?: boolean;
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
    includeDeleted?: boolean;
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

export interface LessonDocumentDto {
    id: string;
    lessonId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileTypeLabel: string;
    fileSizeBytes: number;
    formattedSize: string;
    title?: string | null;
    orderIndex: number;
    createdAt: string;
}

export interface LessonNoteDto {
    id: string;
    lessonId: string;
    content: string;
    videoTimestampSeconds: number;
    formattedTimestamp: string;
    createdAt: string;
}

export interface LessonAnswerDto {
    id: string;
    questionId: string;
    content: string;
    userId: string;
    userFullName: string;
    userAvatarUrl?: string | null;
    createdAt: string;
}

export interface LessonQuestionDto {
    id: string;
    lessonId: string;
    content: string;
    videoTimestampSeconds?: number | null;
    formattedTimestamp?: string | null;
    answerCount: number;
    userId: string;
    userFullName: string;
    userAvatarUrl?: string | null;
    createdAt: string;
    answers: LessonAnswerDto[];
}

export interface ChapterWithLessonsDto {
    id: string;
    courseId: string;
    title: string;
    description?: string | null;
    orderIndex: number;
    lessons: LessonDto[];
    quizzes: CourseQuizDto[];
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
    curriculum?: ChapterWithLessonsDto[];
    quizzes?: CourseQuizDto[];
}

export interface CourseQuizDto {
    id: string;
    courseId: string;
    chapterId?: string | null;
    lessonId?: string | null;
    title: string;
    description?: string | null;
    passingScore: number;
    timeLimitMinutes?: number | null;
    maxAttempts: number;
    isFinalQuiz: boolean;
    questionCount: number;
    createdAt: string;
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
