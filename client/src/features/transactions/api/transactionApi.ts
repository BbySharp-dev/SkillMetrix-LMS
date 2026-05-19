import type { PaginatedApiResponse, ApiResponseWrapper } from '@/shared';
import { normalizePaginated } from '@/shared';
import type { TransactionDto } from '../types';
import api from '@/lib/axios';

export interface TransactionQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    type?: string;
    sortBy?: string;
}

export const transactionApi = {
    getMyTransactions: async (params?: TransactionQueryParams): Promise<PaginatedApiResponse<TransactionDto[]>> => {
        const cleanParams = params ? {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 10,
            search: params.search?.trim() || undefined,
            status: params.status || undefined,
            type: params.type || undefined,
            sortBy: params.sortBy || undefined,
        } : undefined;

        const res = await api.get('/transactions/me', { params: cleanParams }) as ApiResponseWrapper<TransactionDto[]>;
        return normalizePaginated(res);
    },
};

