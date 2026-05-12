import api from '@/lib/axios';
import { getData } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';


export interface InstructorProfile {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    bio: string;
    createdAt: string;
    totalCourses: number;
    publishedCourses: number;
    totalStudents: number;
    averageRating: number | null;
    totalLessons: number;
}

export interface InstructorCourse {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string | null;
    status: string;
    rating: number | null;
    enrollmentCount: number;
    lessonCount: number;
    durationMinutes: number;
    createdAt: string;
    publishedAt: string | null;
}

export interface StudentProfile {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
    totalEnrolledCourses: number;
    completedCourses: number;
    totalLessonsCompleted: number;
    totalSpent: number;
}

export interface StudentEnrollment {
    id: string;
    courseId: string;
    courseTitle: string;
    courseThumbnail: string | null;
    pricePaid: number;
    enrolledAt: string;
    completedLessons: number;
    totalLessons: number;
    completionPercent: number;
    instructorName: string;
}


export const profileApi = {
    getInstructorProfile: async (instructorId: string): Promise<InstructorProfile> => {
        const res = await api.get(`/profiles/instructors/${instructorId}`) as ApiResponseWrapper<InstructorProfile>;
        const data = getData(res);
        if (!data) throw new Error('Instructor not found');
        return data;
    },

    getInstructorCourses: async (instructorId: string, status?: string): Promise<InstructorCourse[]> => {
        const params = status ? { status } : {};
        const res = await api.get(`/profiles/instructors/${instructorId}/courses`, { params }) as ApiResponseWrapper<InstructorCourse[]>;
        return getData(res) ?? [];
    },

    getStudentProfile: async (studentId: string): Promise<StudentProfile> => {
        const res = await api.get(`/profiles/students/${studentId}`) as ApiResponseWrapper<StudentProfile>;
        const data = getData(res);
        if (!data) throw new Error('Student not found');
        return data;
    },

    getStudentEnrollments: async (studentId: string): Promise<StudentEnrollment[]> => {
        const res = await api.get(`/profiles/students/${studentId}/enrollments`) as ApiResponseWrapper<StudentEnrollment[]>;
        return getData(res) ?? [];
    },
};
