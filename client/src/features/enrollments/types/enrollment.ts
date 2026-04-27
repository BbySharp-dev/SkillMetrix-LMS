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
