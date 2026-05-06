export const queryKeys = {
    courses: {
        all: ['courses'] as const,
        list: (params: object) => ['courses', 'list', params] as const,
        detail: (id: string) => ['courses', 'detail', id] as const,
        curriculum: (id: string) => ['courses', 'curriculum', id] as const,
    },
    enrollments: {
        all: ['enrollments'] as const,
        me: ['enrollments', 'me'] as const,
        check: (courseId: string) => ['enrollments', 'check', courseId] as const,
    },
    progress: {
        all: ['progress'] as const,
        lesson: (lessonId: string) => ['progress', 'lesson', lessonId] as const,
        course: (courseId: string) => ['progress', 'course', courseId] as const,
    },
    transactions: {
        all: ['transactions'] as const,
        me: ['transactions', 'me'] as const,
    },
    instructor: {
        all: ['instructorStats'] as const,
        overview: () => [...queryKeys.instructor.all, 'overview'] as const,
        revenue: (year?: number) => [...queryKeys.instructor.all, 'revenue', year] as const,
        activity: (limit?: number) => [...queryKeys.instructor.all, 'activity', limit] as const,
        performance: (courseId?: string) => [...queryKeys.instructor.all, 'performance', courseId] as const,
    },
} as const;