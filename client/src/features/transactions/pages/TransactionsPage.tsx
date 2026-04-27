import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../api/transactionApi';
import type { TransactionDto } from '../types';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function formatPrice(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
}

function statusBadge(status: string) {
    switch (status) {
        case 'Completed': return 'badge-success';
        case 'Pending':   return 'badge-warning';
        case 'Failed':    return 'badge-error';
        case 'Cancelled': return 'badge-gray';
        default:           return 'badge-gray';
    }
}

function typeIcon(type: string) {
    switch (type) {
        case 'Purchase': return (
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
            </div>
        );
        case 'Deposit': return (
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            </div>
        );
        case 'Withdraw': return (
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 1 0 7h5a3.5 3.5 0 0 0 0 7H6" />
                </svg>
            </div>
        );
        default: return null;
    }
}

function TransactionRow({ tx }: { tx: TransactionDto }) {
    return (
        <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                    {typeIcon(tx.type)}
                    <div>
                        <p className="font-medium text-gray-900 text-sm">{tx.type}</p>
                        <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                    </div>
                </div>
            </td>
            <td className="py-3.5 px-4 text-sm text-gray-600">
                {tx.courseTitle ?? tx.description ?? '—'}
            </td>
            <td className="py-3.5 px-4">
                <span className={`badge ${statusBadge(tx.status)}`}>{tx.status}</span>
            </td>
            <td className={`py-3.5 px-4 text-sm font-semibold text-right ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount >= 0 ? '+' : ''}{formatPrice(tx.amount)}
            </td>
        </tr>
    );
}

function EmptyState() {
    return (
        <div className="card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có giao dịch nào</h3>
            <p className="text-gray-500">Lịch sử giao dịch sẽ hiển thị tại đây khi bạn mua khóa học.</p>
        </div>
    );
}

export default function TransactionsPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['transactions', 'me'],
        queryFn: () => transactionApi.getMyTransactions(),
    });

    const transactions = data?.data ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Giao dịch</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {isLoading ? 'Đang tải...' : `${transactions.length} giao dịch`}
                </p>
            </div>

            {isError && (
                <div className="card p-4 border-red-200 bg-red-50 text-red-600">
                    Không thể tải lịch sử giao dịch. Vui lòng thử lại.
                </div>
            )}

            {isLoading ? (
                <div className="card overflow-hidden">
                    <div className="h-12 bg-gray-50 animate-pulse" />
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 border-t border-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx: TransactionDto) => (
                                    <TransactionRow key={tx.id} tx={tx} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
