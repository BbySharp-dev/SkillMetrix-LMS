import api from '@/lib/axios';
import { getData } from '@/shared';
import type { ApiResponseWrapper } from '@/shared';
import type { CertificateDto } from '../types';

export const certificateApi = {
    getMyCertificates: async (): Promise<CertificateDto[]> => {
        const res = await api.get('/certificates/me') as ApiResponseWrapper<CertificateDto[]>;
        return getData(res) ?? [];
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
