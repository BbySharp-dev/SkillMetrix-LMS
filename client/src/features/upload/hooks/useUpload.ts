import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '../api/uploadApi';
import { toast } from 'sonner';
import { ApiError } from '@/shared';

export const useUpload = () => {
    const uploadImageMutation = useMutation({
        mutationFn: (file: File) => uploadApi.uploadImage(file),
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Upload ảnh thất bại');
        },
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: (file: File) => uploadApi.uploadDocument(file),
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Upload tài liệu thất bại');
        },
    });

    return {
        uploadImage: uploadImageMutation,
        uploadDocument: uploadDocumentMutation,
    };
};
