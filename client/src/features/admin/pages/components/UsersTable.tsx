import { Link } from 'react-router-dom';
import { Users, Mail, CalendarDays, ShieldCheck, MoreHorizontal, Trash2 } from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui';
import type { AdminUserItem, UserRole } from '../../api/adminApi';

const roleConfig: Record<string, { label: string; icon: typeof Users; color: string; bg: string }> = {
    Admin: { label: 'Quản trị viên', icon: Users, color: 'text-red-600 bg-red-50 border-red-200', bg: 'border' },
    Moderator: { label: 'Kiểm duyệt viên', icon: Users, color: 'text-violet-600 bg-violet-50 border-violet-200', bg: 'border' },
    Instructor: { label: 'Giảng viên', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', bg: 'border' },
    Student: { label: 'Học viên', icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', bg: 'border' },
};

interface UsersTableProps {
    users: AdminUserItem[];
    isLoading: boolean;
    isError: boolean;
    searchTerm: string;
    onRoleChange: (user: { id: string; name: string; currentRole: UserRole }) => void;
    onDelete: (user: { id: string; name: string }) => void;
    formatDate: (date: string) => string;
}

export function UsersTable({ users, isLoading, isError, searchTerm, onRoleChange, onDelete, formatDate }: UsersTableProps) {
    if (isError) {
        return (
            <div className="p-8 text-center text-red-500 font-bold">
                Không thể tải danh sách. Vui lòng thử lại.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto w-full">
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
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i} className="border-gray-50">
                                <TableCell className="py-5 pl-6">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                                        <Skeleton className="h-4 w-32 rounded" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-40 rounded" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                                <TableCell><Skeleton className="h-9 w-28 ml-auto rounded-xl" /></TableCell>
                            </TableRow>
                        ))
                    ) : users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                                    <Users className="size-12 text-gray-300" />
                                    <div className="space-y-1">
                                        <p className="text-base font-black text-gray-900">Không tìm thấy người dùng</p>
                                        <p className="text-sm font-medium text-gray-400">
                                            {searchTerm ? `Không có kết quả cho "${searchTerm}"` : 'Thử thay đổi bộ lọc để xem kết quả khác.'}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map(user => {
                            const cfg = roleConfig[user.role] ?? roleConfig['Student'];
                            return (
                                <TableRow key={user.id} className="hover:bg-gray-50/40 border-gray-50 group transition-colors">
                                    <TableCell className="py-5 pl-6">
                                        <div className="flex items-center gap-3">
                                            {user.avatarUrl ? (
                                                <img 
                                                    src={user.avatarUrl} 
                                                    alt={user.fullName} 
                                                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100" 
                                                    onError={(e) => {
                                                        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                                    <span className="text-sm font-black text-gray-500">{user.fullName.charAt(0).toUpperCase()}</span>
                                                </div>
                                            )}
                                            {(user.role === 'Instructor' || user.role === 'Student') ? (
                                                <Link 
                                                    to={`/profile/${user.role.toLowerCase()}/${user.id}`} 
                                                    target="_blank"
                                                    className="font-black text-sm text-gray-900 hover:text-indigo-600 transition-colors truncate max-w-40"
                                                >
                                                    {user.fullName}
                                                </Link>
                                            ) : (
                                                <span className="font-black text-sm text-gray-900 truncate max-w-40">{user.fullName}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-lg px-2.5 py-1 font-black text-[10px] uppercase tracking-wider border ${cfg.color}`}>
                                            {cfg.label}
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
                                            <CalendarDays className="size-3.5 shrink-0" />
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-6">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {user.role !== 'Admin' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg font-bold px-2.5 border-gray-200 hover:bg-gray-50 text-gray-500"
                                                    onClick={() => onRoleChange({ id: user.id, name: user.fullName, currentRole: user.role as UserRole })}
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
                                                        <a href={`mailto:${user.email}`}>
                                                            <Mail className="size-4 mr-2 text-gray-400" />
                                                            Gửi email
                                                        </a>
                                                    </DropdownMenuItem>
                                                    {user.role !== 'Admin' && (
                                                        <>
                                                            <DropdownMenuSeparator className="my-1" />
                                                            <DropdownMenuItem
                                                                className="rounded-lg py-2 font-bold text-sm cursor-pointer text-red-500 hover:bg-red-50"
                                                                onClick={() => onDelete({ id: user.id, name: user.fullName })}
                                                            >
                                                                <Trash2 className="size-4 mr-2" />
                                                                Xóa tài khoản
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
