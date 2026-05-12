// Base hooks for features - standardized patterns

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared';

// Types
export interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
  successMessage?: string;
  errorMessage?: string;
}

export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  placeholderData?: typeof keepPreviousData;
}


/**
 * useList - Standard paginated list query hook
 */
export function useList<TData, TParams extends object>({
  queryKey,
  queryFn,
  params,
  options = {},
}: {
  queryKey: readonly unknown[];
  queryFn: (params: TParams) => Promise<{ data: TData[]; totalRecords: number }>;
  params: TParams;
  options?: {
    enabled?: boolean;
    staleTime?: number;
  };
}) {
  const { enabled = true, staleTime = 60_000 } = options;

  return useQuery({
    queryKey,
    queryFn: () => queryFn(params),
    enabled,
    staleTime,
    placeholderData: keepPreviousData,
  });
}

/**
 * useDetail - Standard single item query hook
 */
export function useDetail<TData>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 60_000,
}: {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
  });
}


/**
 * useCreate - Standard create mutation hook
 */
export function useCreate<TData, TVariables>({
  mutationFn,
  queryKeysToInvalidate,
  options = {},
}: {
  mutationFn: (data: TVariables) => Promise<TData>;
  queryKeysToInvalidate: (readonly unknown[])[];
  options?: MutationOptions<TData>;
}) {
  const { onSuccess, onError, successMessage, errorMessage } = options;
  const qc = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Invalidate query keys
      queryKeysToInvalidate.forEach((key) => {
        qc.invalidateQueries({ queryKey: key });
      });

      // Show success toast
      if (successMessage) {
        toast.success(successMessage);
      }

      // Call custom callback
      onSuccess?.(data);
    },
    onError: (error) => {
      const err = error as ApiError;
      if (errorMessage) {
        toast.error(errorMessage);
      }
      onError?.(err);
    },
  });
}

/**
 * useUpdate - Standard update mutation hook
 */
export function useUpdate<TData, TVariables>({
  mutationFn,
  queryKeysToInvalidate,
  options = {},
}: {
  mutationFn: (data: TVariables) => Promise<TData>;
  queryKeysToInvalidate: (readonly unknown[])[];
  options?: MutationOptions<TData>;
}) {
  const { onSuccess, onError, successMessage, errorMessage } = options;
  const qc = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryKeysToInvalidate.forEach((key) => {
        qc.invalidateQueries({ queryKey: key });
      });

      if (successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.(data);
    },
    onError: (error) => {
      const err = error as ApiError;
      if (errorMessage) {
        toast.error(errorMessage);
      }
      onError?.(err);
    },
  });
}

/**
 * useDelete - Standard delete mutation hook
 */
export function useDelete<TData>({
  mutationFn,
  queryKeysToInvalidate,
  options = {},
}: {
  mutationFn: () => Promise<TData>;
  queryKeysToInvalidate: (readonly unknown[])[];
  options?: MutationOptions<TData>;
}) {
  const { onSuccess, onError, successMessage, errorMessage } = options;
  const qc = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryKeysToInvalidate.forEach((key) => {
        qc.invalidateQueries({ queryKey: key });
      });

      if (successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.(data);
    },
    onError: (error) => {
      const err = error as ApiError;
      if (errorMessage) {
        toast.error(errorMessage);
      }
      onError?.(err);
    },
  });
}


/**
 * useToast - Wrapper for toast notifications
 */
export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
  };
}


import { useState, useEffect } from 'react';

/**
 * useDebounce — trì hoãn cập nhật giá trị cho đến khi người dùng ngừng tương tác.
 */
export function useDebounce<T>(value: T, delay = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
