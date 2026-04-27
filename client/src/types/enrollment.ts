// ─── Enrollment Types ─────────────────────────────────────────────────────────

export interface EnrollmentCourseInfo {
    id: string;
    title: string;
    thumbnail?: string;
    instructorName: string;
    chapterCount?: number;
    lessonCount?: number;
}

export interface EnrollmentDto {
    id: string;
    userId: string;
    courseId: string;
    pricePaid: number;
    enrolledAt: string;
    course?: EnrollmentCourseInfo;
}

export interface EnrollmentCourseProgress {
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    thumbnail?: string;
    instructorName: string;
    totalLessons: number;
    completedLessons: number;
    percentComplete: number;
    lastActivityAt?: string;
    enrolledAt: string;
}
