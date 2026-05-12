import api from '@/lib/axios';
import { getData, normalizePaginated } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';
import type { PaginatedApiResponse } from '@/shared';

export interface AdminCourseItem {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string | null;
    instructorName: string;
    enrollmentCount: number;
    status: string;
    createdAt: string;
    updatedAt: string | null;
    rating: number;
    rejectionReason: string | null;
}

export interface AdminCourseQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}

export type UserRole = 'Student' | 'Instructor' | 'Admin' | 'Moderator';

export interface AdminUserItem {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    createdAt: string;
    enrollmentCount?: number;
    courseCount?: number;
}

/** Normalize UserRole từ number → string */
const roleMap: Record<number, UserRole> = {
    1: 'Student',
    2: 'Instructor',
    3: 'Moderator',
    4: 'Admin',
};

function normalizeRole(raw: unknown): UserRole {
    if (typeof raw === 'string') return raw as UserRole;
    if (typeof raw === 'number' && raw in roleMap) return roleMap[raw];
    return 'Student';
}

export interface AdminUserQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    role?: string;
}

export interface UpdateRolePayload {
    role: UserRole;
}

export interface CreateUserPayload {
    email: string;
    fullName: string;
    password: string;
    role: UserRole;
}

export interface AdminOverview {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    totalStudents: number;
    totalInstructors: number;
    totalModerators: number;
    totalAdmins: number;
    draftCourses: number;
    pendingCourses: number;
    publishedCourses: number;
    rejectedCourses: number;
}

export interface AdminRejectPayload {
    reason: string;
}

export const adminApi = {
    getCourses: async (params: AdminCourseQueryParams): Promise<PaginatedApiResponse<AdminCourseItem[]>> => {
        const cleanParams = {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 20,
            search: params.search?.trim() || undefined,
            status: params.status,
        };
        const res = await api.get('/admin/courses', { params: cleanParams }) as ApiResponseWrapper<AdminCourseItem[]>;
        return normalizePaginated(res);
    },

    /** Admin duyệt khóa học */
    approveCourse: async (courseId: string): Promise<void> => {
        await api.put(`/admin/courses/${courseId}/approve`);
    },

    /** Admin từ chối khóa học kèm lý do */
    rejectCourse: async (courseId: string, payload: AdminRejectPayload): Promise<void> => {
        await api.put(`/admin/courses/${courseId}/reject`, payload);
    },

    /** Lấy chi tiết khóa học cho admin */
    getCourseDetail: async (courseId: string): Promise<AdminCourseItem> => {
        const res = await api.get(`/courses/${courseId}`) as ApiResponseWrapper<AdminCourseItem & { Id?: string }>;
        const data = getData<AdminCourseItem>(res);
        if (!data) throw new Error('Course not found');
        return { ...data, id: data.id ?? res.Data?.Id ?? '' };
    },

    // ─── Users ───────────────────────────────────────────────────────────────

    getUsers: async (params: AdminUserQueryParams): Promise<PaginatedApiResponse<AdminUserItem[]>> => {
        const cleanParams = {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 20,
            search: params.search?.trim() || undefined,
            role: params.role,
        };
        const res = await api.get('/admin/users', { params: cleanParams }) as ApiResponseWrapper<AdminUserItem[]>;
        const normalized = normalizePaginated(res);
        if (normalized.data) {
            for (const user of normalized.data) {
                user.role = normalizeRole(user.role);
            }
        }
        return normalized;
    },

    /** Admin đổi role user */
    updateUserRole: async (userId: string, payload: UpdateRolePayload): Promise<void> => {
        await api.put(`/admin/users/${userId}/role`, payload);
    },

    /** Admin tạo user mới */
    createUser: async (payload: CreateUserPayload): Promise<AdminUserItem> => {
        const res = await api.post('/admin/users', payload) as ApiResponseWrapper<AdminUserItem & { Id?: string }>;
        const data = getData<AdminUserItem>(res);
        if (!data) throw new Error('Create user failed');
        return { ...data, id: data.id ?? res.Data?.Id ?? '' };
    },

    /** Admin xóa user */
    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/admin/users/${userId}`);
    },

    getOverview: async (): Promise<AdminOverview> => {
        const res = await api.get('/statistics/admin/overview') as ApiResponseWrapper<AdminOverview>;
        const raw = getData<AdminOverview>(res);
        if (!raw) throw new Error('Failed to fetch overview');
        const r = raw as unknown as Record<string, unknown>;
        const n = (k: string) => (r[k] as number | undefined) ?? 0;
        return {
            totalUsers: n('totalUsers') || n('TotalUsers'),
            totalCourses: n('totalCourses') || n('TotalCourses'),
            totalEnrollments: n('totalEnrollments') || n('TotalEnrollments'),
            totalRevenue: n('totalRevenue') || n('TotalRevenue'),
            totalStudents: n('totalStudents') || n('TotalStudents'),
            totalInstructors: n('totalInstructors') || n('TotalInstructors'),
            totalModerators: n('totalModerators') || n('TotalModerators'),
            totalAdmins: n('totalAdmins') || n('TotalAdmins'),
            draftCourses: n('draftCourses') || n('DraftCourses'),
            pendingCourses: n('pendingCourses') || n('PendingCourses'),
            publishedCourses: n('publishedCourses') || n('PublishedCourses'),
            rejectedCourses: n('rejectedCourses') || n('RejectedCourses'),
        } as AdminOverview;
    },
};