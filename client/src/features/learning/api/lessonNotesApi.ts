import api from '@/lib/axios';
import { getData } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';
import type { LessonNoteDto } from '@/features/courses/types';

export const lessonNotesApi = {
    getAll: async (lessonId: string): Promise<LessonNoteDto[]> => {
        const res = await api.get(`/lessons/${lessonId}/notes`) as ApiResponseWrapper<LessonNoteDto[]>;
        return getData(res) ?? [];
    },

    create: async (
        lessonId: string,
        payload: { content: string; videoTimestampSeconds: number }
    ): Promise<LessonNoteDto> => {
        const res = await api.post(`/lessons/${lessonId}/notes`, payload) as ApiResponseWrapper<LessonNoteDto>;
        const data = getData(res);
        if (!data) throw new Error('Failed to create note');
        return data;
    },

    update: async (
        lessonId: string,
        noteId: string,
        payload: { content: string }
    ): Promise<LessonNoteDto> => {
        const res = await api.put(`/lessons/${lessonId}/notes/${noteId}`, payload) as ApiResponseWrapper<LessonNoteDto>;
        const data = getData(res);
        if (!data) throw new Error('Failed to update note');
        return data;
    },

    delete: async (lessonId: string, noteId: string): Promise<void> => {
        await api.delete(`/lessons/${lessonId}/notes/${noteId}`);
    },
};
