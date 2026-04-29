// TransactionType: 1=Deposit, 2=Withdraw, 3=Purchase
// TransactionStatus: 0=Pending, 1=Processing, 2=Completed, 3=Failed, 4=Cancelled
export type TransactionType = 1 | 2 | 3 | number;
export type TransactionStatus = 0 | 1 | 2 | 3 | 4 | number;

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
