// ─── Transaction Types ──────────────────────────────────────────────────────

export type TransactionType = 'Deposit' | 'Withdraw' | 'Purchase';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled';

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