import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi, type AdminUserQueryParams, type UpdateRolePayload, type CreateUserPayload } from '../api/adminApi';
import { queryKeys } from '@/shared';
import { ApiError } from '@/shared';

export const useAdminUsers = (params: AdminUserQueryParams) => {
    return useQuery({
        queryKey: [...queryKeys.admin.all, 'users', params] as const,
        queryFn: () => adminApi.getUsers(params),
        placeholderData: keepPreviousData,
    });
};

export const useAdminOverview = () => {
    return useQuery({
        queryKey: [...queryKeys.admin.all, 'overview'] as const,
        queryFn: () => adminApi.getOverview(),
        staleTime: 30_000,
    });
};

export const useAdminUserMutations = () => {
    const qc = useQueryClient();

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: UpdateRolePayload['role'] }) =>
            adminApi.updateUserRole(userId, { role }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [...queryKeys.admin.all, 'users'] });
            toast.success('Cập nhật vai trò thành công');
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Cập nhật vai trò thất bại');
        },
    });

    const createUserMutation = useMutation({
        mutationFn: (payload: CreateUserPayload) => adminApi.createUser(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [...queryKeys.admin.all, 'users'] });
            toast.success('Tạo tài khoản thành công');
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Tạo tài khoản thất bại');
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) => adminApi.deleteUser(userId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [...queryKeys.admin.all, 'users'] });
            toast.success('Xóa tài khoản thành công');
        },
        onError: (err: unknown) => {
            const error = err as ApiError;
            toast.error(error.message ?? 'Xóa tài khoản thất bại');
        },
    });

    return {
        updateUserRole: updateRoleMutation,
        createUser: createUserMutation,
        deleteUser: deleteUserMutation,
    };
};
