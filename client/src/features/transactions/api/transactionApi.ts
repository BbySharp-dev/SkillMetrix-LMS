import type { ApiResponse } from '@/shared';
import type { TransactionDto } from '../types';
import api from '@/lib/axios';

export const transactionApi = {
    getMyTransactions: (): Promise<ApiResponse<TransactionDto[]>> =>
        api.get('/transactions/me'),
};
