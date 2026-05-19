export type TransactionType = 'Deposit' | 'Withdraw' | 'Purchase' | number | string;
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled' | number | string;

export interface TransactionDto {
    id: string;
    userId: string;
    enrollmentId?: string;
    courseId?: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    description?: string;
    createdAt: string;
    courseTitle?: string;
}

