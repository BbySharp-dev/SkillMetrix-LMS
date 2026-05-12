import api from '@/lib/axios';
import type { ApiResponse } from '@/shared';

export interface ChapterResponseDto {
    id: string;
    title: string;
    orderIndex: number;
}

export const chapterApi = {
    getChapters: async (courseId: string): Promise<ChapterResponseDto[]> => {
        const res = await api.get(`/courses/${courseId}/chapters`) as unknown as ApiResponse<ChapterResponseDto[]>;
        return res.data ?? [];
    },

    createChapter: async (courseId: string, data: { title: string }): Promise<ChapterResponseDto> => {
        const res = await api.post(`/courses/${courseId}/chapters`, data) as unknown as ApiResponse<ChapterResponseDto>;
        return res.data!;
    },

    updateChapter: async (courseId: string, id: string, data: { title: string }): Promise<ChapterResponseDto> => {
        const res = await api.put(`/courses/${courseId}/chapters/${id}`, data) as unknown as ApiResponse<ChapterResponseDto>;
        return res.data!;
    },

    deleteChapter: async (courseId: string, id: string): Promise<void> => {
        await api.delete(`/courses/${courseId}/chapters/${id}`);
    },

    reorderChapter: async (courseId: string, id: string, data: { oldIndex: number, newIndex: number }): Promise<void> => {
        await api.put(`/courses/${courseId}/chapters/${id}/reorder`, data);
    }
};
