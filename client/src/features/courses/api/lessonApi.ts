import api from '@/lib/axios';
import { getData } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';

export interface LessonResponseDto {
    id: string;
    title: string;
    videoUrl: string | null;
    durationSeconds: number;
    isFreePreview: boolean;
}

export const lessonApi = {
    getLessons: async (chapterId: string): Promise<LessonResponseDto[]> => {
        const res = await api.get(`/chapters/${chapterId}/lessons`) as ApiResponseWrapper<LessonResponseDto[]>;
        return getData(res) ?? [];
    },

    createLesson: async (
        chapterId: string,
        data: { title: string; description?: string; durationSeconds?: number; isFreePreview?: boolean; videoUrl?: string | null }
    ): Promise<LessonResponseDto> => {
        const res = await api.post(`/chapters/${chapterId}/lessons`, data) as ApiResponseWrapper<LessonResponseDto>;
        const d = getData(res);
        if (!d) throw new Error('Failed to create lesson');
        return d;
    },

    updateLesson: async (
        id: string,
        data: { title?: string; description?: string; durationSeconds?: number; isFreePreview?: boolean; videoUrl?: string | null }
    ): Promise<LessonResponseDto> => {
        const res = await api.put(`/lessons/${id}`, data) as ApiResponseWrapper<LessonResponseDto>;
        const d = getData(res);
        if (!d) throw new Error('Failed to update lesson');
        return d;
    },

    deleteLesson: async (id: string): Promise<void> => {
        await api.delete(`/lessons/${id}`);
    },

    uploadVideo: async (id: string, file: File, durationSeconds?: number): Promise<LessonResponseDto> => {
        const formData = new FormData();
        formData.append('file', file);
        const url = durationSeconds !== undefined ? `/lessons/${id}/video?durationSeconds=${durationSeconds}` : `/lessons/${id}/video`;
        const res = await api.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }) as ApiResponseWrapper<LessonResponseDto>;
        const d = getData(res);
        if (!d) throw new Error('Upload failed');
        return d;
    }
};
