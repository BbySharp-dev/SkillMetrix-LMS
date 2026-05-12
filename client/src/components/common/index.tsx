// Common reusable components

import { BookOpen, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';


/** Full page loading spinner */
export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3 opacity-40">
                <Loader2 className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Đang tải...</p>
            </div>
        </div>
    );
}

/** Inline loading spinner */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClass = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    }[size];

    return <Loader2 className={`${sizeClass} animate-spin`} />;
}

/** Skeleton for table rows */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

/** Skeleton for card grid */
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </>
    );
}


interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: 'inbox' | 'book' | 'search';
    action?: {
        label: string;
        onClick: () => void;
    };
}

const icons = {
    inbox: Inbox,
    book: BookOpen,
    search: Inbox,
};

export function EmptyState({ title, description, icon = 'inbox', action }: EmptyStateProps) {
    const Icon = icons[icon];

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">{title}</p>
                {description && (
                    <p className="text-sm text-muted-foreground max-w-md">{description}</p>
                )}
            </div>
            {action && (
                <Button onClick={action.onClick} className="mt-2">
                    {action.label}
                </Button>
            )}
        </div>
    );
}


interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'Đã xảy ra lỗi',
    message = 'Vui lòng thử lại sau.',
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                    Thử lại
                </Button>
            )}
        </div>
    );
}


interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
}

export function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div className="space-y-1">
                {icon && <div className="mb-2">{icon}</div>}
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}


interface StatusBadgeProps {
    status: string;
    statusConfig?: Record<string, { label: string; className: string }>;
}

const defaultStatusConfig: Record<string, { label: string; className: string }> = {
    published: { label: 'Đang hiển thị', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    rejected: { label: 'Bị từ chối', className: 'bg-red-50 text-red-700 border-red-200' },
    draft: { label: 'Bản nháp', className: 'bg-gray-50 text-gray-600 border-gray-200' },
    active: { label: 'Hoạt động', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive: { label: 'Không hoạt động', className: 'bg-gray-50 text-gray-600 border-gray-200' },
};

export function StatusBadge({ status, statusConfig = defaultStatusConfig }: StatusBadgeProps) {
    const config = statusConfig[status.toLowerCase()] ?? {
        label: status,
        className: 'bg-gray-50 text-gray-600 border-gray-200',
    };

    return (
        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors ${config.className}`}>
            {config.label}
        </span>
    );
}
