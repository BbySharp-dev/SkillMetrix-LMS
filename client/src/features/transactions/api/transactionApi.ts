import type { ApiResponse } from '@/types/api';
import type { TransactionDto } from '../types/transaction';
import api from '@/lib/axios';

export const transactionApi = {
    getMyTransactions: (): Promise<ApiResponse<TransactionDto[]>> =>
        api.get('/Transactions/me'),
};
