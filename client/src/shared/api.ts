export interface PaginationMetadata {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string | null;
    data: T | null;
    errors?: string[] | null;
    timestamp?: string;
}

export interface PaginatedApiResponse<T> extends PaginationMetadata {
    success: boolean;
    message: string | null;
    data: T | null;
    errors?: string[] | null;
    timestamp?: string;
}
