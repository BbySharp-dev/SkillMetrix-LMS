import { Link } from 'react-router-dom';
import { FileCheck, Users, Settings, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

export default function AdminDashboardPage() {
    const user = useAuthStore((s) => s.user);

    const adminActions = [
        {
            title: 'Duyệt khóa học',
            desc: 'Phê duyệt hoặc từ chối các khóa học mới được nộp.',
            icon: <FileCheck size={24} />,
            path: '/dashboard/admin/approvals',
            color: 'bg-primary/10 text-primary'
        },
        {
            title: 'Quản lý người dùng',
            desc: 'Quản lý tài khoản học viên và giảng viên.',
            icon: <Users size={24} />,
            path: '/dashboard/admin/users',
            color: 'bg-success/10 text-success'
        },
        {
            title: 'Cài đặt hệ thống',
            desc: 'Cấu hình các tham số và tính năng của nền tảng.',
            icon: <Settings size={24} />,
            path: '/dashboard/admin/settings',
            color: 'bg-warning/10 text-warning'
        },
    ];

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <ShieldCheck size={32} className="text-primary" />
                    Bảng điều khiển Admin
                </h1>
                <p className="text-muted-foreground font-medium">Chào {user?.fullName}! Quản trị hệ thống SkillMetrix tại đây.</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adminActions.map((action, i) => (
                    <Card key={i} className="border hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                        <Link to={action.path} className="absolute inset-0 z-10" />
                        <CardContent className="p-8 space-y-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color} shadow-inner`}>
                                {action.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black group-hover:text-primary transition-colors">{action.title}</h3>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">{action.desc}</p>
                            </div>
                            <div className="pt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                Truy cập ngay <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder for Stats/Insights */}
            <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 max-w-xl">
                        <Badge variant="outline" className="text-indigo-400 border-indigo-400 font-black px-4 py-1">THỐNG KÊ HỆ THỐNG</Badge>
                        <h2 className="text-3xl font-black leading-tight">Sẵn sàng để quản lý sự tăng trưởng của SkillMetrix?</h2>
                        <p className="text-slate-400 font-medium">Chúng tôi đang cập nhật các bảng biểu thống kê chi tiết về doanh thu, lượng học viên và tỷ lệ hoàn thành khóa học.</p>
                        <Button className="h-12 bg-white text-slate-900 hover:bg-indigo-50 font-black rounded-xl px-8">
                            XEM CHI TIẾT
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center space-y-1">
                            <div className="text-2xl font-black">--</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Doanh thu</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center space-y-1">
                            <div className="text-2xl font-black">--</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Học viên</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center space-y-1 col-span-2">
                            <div className="text-2xl font-black">--</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Khóa học mới</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

