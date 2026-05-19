import { api } from '@/lib/axios';
import type { LessonDocumentDto } from '@/features/courses/types';

const LESSON_DOCS_URL = '/lessons';

export const lessonApi = {
  getDocuments: async (lessonId: string): Promise<LessonDocumentDto[]> => {
    const { data } = await api.get<{ data: LessonDocumentDto[] }>(
      `${LESSON_DOCS_URL}/${lessonId}/documents`
    );
    return data.data ?? [];
  },

  createDocument: async (
    lessonId: string,
    payload: Omit<LessonDocumentDto, 'id' | 'lessonId' | 'createdAt' | 'fileTypeLabel' | 'formattedSize'>
  ): Promise<LessonDocumentDto> => {
    const { data } = await api.post<{ data: LessonDocumentDto }>(
      `${LESSON_DOCS_URL}/${lessonId}/documents`,
      payload
    );
    return data.data;
  },

  deleteDocument: async (lessonId: string, docId: string): Promise<void> => {
    await api.delete(`${LESSON_DOCS_URL}/${lessonId}/documents/${docId}`);
  },
};
