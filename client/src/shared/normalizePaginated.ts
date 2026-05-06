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

export function normalizePaginated<T>(wrapper: ApiResponseWrapper<T>): PaginatedApiResponse<T> {
    const inner = wrapper.data ?? wrapper.Data;

    if (Array.isArray(inner)) {
        return {
            success: wrapper.success ?? wrapper.Success ?? true,
            data: inner as unknown as T,
            pageNumber: wrapper.pageNumber ?? wrapper.PageNumber ?? 1,
            pageSize: wrapper.pageSize ?? wrapper.PageSize ?? 10,
            totalRecords: wrapper.totalRecords ?? wrapper.TotalRecords ?? inner.length,
            totalPages: wrapper.totalPages ?? wrapper.TotalPages ?? 0,
            message: wrapper.message ?? null,
            errors: wrapper.errors ?? null,
        };
    }

    if (inner && typeof inner === 'object' && ('data' in inner || 'Data' in inner)) {
        const n = inner as Record<string, unknown>;
        return {
            success: wrapper.success ?? wrapper.Success ?? true,
            data: (n.data ?? n.Data) as unknown as T,
            pageNumber: (n.pageNumber ?? n.PageNumber ?? wrapper.pageNumber ?? wrapper.PageNumber ?? 1) as number,
            pageSize: (n.pageSize ?? n.PageSize ?? wrapper.pageSize ?? wrapper.PageSize ?? 10) as number,
            totalRecords: (n.totalRecords ?? n.TotalRecords ?? wrapper.totalRecords ?? wrapper.TotalRecords ?? 0) as number,
            totalPages: (n.totalPages ?? n.TotalPages ?? wrapper.totalPages ?? wrapper.TotalPages ?? 0) as number,
            message: wrapper.message ?? null,
            errors: wrapper.errors ?? null,
        };
    }

    return {
        success: wrapper.success ?? wrapper.Success ?? true,
        data: inner as unknown as T,
        pageNumber: wrapper.pageNumber ?? wrapper.PageNumber ?? 1,
        pageSize: wrapper.pageSize ?? wrapper.PageSize ?? 10,
        totalRecords: wrapper.totalRecords ?? wrapper.TotalRecords ?? 0,
        totalPages: wrapper.totalPages ?? wrapper.TotalPages ?? 0,
        message: wrapper.message ?? null,
        errors: wrapper.errors ?? null,
    };
}