// ─── Progress Types ──────────────────────────────────────────────────────────

export interface LessonProgressDto {
    lessonId: string;
    isCompleted: boolean;
    lastWatchedSecond: number;
    completedAt?: string;
}

export interface CourseProgressSummary {
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    percentComplete: number;
    lastActivityAt?: string;
}
