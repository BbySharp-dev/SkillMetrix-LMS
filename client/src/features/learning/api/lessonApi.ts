import api from '@/lib/axios';
import { getData } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';
import type { LessonDocumentDto } from '@/features/courses/types';

const LESSON_DOCS_URL = '/lessons';

export const lessonApi = {
  getDocuments: async (lessonId: string): Promise<LessonDocumentDto[]> => {
    const res = await api.get(`${LESSON_DOCS_URL}/${lessonId}/documents`) as ApiResponseWrapper<LessonDocumentDto[]>;
    return getData(res) ?? [];
  },

  createDocument: async (
    lessonId: string,
    payload: Omit<LessonDocumentDto, 'id' | 'lessonId' | 'createdAt' | 'fileTypeLabel' | 'formattedSize'>
  ): Promise<LessonDocumentDto> => {
    const res = await api.post(`${LESSON_DOCS_URL}/${lessonId}/documents`, payload) as ApiResponseWrapper<LessonDocumentDto>;
    const data = getData(res);
    if (!data) throw new Error('Failed to create document');
    return data;
  },

  deleteDocument: async (lessonId: string, docId: string): Promise<void> => {
    await api.delete(`${LESSON_DOCS_URL}/${lessonId}/documents/${docId}`);
  },
};
