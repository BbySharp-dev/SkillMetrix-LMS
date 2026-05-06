import { useQuery } from '@tanstack/react-query';
import { ArrowUpCircle, ArrowDownCircle, ShoppingBag, History, AlertCircle, CreditCard } from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import type { TransactionDto } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

type TxStatusInfo = { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }

const TX_TYPES: Record<number, { label: string; iconColor: string; iconBg: string }> = {
    1: { label: 'Nạp tiền', iconColor: 'text-success', iconBg: 'bg-success/10' },
    2: { label: 'Rút tiền', iconColor: 'text-destructive', iconBg: 'bg-destructive/10' },
    3: { label: 'Mua khóa học', iconColor: 'text-primary', iconBg: 'bg-primary/10' },
};

const TX_STATUSES: Record<number, TxStatusInfo> = {
    0: { label: 'Chờ xử lý', variant: 'warning' },
    1: { label: 'Đang xử lý', variant: 'warning' },
    2: { label: 'Thành công', variant: 'success' },
    3: { label: 'Thất bại', variant: 'destructive' },
    4: { label: 'Đã hủy', variant: 'secondary' },
};

export default function TransactionsPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['transactions', 'me'],
        queryFn: () => transactionApi.getMyTransactions(),
    });

    const transactions = data?.data ?? [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <History size={28} className="text-primary" />
                        Lịch sử giao dịch
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Xem lại tất cả các giao dịch nạp tiền, rút tiền và mua khóa học của bạn.
                    </p>
                </div>
            </div>

            {isError && (
                <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                        <AlertCircle size={20} className="text-destructive shrink-0" />
                        <span className="text-sm font-medium text-destructive">Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.</span>
                    </CardContent>
                </Card>
            )}

            <Card className="overflow-hidden rounded-2xl shadow-sm border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-72 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Giao dịch</TableHead>
                            <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Mô tả</TableHead>
                            <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Số tiền</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-full rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 ml-auto rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                                        <CreditCard size={48} className="text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold">Chưa có giao dịch</p>
                                            <p className="text-sm text-muted-foreground">Lịch sử giao dịch của bạn sẽ xuất hiện tại đây.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx: TransactionDto) => {
                                const typeInfo = TX_TYPES[tx.type as number] ?? { label: String(tx.type), iconColor: 'text-muted-foreground', iconBg: 'bg-muted' };
                                const statusInfo = TX_STATUSES[tx.status as number] ?? { label: String(tx.status), variant: 'secondary' as const };

                                return (
                                    <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.iconBg}`}>
                                                    <span className={typeInfo.iconColor}>
                                                        {tx.type === 1 ? (
                                                            <ArrowUpCircle size={16} />
                                                        ) : tx.type === 2 ? (
                                                            <ArrowDownCircle size={16} />
                                                        ) : (
                                                            <ShoppingBag size={16} />
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{typeInfo.label}</p>
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
                                        <TableCell className="text-right">
                                            <span className={`text-sm font-bold tabular-nums ${tx.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
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
            </Card>
        </div>
    );
}
