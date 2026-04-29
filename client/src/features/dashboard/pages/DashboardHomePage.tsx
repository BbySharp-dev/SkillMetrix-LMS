import { Link } from 'react-router-dom';
import {
    BookOpen, CheckCircle, BarChart3, PlayCircle, Search,
    ArrowRight, Clock, BookText,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useMyEnrollments } from '@/features/enrollments/hooks/useEnrollments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardHomePage() {
    const user = useAuthStore((s) => s.user);
    const { data: enrollments, isLoading } = useMyEnrollments();

    // Calculate statistics
    const stats = {
        totalEnrolled: enrollments?.length ?? 0,
        completedLessons: enrollments?.reduce((acc, curr) => acc + curr.completedLessons, 0) ?? 0,
        avgProgress: enrollments?.length 
            ? Math.round(enrollments.reduce((acc, curr) => acc + curr.completionPercent, 0) / enrollments.length) 
            : 0,
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-5 w-96" />
                </div>
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
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Chào {user?.role === 'Admin' ? 'Sếp' : 'mừng'} {user?.fullName}!
                    </h1>
                    <p className="text-muted-foreground text-lg">Hôm nay là một ngày tuyệt vời để học thêm điều mới.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link to="/courses">
                            <Search size={16} className="mr-2" />
                            Khám phá khóa học
                        </Link>
                    </Button>
                    <Button className="rounded-xl font-bold">
                        <PlayCircle size={16} className="mr-2" />
                        Tiếp tục học
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-linear-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-colors" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-primary-foreground/70 font-bold uppercase tracking-widest text-xs">Khóa học của tôi</CardTitle>
                            <BookOpen size={20} className="text-primary-foreground/70" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.totalEnrolled}</div>
                        <p className="text-primary-foreground/70 text-xs mt-1">Đang tích cực học tập</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-linear-to-br from-success to-teal-600 text-success-foreground overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-colors" />
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
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-colors" />
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

            <div className="grid grid-cols-1 gap-8">
                {/* Recent Learning Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <Clock size={24} className="text-primary" />
                            Đang học gần đây
                        </h2>
                        <Button variant="link" asChild className="text-primary font-bold">
                            <Link to="/dashboard/my-enrollments">Xem tất cả</Link>
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {enrollments && enrollments.length > 0 ? (
                            enrollments.slice(0, 5).map((course) => (
                                <Card key={course.id} className="group hover:shadow-lg transition-all border overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex items-center gap-6 p-4">
                                            <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm border border-border">
                                                <img 
                                                    src={course.courseThumbnail || 'https://placehold.co/640x360?text=Course'} 
                                                    alt={course.courseTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                        {course.courseTitle}
                                                    </h3>
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
                                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary shrink-0">
                                                <ArrowRight size={20} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-dashed border-2 border-border bg-muted/30 p-12 text-center">
                                <div className="flex justify-center mb-6 text-muted-foreground/30">
                                    <BookText size={48} />
                                </div>
                                <p className="font-bold text-muted-foreground">Bạn chưa đăng ký khóa học nào</p>
                                <Button asChild className="mt-4 rounded-xl font-bold">
                                    <Link to="/courses">Bắt đầu học ngay</Link>
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
