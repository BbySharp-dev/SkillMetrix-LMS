import api from '@/lib/axios';
import type { ApiResponse } from '@/shared/api';

export interface LessonResponseDto {
    id: string;
    title: string;
    videoUrl: string | null;
    durationSeconds: number;
    isFreePreview: boolean;
}

export const lessonApi = {
    getLessons: async (chapterId: string): Promise<LessonResponseDto[]> => {
        const res = await api.get(`/chapters/${chapterId}/lessons`) as unknown as ApiResponse<LessonResponseDto[]>;
        return res.data ?? [];
    },

    createLesson: async (chapterId: string, data: { title: string }): Promise<LessonResponseDto> => {
        const res = await api.post(`/chapters/${chapterId}/lessons`, data) as unknown as ApiResponse<LessonResponseDto>;
        return res.data!;
    },

    updateLesson: async (id: string, data: { title: string, isFreePreview: boolean }): Promise<LessonResponseDto> => {
        const res = await api.put(`/lessons/${id}`, data) as unknown as ApiResponse<LessonResponseDto>;
        return res.data!;
    },

    deleteLesson: async (id: string): Promise<void> => {
        await api.delete(`/lessons/${id}`);
    },

    uploadVideo: async (id: string, file: File): Promise<LessonResponseDto> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post(`/lessons/${id}/video`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }) as unknown as ApiResponse<LessonResponseDto>;
        return res.data!;
    }
};
