export class ApiError extends Error {
    statusCode: number;
    errors?: string[];
    constructor(message: string, statusCode: number = 0, errors?: string[]) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export function assertSuccess<T>(res: unknown, fallbackStatus = 0): asserts res is { data: T } {
    const r = res as { success?: boolean; message?: string; errors?: string[] | null } | undefined;
    if (!r || r.success === false || r.success === undefined) {
        const msg = r?.message ?? 'Đã xảy ra lỗi';
        const errs = r?.errors ?? undefined;
        throw new ApiError(msg, fallbackStatus, errs);
    }
}