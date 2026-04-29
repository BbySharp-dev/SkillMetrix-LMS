import { Users, Search, ShieldCheck, UserPlus, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UsersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Users size={28} className="text-primary" />
                        Quản lý người dùng
                    </h1>
                    <p className="text-muted-foreground font-medium">Danh sách toàn bộ học viên và giảng viên trên hệ thống.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Tìm email, tên..." className="pl-10 h-11 rounded-xl" />
                    </div>
                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                        <Filter size={16} />
                    </Button>
                    <Button className="h-11 px-6 rounded-xl font-bold gap-2">
                        <UserPlus size={16} />
                        Thêm mới
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden rounded-2xl shadow-sm border">
                <CardContent className="p-16 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} className="text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Tính năng đang được phát triển</h3>
                    <p className="text-muted-foreground max-w-md mx-auto font-medium">
                        Chúng tôi đang tích hợp hệ thống quản lý người dùng tập trung để Admin có thể quản lý quyền hạn và thông tin cá nhân an toàn hơn.
                    </p>
                    <Button variant="outline" className="mt-8 rounded-xl h-12 px-8 font-bold" disabled>
                        TÌM HIỂU THÊM
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
