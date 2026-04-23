export interface PagedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  timestamp?: string;
}

export interface CourseListItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  price: number;
  ratingAverage: number;
  enrollmentCount: number;
  instructorName: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
}

export interface LessonItemDto {
  id: string;
  title: string;
  durationSeconds: number;
  isFreePreview: boolean;
  order: number;
}

export interface ChapterItemDto {
  id: string;
  title: string;
  order: number;
  lessons: LessonItemDto[];
}

export interface CourseDetailDto {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailUrl?: string;
  price: number;
  ratingAverage: number;
  enrollmentCount: number;
  instructorName: string;
  totalDurationSecond: number;
  totalLessons: number;
  chapters: ChapterItemDto[];
}

export interface CourseQueryParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}
