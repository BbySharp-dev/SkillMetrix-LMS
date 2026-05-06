import { 
  useQuery, 
  useMutation, 
  type UseQueryOptions, 
  type UseMutationOptions,
  type DefaultError
} from "@tanstack/react-query";

/**
 * useApiQuery — generic query hook cho mọi API call.
 * Sử dụng kết hợp với Axios Interceptor (api instance) để tự động xử lý Token & Refresh.
 */
export function useApiQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) {
  return useQuery(options);
}

/**
 * useApiMutation — generic mutation hook cho mọi POST/PUT/DELETE call.
 */
export function useApiMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  return useMutation(options);
}