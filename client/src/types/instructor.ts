export type CourseStatus = 'Draft' | 'Pending' | 'Published' | 'Rejected';

export interface InstructorCourseListItem {
  id: string;
  title: string;
  price: number;
  status: CourseStatus; 
  enrollmentCount: number;
  updatedAt: string;
}

export interface UpdateCourseInfoPayload {
  title: string;
  subtitle?: string;
  description?: string;
  price: number;
  thumbnailUrl?: string;
}

export interface ChapterDto {
  id: string;
  title: string;
  order: number; 
  lessons: LessonDto[];
}

export interface LessonDto {
  id: string;
  title: string;
  videoUrl: string;
  durationSecond: number;
  isPreview: boolean;
  order: number;
}
