import api from '@/lib/axios';
import type { ApiResponse } from '@/shared';

export interface DocumentUploadResult {
  url: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
}

export const uploadApi = {
    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }) as unknown as ApiResponse<string>;
        return res.data!;
    },

    uploadDocument: async (file: File): Promise<DocumentUploadResult> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post<{ data: DocumentUploadResult }>(
            '/upload/document',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return res.data.data!;
    },
};
