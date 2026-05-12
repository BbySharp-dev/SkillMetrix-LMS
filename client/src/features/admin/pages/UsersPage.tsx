import { useState } from 'react';
import { Users, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { useAdminUsers, useAdminUserMutations, useAdminOverview } from '../hooks/useAdminUsers';
import { RoleStats, UsersTable, ChangeRoleDialog, DeleteUserDialog, CreateUserDialog } from './components';
import type { UserRole } from '../api/adminApi';
import { formatDate } from '@/lib/utils';

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('All');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const [changingUser, setChangingUser] = useState<{ id: string; name: string; currentRole: UserRole } | null>(null);
    const [newRole, setNewRole] = useState<UserRole | null>(null);
    const [deletingUser, setDeletingUser] = useState<{ id: string; name: string } | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 400);
    const { data: overviewData } = useAdminOverview();
    const { data, isLoading, isError, refetch } = useAdminUsers({
        search: debouncedSearch || undefined,
        role: roleFilter === 'All' ? undefined : roleFilter,
        pageNumber: page,
        pageSize,
    });

    const { updateUserRole, deleteUser } = useAdminUserMutations();

    const users = data?.data ?? [];
    const totalRecords = data?.totalRecords ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const roleCounts: Record<string, number> = {
        Admin: overviewData?.totalAdmins ?? 0,
        Moderator: overviewData?.totalModerators ?? 0,
        Instructor: overviewData?.totalInstructors ?? 0,
        Student: overviewData?.totalStudents ?? 0,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Users className="text-indigo-600 size-5" />
                        </div>
                        Quản lý người dùng
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tổng cộng <strong className="text-gray-900">{totalRecords}</strong> người dùng
                    </p>
                </div>
                <Button className="h-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700" onClick={() => setCreateDialogOpen(true)}>
                    <PlusCircle className="size-4 mr-2" />
                    Tạo người dùng
                </Button>
            </div>

            <RoleStats roleCounts={roleCounts} roleFilter={roleFilter} onRoleClick={(role) => { setRoleFilter(role); setPage(1); }} />

            <Card className="p-4 rounded-xl border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên, email..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-10 h-10 rounded-xl border-gray-200 focus:border-indigo-400"
                    />
                </div>
            </Card>

            <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
                <UsersTable
                    users={users}
                    isLoading={isLoading}
                    isError={isError}
                    searchTerm={searchTerm}
                    onRoleChange={(user) => { setChangingUser(user); setNewRole(user.currentRole); }}
                    onDelete={(user) => setDeletingUser(user)}
                    formatDate={formatDate}
                />

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <Button variant="outline" size="sm" className="h-9 rounded-xl border-gray-200" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink className="font-bold">{page} / {totalPages}</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button variant="outline" size="sm" className="h-9 rounded-xl border-gray-200" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </Card>

            <ChangeRoleDialog
                open={!!changingUser}
                onOpenChange={(open) => { if (!open) { setChangingUser(null); setNewRole(null); } }}
                user={changingUser}
                newRole={newRole}
                onRoleChange={setNewRole}
                isPending={updateUserRole.isPending}
                onSubmit={() => {
                    if (changingUser && newRole) {
                        updateUserRole.mutate(
                            { userId: changingUser.id, role: newRole },
                            { onSuccess: () => { setChangingUser(null); setNewRole(null); } }
                        );
                    }
                }}
            />

            <DeleteUserDialog
                open={!!deletingUser}
                onOpenChange={(open) => { if (!open) setDeletingUser(null); }}
                user={deletingUser}
                onConfirm={() => {
                    if (deletingUser) {
                        deleteUser.mutate(deletingUser.id, {
                            onSuccess: () => {
                                setDeletingUser(null);
                                refetch();
                            },
                        });
                    }
                }}
                isPending={deleteUser.isPending}
            />

            <CreateUserDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={refetch}
            />
        </div>
    );
}