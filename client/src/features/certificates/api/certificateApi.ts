import api from '@/lib/axios';
import { getData } from '@/shared';
import type { PaginatedApiResponse, ApiResponseWrapper } from '@/shared';
import { normalizePaginated } from '@/shared';
import type { CertificateDto } from '../types';

export interface CertificateQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
}

export const certificateApi = {
    getMyCertificates: async (params?: CertificateQueryParams): Promise<PaginatedApiResponse<CertificateDto[]>> => {
        const cleanParams = params ? {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 10,
            search: params.search?.trim() || undefined,
            sortBy: params.sortBy || undefined,
        } : undefined;

        const res = await api.get('/certificates/me', { params: cleanParams }) as ApiResponseWrapper<CertificateDto[]>;
        return normalizePaginated(res);
    },


    getCertificateById: async (certificateId: string): Promise<CertificateDto> => {
        const res = await api.get(`/certificates/${certificateId}`) as ApiResponseWrapper<CertificateDto>;
        const d = getData(res);
        if (!d) throw new Error('Certificate not found');
        return d;
    },

    getCertificateByCourse: async (courseId: string): Promise<CertificateDto> => {
        const res = await api.get(`/certificates/course/${courseId}`) as ApiResponseWrapper<CertificateDto>;
        const d = getData(res);
        if (!d) throw new Error('Certificate not found');
        return d;
    },

    issueCertificate: async (courseId: string): Promise<CertificateDto> => {
        const res = await api.post(`/certificates/course/${courseId}`) as ApiResponseWrapper<CertificateDto>;
        const d = getData(res);
        if (!d) throw new Error('Failed to issue certificate');
        return d;
    },
};
