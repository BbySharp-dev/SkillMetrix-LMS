import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    ShoppingBag,
    History,
    AlertCircle,
    CreditCard,
    Search,
    RotateCcw,
    SlidersHorizontal
} from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import type { TransactionDto } from '../types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Card,
    CardContent,
    Skeleton,
    Input,
    Button
} from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate } from '@/lib/utils';

type TxStatusInfo = { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }

const TX_TYPES: Record<string | number, { label: string; iconColor: string; iconBg: string }> = {
    1: { label: 'Nạp tiền', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    2: { label: 'Rút tiền', iconColor: 'text-red-600', iconBg: 'bg-red-50' },
    3: { label: 'Mua khóa học', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
    'Deposit': { label: 'Nạp tiền', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    'Withdraw': { label: 'Rút tiền', iconColor: 'text-red-600', iconBg: 'bg-red-50' },
    'Purchase': { label: 'Mua khóa học', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
};

const TX_STATUSES: Record<string | number, TxStatusInfo> = {
    0: { label: 'Chờ xử lý', variant: 'warning' },
    1: { label: 'Đang xử lý', variant: 'warning' },
    2: { label: 'Thành công', variant: 'success' },
    3: { label: 'Thất bại', variant: 'destructive' },
    4: { label: 'Đã hủy', variant: 'secondary' },
    'Pending': { label: 'Chờ xử lý', variant: 'warning' },
    'Completed': { label: 'Thành công', variant: 'success' },
    'Failed': { label: 'Thất bại', variant: 'destructive' },
    'Cancelled': { label: 'Đã hủy', variant: 'secondary' },
};

export default function TransactionsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [type, setType] = useState('All');
    const [sortBy, setSortBy] = useState('latest');

    const queryParams = {
        pageNumber: page,
        pageSize: 10,
        search: search.trim() || undefined,
        status: status === 'All' ? undefined : status,
        type: type === 'All' ? undefined : type,
        sortBy
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['transactions', 'me', queryParams] as const,
        queryFn: () => transactionApi.getMyTransactions(queryParams),
    });

    const transactions = data?.data ?? [];
    const totalRecords = data?.totalRecords ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const handleReset = () => {
        setPage(1);
        setSearch('');
        setStatus('All');
        setType('All');
        setSortBy('latest');
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <History size={28} className="text-indigo-600" />
                        Lịch sử giao dịch
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Xem lại tất cả các giao dịch nạp tiền, rút tiền và mua khóa học của bạn.
                    </p>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <SlidersHorizontal size={16} className="text-indigo-600" />
                    Bộ lọc tìm kiếm
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search field */}
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Tìm kiếm theo khóa học hoặc mô tả..."
                            className="pl-10 h-10 w-full rounded-xl border border-gray-200 text-sm font-semibold focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={type}
                        onChange={(e) => { setType(e.target.value); setPage(1); }}
                        className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                        <option value="All">Tất cả loại giao dịch</option>
                        <option value="Deposit">Nạp tiền</option>
                        <option value="Withdraw">Rút tiền</option>
                        <option value="Purchase">Mua khóa học</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                        <option value="All">Tất cả trạng thái</option>
                        <option value="Pending">Chờ xử lý</option>
                        <option value="Completed">Thành công</option>
                        <option value="Failed">Thất bại</option>
                        <option value="Cancelled">Đã hủy</option>
                    </select>

                    {/* Sort Filter */}
                    <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                        <option value="latest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="amount">Số tiền nhiều nhất</option>
                    </select>
                </div>

                <div className="flex justify-end pt-1">
                    {(search || status !== 'All' || type !== 'All' || sortBy !== 'latest') && (
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="text-xs font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 h-8 px-3 rounded-lg flex items-center gap-1.5"
                        >
                            <RotateCcw size={12} />
                            Đặt lại bộ lọc
                        </Button>
                    )}
                </div>
            </div>

            {isError && (
                <Card className="border-destructive/20 bg-destructive/5 shadow-xs">
                    <CardContent className="flex items-center gap-3 p-4">
                        <AlertCircle size={20} className="text-destructive shrink-0" />
                        <span className="text-sm font-medium text-destructive">Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.</span>
                    </CardContent>
                </Card>
            )}

            <Card className="overflow-hidden rounded-2xl shadow-xs border border-gray-100 bg-white">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-72 font-bold text-muted-foreground uppercase tracking-widest text-[10px] py-4 pl-6">Giao dịch</TableHead>
                            <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Mô tả</TableHead>
                            <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-muted-foreground uppercase tracking-widest text-[10px] pr-6">Số tiền</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="pl-6"><Skeleton className="h-10 w-full rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell className="pr-6"><Skeleton className="h-6 w-24 ml-auto rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                                        <CreditCard size={48} className="text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold">Không tìm thấy giao dịch nào</p>
                                            <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx: TransactionDto) => {
                                const typeInfo = TX_TYPES[tx.type] ?? { label: String(tx.type), iconColor: 'text-muted-foreground', iconBg: 'bg-muted' };
                                const statusInfo = TX_STATUSES[tx.status] ?? { label: String(tx.status), variant: 'secondary' as const };

                                return (
                                    <TableRow key={tx.id} className="hover:bg-muted/10 transition-colors">
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.iconBg}`}>
                                                    <span className={typeInfo.iconColor}>
                                                        {tx.type === 1 || tx.type === 'Deposit' ? (
                                                            <ArrowUpCircle size={16} />
                                                        ) : tx.type === 2 || tx.type === 'Withdraw' ? (
                                                            <ArrowDownCircle size={16} />
                                                        ) : (
                                                            <ShoppingBag size={16} />
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-sm text-gray-900">{typeInfo.label}</p>
                                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                        {formatDate(tx.createdAt, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="text-sm font-medium text-muted-foreground line-clamp-1">
                                                {tx.courseTitle ?? tx.description ?? '—'}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant} className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                                                {statusInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <span className={`text-sm font-bold tabular-nums ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {tx.amount >= 0 ? '+' : '-'}
                                                {formatCurrency(Math.abs(tx.amount))}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                        <div className="text-xs font-bold text-gray-500">
                            Hiển thị {(page - 1) * 10 + 1}–{Math.min(page * 10, totalRecords)} trong tổng số {totalRecords} giao dịch
                        </div>
                        <Pagination
                            pageNumber={page}
                            totalPages={totalPages}
                            onChange={handlePageChange}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}

