import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ForbiddenPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldOff className="size-8" />
                </div>
                <h1 className="text-4xl font-black text-gray-900">403</h1>
                <p className="text-muted-foreground font-medium max-w-sm">Bạn không có quyền truy cập trang này.</p>
                <Button asChild className="font-bold">
                    <Link to="/">Về trang chủ</Link>
                </Button>
            </div>
        </div>
    );
}
