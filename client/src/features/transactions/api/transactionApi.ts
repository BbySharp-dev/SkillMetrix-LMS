import type { ApiResponse } from '@/shared/api';
import type { TransactionDto } from '../types';
import api from '@/lib/axios';

export const transactionApi = {
    getMyTransactions: (): Promise<ApiResponse<TransactionDto[]>> =>
        api.get('/Transactions/me'),
};
