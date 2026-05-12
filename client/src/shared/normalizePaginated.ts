import type { PaginatedApiResponse } from './api';

export interface ApiResponseWrapper<T> {
    success?: boolean;
    Success?: boolean;
    data?: T | null;
    Data?: T | null;
    message?: string | null;
    timestamp?: string;
    pageNumber?: number;
    PageNumber?: number;
    pageSize?: number;
    PageSize?: number;
    totalRecords?: number;
    TotalRecords?: number;
    totalPages?: number;
    TotalPages?: number;
    errors?: string[] | null;
}

export function getData<T>(res: ApiResponseWrapper<T>): T | null {
    return res?.data ?? res?.Data ?? null;
}

export function normalizePaginated<T>(res: ApiResponseWrapper<T>): PaginatedApiResponse<T> {
    const inner = getData<T>(res);

    if (inner !== null && typeof inner === 'object') {
        const n = inner as Record<string, unknown>;
        if ('pageNumber' in n || 'PageNumber' in n || 'totalRecords' in n || 'TotalRecords' in n) {
            return {
                success: res.success ?? res.Success ?? true,
                data: (n.data ?? n.Data ?? null) as T | null,
                pageNumber: (n.pageNumber ?? n.PageNumber ?? 1) as number,
                pageSize: (n.pageSize ?? n.PageSize ?? 12) as number,
                totalRecords: (n.totalRecords ?? n.TotalRecords ?? 0) as number,
                totalPages: (n.totalPages ?? n.TotalPages ?? 0) as number,
                message: (n.message as string | null) ?? null,
                errors: (n.errors as string[] | null) ?? null,
            };
        }
    }

    const pageNumber = (res.pageNumber ?? res.PageNumber ?? 1) as number;
    const pageSize = (res.pageSize ?? res.PageSize ?? 12) as number;
    const totalRecords = (res.totalRecords ?? res.TotalRecords ?? 0) as number;

    return {
        success: res.success ?? res.Success ?? true,
        data: inner,
        pageNumber,
        pageSize,
        totalRecords,
        totalPages: pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 0,
        message: res.message ?? null,
        errors: res.errors ?? null,
    };
}
