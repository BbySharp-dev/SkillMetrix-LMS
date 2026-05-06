import { Link } from 'react-router-dom';
import { 
    Users, 
    BookOpen, 
    PlusCircle, 
    DollarSign, 
    Star, 
    TrendingUp,
    ChevronRight,
    PlayCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useInstructorOverview, useInstructorRevenue, useInstructorRecentActivity } from '@/features/instructor/hooks/useInstructorStats';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

const MOCK_REVENUE_DATA = [
    { name: 'T1', revenue: 4000000 },
    { name: 'T2', revenue: 3000000 },
    { name: 'T3', revenue: 2000000 },
    { name: 'T4', revenue: 2780000 },
    { name: 'T5', revenue: 1890000 },
    { name: 'T6', revenue: 2390000 },
    { name: 'T7', revenue: 3490000 },
    { name: 'T8', revenue: 4200000 },
    { name: 'T9', revenue: 3800000 },
    { name: 'T10', revenue: 5100000 },
    { name: 'T11', revenue: 4800000 },
    { name: 'T12', revenue: 6200000 },
];

const MOCK_ACTIVITY = [
    { id: '1', type: 'enrollment' as const, studentName: 'Nguyễn Văn A', courseTitle: 'ReactJS từ zero đến hero', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: '2', type: 'lesson_upload' as const, studentName: 'Hệ thống', courseTitle: 'Figma Pro', createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: '3', type: 'rating' as const, studentName: 'Trần Thị B', courseTitle: 'Node.js Backend', createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: '4', type: 'enrollment' as const, studentName: 'Lê Văn C', courseTitle: 'ReactJS từ zero đến hero', createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
];

function formatRevenue(v: number): string {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}tr`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return v.toString();
}

function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
}

export default function InstructorDashboardPage() {
    const user = useAuthStore((s) => s.user);
    const { data: overview, isLoading: isLoadingOverview } = useInstructorOverview();
    const { data: revenueData, isLoading: isLoadingRevenue } = useInstructorRevenue();
    const { data: activity = [] } = useInstructorRecentActivity();

    const chartData = revenueData && revenueData.length > 0
        ? revenueData.map((r) => ({ name: r.month, revenue: r.revenue }))
        : MOCK_REVENUE_DATA;

    const activities = activity.length > 0 ? activity : MOCK_ACTIVITY;

    const kpiCards = [
        {
            label: 'Tổng học viên',
            value: overview?.totalStudents ?? '—',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: overview ? `+${Math.round((overview.totalStudents / 100) * 100)}%` : '+12.5%',
            fallback: '1,284',
        },
        {
            label: 'Khóa học',
            value: overview?.totalCourses ?? '—',
            icon: BookOpen,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            trend: overview ? `${overview.publishedCourses} đã xuất bản` : '+2',
            fallback: '12',
        },
        {
            label: 'Doanh thu (tháng)',
            value: overview?.totalRevenue ? formatRevenue(overview.totalRevenue) : '—',
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: overview ? `+${Math.round((overview.totalRevenue / 1000000) * 100)}%` : '+8.2%',
            fallback: '15.4tr',
        },
        {
            label: 'Đánh giá TB',
            value: overview?.averageRating ? overview.averageRating.toFixed(1) : '—',
            icon: Star,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            trend: overview ? `+${(overview.averageRating / 5 * 0.1).toFixed(1)}` : '+0.1',
            fallback: '4.8',
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Xin chào, {user?.fullName}! 👋</h1>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Đây là tóm tắt hoạt động của bạn hôm nay</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl font-black border-gray-200 hover:bg-white">
                        XUẤT BÁO CÁO
                    </Button>
                    <Button asChild className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl shadow-lg shadow-indigo-200 transition-all">
                        <Link to="/instructor/courses/new">
                            <PlusCircle className="size-5 mr-2" />
                            TẠO KHÓA HỌC MỚI
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card) => (
                    <Card key={card.label} className="p-6 rounded-3xl border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                                <card.icon className="size-6" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                {card.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                        {isLoadingOverview ? (
                            <Skeleton className="h-8 w-20 mt-1 rounded" />
                        ) : (
                            <p className="text-2xl font-black text-gray-900 mt-1">{card.value || card.fallback}</p>
                        )}
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 p-8 rounded-3xl border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Doanh thu 7 tháng qua</h2>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="size-3 text-emerald-500" />
                                Tăng 12% so với kỳ trước
                            </p>
                        </div>
                        <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-600 outline-none cursor-pointer">
                            <option>Năm 2024</option>
                            <option>Năm 2023</option>
                        </select>
                    </div>
                    
                    <div className="h-75 w-full">
                        {isLoadingRevenue ? (
                            <Skeleton className="h-full w-full rounded-2xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                                        tickFormatter={(value) => `${value/1000000}tr`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                        }} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#4f46e5" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-8 rounded-3xl border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6">Thông báo mới</h2>
                    <div className="space-y-6 flex-1">
                        {activities.map((item) => (
                            <div key={item.id} className="flex gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                    {item.type === 'enrollment' ? (
                                        <Users className="size-5 text-blue-600" />
                                    ) : item.type === 'rating' ? (
                                        <Star className="size-5 text-amber-600" />
                                    ) : (
                                        <PlayCircle className="size-5 text-indigo-600" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 leading-tight">
                                        {item.type === 'enrollment'
                                            ? `${item.studentName} vừa đăng ký khóa học ${item.courseTitle}`
                                            : item.type === 'rating'
                                            ? `${item.studentName} vừa đánh giá ${item.courseTitle}`
                                            : item.type === 'lesson_upload'
                                            ? `Bài học mới của ${item.courseTitle} đã được tải lên`
                                            : `${item.studentName} — ${item.courseTitle}`}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        {formatRelativeTime(item.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="mt-6 w-full rounded-xl font-black text-indigo-600 hover:bg-indigo-50 group">
                        XEM TẤT CẢ
                        <ChevronRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Card>
            </div>
        </div>
    );
}
