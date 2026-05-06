import api from '@/lib/axios';
import type { ApiResponse } from '@/shared/api';

export const uploadApi = {
    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }) as unknown as ApiResponse<string>;
        return res.data!;
    }
};
