export interface LessonProgressDto {
    lessonId: string;
    isCompleted: boolean;
    lastWatchedSecond: number;
    completedAt: string | null;
    lastUpdatedAt: string;
}

export interface CourseProgressDto {
    courseId: string;
    totalLessons: number;
    completedLessons: number;
    completionPercent: number;
}

export interface UpdateProgressPayload {
    lastWatchedSecond: number;
}

export interface CourseProgressSummary {
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    percentComplete: number;
    lastActivityAt?: string;
}
