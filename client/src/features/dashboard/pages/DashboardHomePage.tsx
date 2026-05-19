import { Link } from 'react-router-dom';
import {
    BookOpen, CheckCircle, BarChart3, PlayCircle, Search,
    ArrowRight, Clock, BookText, PlusCircle, ShieldCheck,
    BookMarked, Users, ClipboardCheck, TrendingUp, DollarSign,
    Star, ChevronRight, FileCheck, Settings, AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useMyEnrollments } from '@/features/enrollments/hooks/useEnrollments';
import { useInstructorOverview, useInstructorRevenue, useInstructorRecentActivity } from '@/features/instructor/hooks/useInstructorStats';
import { useAdminOverview } from '@/features/admin/hooks/useAdminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Progress } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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

function StudentSection({ enrollments }: { enrollments: Array<{
    id: string;
    courseTitle: string;
    courseThumbnail?: string;
    completedLessons: number;
    totalLessons: number;
    completionPercent: number;
}> }) {
    const stats = {
        totalEnrolled: enrollments?.length ?? 0,
        completedLessons: enrollments?.reduce((acc, c) => acc + (c.completedLessons ?? 0), 0) ?? 0,
        avgProgress: enrollments?.length
            ? Math.round(enrollments.reduce((acc, c) => acc + (c.completionPercent ?? 0), 0) / enrollments.length)
            : 0,
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-linear-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-primary-foreground/70 font-bold uppercase tracking-widest text-xs">Khóa học đã đăng ký</CardTitle>
                            <BookOpen size={20} className="text-primary-foreground/70" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.totalEnrolled}</div>
                        <p className="text-primary-foreground/70 text-xs mt-1">Đang tích cực học tập</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-linear-to-br from-success to-teal-600 text-success-foreground overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-success-foreground/70 font-bold uppercase tracking-widest text-xs">Bài học hoàn thành</CardTitle>
                            <CheckCircle size={20} className="text-success-foreground/70" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.completedLessons}</div>
                        <p className="text-success-foreground/70 text-xs mt-1">Kiến thức đã tiếp thu</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-linear-to-br from-warning to-orange-600 text-warning-foreground overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-warning-foreground/70 font-bold uppercase tracking-widest text-xs">Tiến độ trung bình</CardTitle>
                            <BarChart3 size={20} className="text-warning-foreground/70" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.avgProgress}%</div>
                        <p className="text-warning-foreground/70 text-xs mt-1">Trên tổng lộ trình học</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Clock size={24} className="text-primary" />
                        Đang học gần đây
                    </h2>
                    <Button variant="link" asChild className="text-primary font-bold">
                        <Link to="/my-enrollments">Xem tất cả</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {enrollments && enrollments.length > 0 ? (
                        enrollments.slice(0, 5).map((course) => (
                            <Card key={course.id} className="group hover:shadow-lg transition-all border overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-6 p-4">
                                        <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm border border-border">
                                            <img src={course.courseThumbnail || 'https://placehold.co/640x360?text=Course'} alt={course.courseTitle} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{course.courseTitle}</h3>
                                                <Badge variant="outline" className="bg-muted border-none font-bold text-[10px]">
                                                    {course.completedLessons}/{course.totalLessons} BÀI
                                                </Badge>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground font-medium">Tiến độ học tập</span>
                                                    <span className="text-primary font-black">{course.completionPercent}%</span>
                                                </div>
                                                <Progress value={course.completionPercent} className="h-1.5" />
                                            </div>
                                        </div>
                                        <Button asChild size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary shrink-0">
                                            <Link to={`/learning/${course.id}`}><PlayCircle size={20} /></Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-dashed border-2 border-border bg-muted/30 p-12 text-center">
                            <div className="flex justify-center mb-6 text-muted-foreground/30"><BookText size={48} /></div>
                            <p className="font-bold text-muted-foreground">Bạn chưa đăng ký khóa học nào</p>
                            <Button asChild className="mt-4 rounded-xl font-bold"><Link to="/courses">Bắt đầu học ngay</Link></Button>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

function InstructorSection() {
    const { data: overview, isLoading: isLoadingOverview } = useInstructorOverview();
    const { data: revenueData, isLoading: isLoadingRevenue } = useInstructorRevenue();
    const { data: activity = [] } = useInstructorRecentActivity();

    const chartData = revenueData?.length ? revenueData.map((r) => ({ name: r.month, revenue: r.revenue })) : MOCK_REVENUE_DATA;
    const activities = activity.length ? activity : MOCK_ACTIVITY;

    const kpiCards = [
        { label: 'Tổng học viên', value: overview?.totalStudents ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: overview ? `+${Math.round((overview.totalStudents / 100) * 100)}%` : '+12.5%', fallback: '1,284' },
        { label: 'Khóa học', value: overview?.totalCourses ?? '—', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: overview ? `${overview.publishedCourses ?? 0} đã xuất bản` : '+2', fallback: '12' },
        { label: 'Doanh thu (tháng)', value: overview?.totalRevenue ? formatRevenue(overview.totalRevenue) : '—', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: overview ? `+${Math.round((overview.totalRevenue / 1000000) * 100)}%` : '+8.2%', fallback: '15.4tr' },
        { label: 'Đánh giá TB', value: overview?.averageRating ? overview.averageRating.toFixed(1) : '—', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', trend: overview ? `+${(overview.averageRating / 5 * 0.1).toFixed(1)}` : '+0.1', fallback: '4.8' },
    ];

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card) => (
                    <Card key={card.label} className="p-6 rounded-3xl border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                                <card.icon className="size-6" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{card.trend}</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                        {isLoadingOverview ? <Skeleton className="h-8 w-20 mt-1 rounded" /> : <p className="text-2xl font-black text-gray-900 mt-1">{card.value || card.fallback}</p>}
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8 rounded-3xl border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Doanh thu 12 tháng</h2>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="size-3 text-emerald-500" />
                                Tăng 12% so với kỳ trước
                            </p>
                        </div>
                        <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-600 outline-none cursor-pointer">
                            <option>Năm 2026</option><option>Năm 2025</option>
                        </select>
                    </div>
                    <div className="h-75 w-full">
                        {isLoadingRevenue ? (
                            <Skeleton className="h-full w-full rounded-2xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `${v / 1000000}tr`} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '700' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card className="p-8 rounded-3xl border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6">Thông báo mới</h2>
                    <div className="space-y-6 flex-1">
                        {activities.map((item) => (
                            <div key={item.id} className="flex gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                    {item.type === 'enrollment' ? <Users className="size-5 text-blue-600" /> : item.type === 'rating' ? <Star className="size-5 text-amber-600" /> : <PlayCircle className="size-5 text-indigo-600" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 leading-tight">
                                        {item.type === 'enrollment' ? `${item.studentName} vừa đăng ký ${item.courseTitle}` : item.type === 'rating' ? `${item.studentName} vừa đánh giá ${item.courseTitle}` : `Bài học mới của ${item.courseTitle} đã tải lên`}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{formatRelativeTime(item.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="mt-6 w-full rounded-xl font-black text-indigo-600 hover:bg-indigo-50 group">
                        XEM TẤT CẢ <ChevronRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <BookMarked size={24} className="text-primary" />
                    Quản lý khóa học
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/instructor/courses/new">
                        <Card className="group hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer border-2 border-transparent hover:border-indigo-200">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><PlusCircle size={24} /></div>
                                <div><p className="font-bold text-foreground group-hover:text-indigo-600 transition-colors">Tạo khóa học mới</p><p className="text-xs text-muted-foreground">Bắt đầu xây dựng</p></div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/instructor/courses">
                        <Card className="group hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer border-2 border-transparent hover:border-indigo-200">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><BookMarked size={24} /></div>
                                <div><p className="font-bold text-foreground group-hover:text-indigo-600 transition-colors">Quản lý khóa học</p><p className="text-xs text-muted-foreground">Sửa, xóa, nộp duyệt</p></div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </>
    );
}

function AdminSection() {
    const { data: overview } = useAdminOverview();

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Khóa học chờ duyệt', value: overview?.pendingCourses ?? 0, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Tổng người dùng', value: overview?.totalUsers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Khóa học đang hiển thị', value: overview?.publishedCourses ?? 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Doanh thu (tháng)', value: overview?.totalRevenue ?? 0, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((card) => {
                    const displayValue = typeof card.value === 'number'
                        ? card.value > 1000
                            ? `${(card.value / 1000000).toFixed(1)}tr`
                            : card.value.toLocaleString('vi-VN')
                        : '—';
                    return (
                        <Card key={card.label} className="p-6 rounded-3xl border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} mb-4 inline-flex`}><card.icon className="size-6" /></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{displayValue}</p>
                        </Card>
                    );
                })}
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <ShieldCheck size={24} className="text-primary" />
                    Quản trị hệ thống
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Duyệt khóa học', desc: 'Phê duyệt hoặc từ chối các khóa học mới được nộp.', icon: <FileCheck size={24} />, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', hoverIconBg: 'bg-amber-600', path: '/admin/approvals' },
                        { title: 'Quản lý người dùng', desc: 'Quản lý tài khoản học viên và giảng viên.', icon: <Users size={24} />, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', hoverIconBg: 'bg-blue-600', path: '/admin/users' },
                        { title: 'Cài đặt hệ thống', desc: 'Cấu hình các tham số và tính năng của nền tảng.', icon: <Settings size={24} />, iconBg: 'bg-slate-100', iconColor: 'text-slate-600', hoverIconBg: 'bg-slate-600', path: '/admin/settings' },
                    ].map((action) => (
                        <Link key={action.title} to={action.path}>
                            <Card className="group hover:shadow-xl transition-all cursor-pointer overflow-hidden">
                                <CardContent className="p-8 space-y-6">
                                    <div className={`w-12 h-12 rounded-2xl ${action.iconBg} ${action.iconColor} flex items-center justify-center group-hover:${action.hoverIconBg} group-hover:text-white transition-colors`}>
                                        {action.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black group-hover:text-primary transition-colors">{action.title}</h3>
                                        <p className="text-sm font-medium text-muted-foreground">{action.desc}</p>
                                    </div>
                                    <div className="pt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                        Truy cập ngay <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <BookMarked size={24} className="text-indigo-600" />
                    Quản lý khóa học
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/admin/courses/new">
                        <Card className="group hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer border-2 border-transparent hover:border-indigo-200">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><PlusCircle size={24} /></div>
                                <div><p className="font-bold text-foreground group-hover:text-indigo-600 transition-colors">Tạo khóa học mới</p><p className="text-xs text-muted-foreground">Bắt đầu xây dựng</p></div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/admin/my-courses">
                        <Card className="group hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer border-2 border-transparent hover:border-indigo-200">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><BookMarked size={24} /></div>
                                <div><p className="font-bold text-foreground group-hover:text-indigo-600 transition-colors">Quản lý khóa học</p><p className="text-xs text-muted-foreground">Xem và chỉnh sửa</p></div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default function DashboardHomePage() {
    const user = useAuthStore((s) => s.user);
    const { data: enrollments, isLoading } = useMyEnrollments();
    const isInstructor = user?.role === 'Instructor';
    const isAdmin = user?.role === 'Admin';

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2"><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-96" /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-100 w-full rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        {isAdmin ? <><ShieldCheck size={32} className="text-primary" />Chào Sếp {user?.fullName}!</> : isInstructor ? <>Chào Giảng viên {user?.fullName}!</> : <>Chào mừng {user?.fullName}!</>}
                    </h1>
                    <p className="text-muted-foreground text-base font-medium">
                        {isAdmin ? 'Quản trị hệ thống SkillMetrix tại đây.' : isInstructor ? 'Tổng quan hoạt động giảng dạy của bạn.' : 'Hôm nay là một ngày tuyệt vời để học thêm điều mới.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {!isAdmin && (
                        <Button asChild variant="outline" className="rounded-xl font-bold">
                            <Link to="/courses"><Search size={16} className="mr-2" />Khám phá khóa học</Link>
                        </Button>
                    )}
                    {isAdmin && (
                        <Button asChild variant="outline" className="rounded-xl font-bold">
                            <Link to="/admin/approvals"><AlertTriangle size={16} className="mr-2" />Duyệt khóa học</Link>
                        </Button>
                    )}
                    {(isInstructor || isAdmin) && (
                        <Button asChild className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700">
                            <Link to={isAdmin ? '/admin/courses/new' : '/instructor/courses/new'}><PlusCircle size={16} className="mr-2" />Tạo khóa học mới</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Role-based content */}
            {isAdmin ? (
                <AdminSection />
            ) : isInstructor ? (
                <InstructorSection />
            ) : (
                <StudentSection enrollments={enrollments ?? []} />
            )}
        </div>
    );
}
