import { api } from '@/lib/axios';
import type { LessonNoteDto } from '@/features/courses/types';

const NOTES_URL = '/lessons';

export const lessonNotesApi = {
  getAll: async (lessonId: string): Promise<LessonNoteDto[]> => {
    const { data } = await api.get<{ data: LessonNoteDto[] }>(
      `${NOTES_URL}/${lessonId}/notes`
    );
    return data.data ?? [];
  },

  create: async (
    lessonId: string,
    payload: { content: string; videoTimestampSeconds: number }
  ): Promise<LessonNoteDto> => {
    const { data } = await api.post<{ data: LessonNoteDto }>(
      `${NOTES_URL}/${lessonId}/notes`,
      payload
    );
    return data.data;
  },

  update: async (
    lessonId: string,
    noteId: string,
    payload: { content: string }
  ): Promise<LessonNoteDto> => {
    const { data } = await api.put<{ data: LessonNoteDto }>(
      `${NOTES_URL}/${lessonId}/notes/${noteId}`,
      payload
    );
    return data.data;
  },

  delete: async (lessonId: string, noteId: string): Promise<void> => {
    await api.delete(`${NOTES_URL}/${lessonId}/notes/${noteId}`);
  },
};
