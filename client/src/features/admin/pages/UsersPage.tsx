import { useState } from 'react';
import {
    Users, Search, ShieldCheck, Filter,
    MoreHorizontal, Mail, CalendarDays, Loader2,
    Briefcase, GraduationCap, Crown,
    CheckCircle2, AlertCircle, UserPlus,
    Trash2,
} from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { useAdminUsers, useAdminUserMutations, useAdminOverview } from '../hooks/useAdminUsers';
import type { UserRole, CreateUserPayload } from '../api/adminApi';

const roleConfig: Record<UserRole, { label: string; icon: typeof GraduationCap; color: string; bg: string }> = {
    Admin: { label: 'Quản trị viên', icon: Crown, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    Moderator: { label: 'Kiểm duyệt viên', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
    Instructor: { label: 'Giảng viên', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    Student: { label: 'Học viên', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
};
const allRoles: UserRole[] = ['Student', 'Instructor', 'Moderator', 'Admin'];

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('All');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [changingUser, setChangingUser] = useState<{ id: string; name: string; currentRole: UserRole } | null>(null);
    const [newRole, setNewRole] = useState<UserRole | null>(null);

    // Create user dialog state
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserPayload>({
        email: '',
        fullName: '',
        password: '',
        role: 'Student',
    });
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

    // Delete user dialog state
    const [deletingUser, setDeletingUser] = useState<{ id: string; name: string } | null>(null);

    const { data, isLoading, isError, refetch } = useAdminUsers({
        search: searchTerm || undefined,
        role: roleFilter === 'All' ? undefined : roleFilter,
        pageNumber: page,
        pageSize,
    });
    const { updateUserRole, createUser, deleteUser } = useAdminUserMutations();

    const users = data?.data ?? [];
    const totalRecords = data?.totalRecords ?? 0;
    const totalPages = data?.totalPages ?? 1;

    // Validation for create form
    const validateCreate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!createForm.email.trim()) errors.email = 'Email là bắt buộc';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) errors.email = 'Email không hợp lệ';
        if (!createForm.fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
        else if (createForm.fullName.trim().length < 2) errors.fullName = 'Tối thiểu 2 ký tự';
        if (!createForm.password) errors.password = 'Mật khẩu là bắt buộc';
        else if (createForm.password.length < 6) errors.password = 'Tối thiểu 6 ký tự';
        setCreateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateUser = () => {
        if (!validateCreate()) return;
        createUser.mutate(createForm, {
            onSettled: () => {
                setShowCreateDialog(false);
                setCreateForm({ email: '', fullName: '', password: '', role: 'Student' });
                setCreateErrors({});
            },
        });
    };

    const handleDeleteUser = () => {
        if (!deletingUser) return;
        deleteUser.mutate(deletingUser.id, {
            onSettled: () => setDeletingUser(null),
        });
    };
    const { data: overviewData } = useAdminOverview();
    const roleCounts = {
        Admin: overviewData?.totalAdmins ?? 0,
        Moderator: 0, // backend không track Moderator riêng, gộp vào stats khác nếu cần
        Instructor: overviewData?.totalInstructors ?? 0,
        Student: overviewData?.totalStudents ?? 0,
    };

    const handleRoleChange = () => {
        if (!changingUser || !newRole || newRole === changingUser.currentRole) return;
        updateUserRole.mutate(
            { userId: changingUser.id, role: newRole },
            { onSettled: () => { setChangingUser(null); setNewRole(null); } }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Users className="text-indigo-600 size-6" />
                        Quản lý người dùng
                    </h1>
                    <p className="text-sm font-medium text-gray-500">Quản lý tất cả tài khoản và vai trò trên hệ thống</p>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-black text-xs px-3 py-1.5 rounded-xl">
                    {totalRecords} người dùng
                </Badge>
                <Button
                    className="h-9 rounded-xl font-bold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => setShowCreateDialog(true)}
                >
                    <UserPlus className="size-4" />
                    Thêm người dùng
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allRoles.map(role => {
                    const cfg = roleConfig[role];
                    const Icon = cfg.icon;
                    return (
                        <Card
                            key={role}
                            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${roleFilter === role ? 'ring-2 ring-indigo-400 border-indigo-300' : 'border-gray-100 hover:border-gray-200'}`}
                            onClick={() => { setRoleFilter(prev => prev === role ? 'All' : role); setPage(1); }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cfg.bg}`}>
                                    <Icon className={`size-4 ${cfg.color}`} />
                                </div>
                                <div>
                                    <div className={`text-xl font-black ${cfg.color}`}>{roleCounts[role]}</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cfg.label}</div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input placeholder="Tìm theo tên hoặc email..." value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 rounded-xl font-bold border-gray-200 hover:bg-gray-50 flex-1 md:flex-none">
                                <Filter className="size-4 mr-2" />
                                {roleFilter === 'All' ? 'Tất cả vai trò' : roleConfig[roleFilter as UserRole]?.label ?? roleFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl border-gray-100 w-48">
                            <DropdownMenuItem onClick={() => { setRoleFilter('All'); setPage(1); }} className="rounded-lg py-2 font-bold text-sm">Tất cả vai trò</DropdownMenuItem>
                            {allRoles.map(role => {
                                const Icon = roleConfig[role].icon;
                                return (
                                    <DropdownMenuItem key={role} onClick={() => { setRoleFilter(role); setPage(1); }} className="rounded-lg py-2 font-bold text-sm flex items-center gap-2">
                                        <Icon className="size-4 text-gray-400" />{roleConfig[role].label}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold border-gray-200" onClick={() => refetch()}>Làm mới</Button>
                </div>
            </div>

            {isError && (
                <Card className="border border-red-100 bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-red-600 font-bold text-sm">
                        <AlertCircle className="size-4 shrink-0" />Không thể tải danh sách. Vui lòng thử lại.
                    </div>
                </Card>
            )}

            {/* Table */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-2xl">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-5 pl-6 w-[25%]">Người dùng</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Vai trò</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Email</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Ngày tham gia</TableHead>
                            <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-gray-500 pr-6">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i} className="border-gray-50">
                                    <TableCell className="py-5 pl-6"><div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-xl shrink-0" /><Skeleton className="h-4 w-32 rounded" /></div></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40 rounded" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                                    <TableCell><Skeleton className="h-9 w-28 ml-auto rounded-xl" /></TableCell>
                                </TableRow>
                            ))
                            : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                                            <Users className="size-12 text-gray-300" />
                                            <div className="space-y-1">
                                                <p className="text-base font-black text-gray-900">Không tìm thấy người dùng</p>
                                                <p className="text-sm font-medium text-gray-400">{searchTerm ? `Không có kết quả cho "${searchTerm}"` : 'Thử thay đổi bộ lọc để xem kết quả khác.'}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : users.map(user => {
                                const roleCfg = roleConfig[user.role as UserRole] ?? roleConfig['Student'];
                                const Icon = roleCfg.icon;
                                return (
                                    <TableRow key={user.id} className="hover:bg-gray-50/40 border-gray-50 group transition-colors">
                                        <TableCell className="py-5 pl-6">
                                            <div className="flex items-center gap-3">
                                                {user.avatarUrl
                                                    ? <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100" />
                                                    : <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"><span className="text-sm font-black text-gray-500">{user.fullName.charAt(0).toUpperCase()}</span></div>
                                                }
                                                <span className="font-black text-sm text-gray-900 group-hover:text-indigo-600 transition-colors truncate max-w-40">{user.fullName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`rounded-lg px-2.5 py-1 font-black text-[10px] uppercase tracking-wider border ${roleCfg.bg} ${roleCfg.color}`}>
                                                <Icon className="size-3 mr-1" />{roleCfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                                <Mail className="size-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate max-w-45">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <CalendarDays className="size-3.5 shrink-0" />{formatDate(user.createdAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {user.role !== 'Admin' && (
                                                    <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold px-2.5 border-gray-200 hover:bg-gray-50 text-gray-500"
                                                        onClick={() => { setChangingUser({ id: user.id, name: user.fullName, currentRole: user.role as UserRole }); setNewRole(user.role as UserRole); }}
                                                        title="Đổi vai trò"
                                                    >
                                                        <ShieldCheck className="size-3.5" />
                                                    </Button>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white border border-transparent hover:border-gray-200">
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl border-gray-100 w-48">
                                                        <DropdownMenuItem className="rounded-lg py-2 font-bold text-sm cursor-pointer flex items-center gap-2" asChild>
                                                            <a href={`mailto:${user.email}`}><Mail className="size-4 mr-2 text-gray-400" />Gửi email</a>
                                                        </DropdownMenuItem>
                                                        {user.role !== 'Admin' && (
                                                            <>
                                                                <DropdownMenuSeparator className="my-1" />
                                                                <DropdownMenuItem className="rounded-lg py-2 font-bold text-sm cursor-pointer text-red-500 hover:bg-red-50"
                                                                    onClick={() => setDeletingUser({ id: user.id, name: user.fullName })}>
                                                                    <Trash2 className="size-4 mr-2" />Xóa tài khoản
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <div className="text-sm font-bold text-gray-500">Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalRecords)} trong {totalRecords} người dùng</div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold border-gray-200" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>← Trước</Button>
                            <span className="text-sm font-black text-gray-900 px-2">Trang {page}/{totalPages}</span>
                            <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold border-gray-200" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Sau →</Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Change Role Dialog */}
            <Dialog open={!!changingUser} onOpenChange={open => { if (!open) { setChangingUser(null); setNewRole(null); } }}>
                <DialogContent size="sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                            <ShieldCheck className="size-5" />Đổi vai trò người dùng
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            Thay đổi vai trò của <strong>{changingUser?.name}</strong>. Hành động này sẽ ảnh hưởng đến quyền truy cập của họ trên hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-bold text-gray-700">Chọn vai trò mới</label>
                        <div className="grid grid-cols-2 gap-2">
                            {allRoles.filter(r => r !== 'Admin').map(role => {
                                const cfg = roleConfig[role];
                                const Icon = cfg.icon;
                                return (
                                    <button key={role} onClick={() => setNewRole(role)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                                            newRole === role ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className={`size-4 ${cfg.color}`} />{cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="outline" className="h-10 rounded-xl font-bold border-gray-200" onClick={() => { setChangingUser(null); setNewRole(null); }}>Hủy</Button>
                        <Button className="h-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleRoleChange}
                            disabled={updateUserRole.isPending || !newRole || newRole === changingUser?.currentRole}>
                            {updateUserRole.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            <span className="ml-1.5">Lưu thay đổi</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={open => {
                if (!open) { setShowCreateDialog(false); setCreateForm({ email: '', fullName: '', password: '', role: 'Student' }); setCreateErrors({}); }
            }}>
                <DialogContent size="md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                            <UserPlus className="size-5" />
                            Thêm người dùng mới
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            Tạo tài khoản mới cho người dùng trên hệ thống.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Họ tên <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="Nguyễn Văn A"
                                value={createForm.fullName}
                                onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))}
                                className={`rounded-xl h-11 ${createErrors.fullName ? 'border-red-400' : ''}`}
                            />
                            {createErrors.fullName && <p className="text-xs text-red-500 font-medium">{createErrors.fullName}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Email <span className="text-red-500">*</span></label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
                                value={createForm.email}
                                onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                                className={`rounded-xl h-11 ${createErrors.email ? 'border-red-400' : ''}`}
                            />
                            {createErrors.email && <p className="text-xs text-red-500 font-medium">{createErrors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                            <Input
                                type="password"
                                placeholder="Tối thiểu 6 ký tự"
                                value={createForm.password}
                                onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                                className={`rounded-xl h-11 ${createErrors.password ? 'border-red-400' : ''}`}
                            />
                            {createErrors.password && <p className="text-xs text-red-500 font-medium">{createErrors.password}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Vai trò <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-2">
                                {allRoles.filter(r => r !== 'Admin').map(role => {
                                    const cfg = roleConfig[role];
                                    const Icon = cfg.icon;
                                    return (
                                        <button key={role} onClick={() => setCreateForm(f => ({ ...f, role }))}
                                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                                                createForm.role === role ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className={`size-4 ${cfg.color}`} />{cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="outline" className="h-10 rounded-xl font-bold border-gray-200"
                            onClick={() => { setShowCreateDialog(false); setCreateErrors({}); }}>
                            Hủy
                        </Button>
                        <Button className="h-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreateUser}
                            disabled={createUser.isPending}>
                            {createUser.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            <span className="ml-1.5">Tạo tài khoản</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingUser} onOpenChange={open => { if (!open) setDeletingUser(null); }}>
                <DialogContent size="sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="size-5" />
                            Xác nhận xóa tài khoản
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            Bạn có chắc muốn xóa tài khoản <strong>{deletingUser?.name}</strong>?
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="outline" className="h-10 rounded-xl font-bold border-gray-200" onClick={() => setDeletingUser(null)}>Hủy</Button>
                        <Button className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteUser} disabled={deleteUser.isPending}>
                            {deleteUser.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            <span className="ml-1.5">Xóa vĩnh viễn</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
