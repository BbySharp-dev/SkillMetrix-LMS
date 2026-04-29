import { Link } from 'react-router-dom';
import { Users, BookOpen, PlusCircle, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorDashboardPage() {
    const user = useAuthStore((s) => s.user);
    const { data: coursesData, isLoading } = useCourses({ 
        instructorId: user?.id, 
        pageSize: 100,
        status: undefined // Get all statuses for instructor
    });

    const courses = coursesData?.data ?? [];

    if (isLoading) {
        return (
            <div className="space-y-10">
                <Skeleton className="h-12 w-64" />
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight">Trang quản trị Giảng viên</h1>
                    <p className="text-muted-foreground font-medium">Chào {user?.fullName}! Quản lý các khóa học của bạn tại đây.</p>
                </div>
                <Button className="h-12 px-6 rounded-xl font-bold gap-2" asChild>
                    <Link to="/instructor/courses/create">
                        <PlusCircle size={20} />
                        Tạo khóa học mới
                    </Link>
                </Button>
            </div>

            {/* Courses Management */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Khóa học của bạn ({courses.length})</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <Card key={course.id} className="border hover:shadow-lg transition-all overflow-hidden group">
                                <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                                    <div className="w-full md:w-48 aspect-video overflow-hidden rounded-xl shrink-0 border">
                                        <img 
                                            src={course.thumbnail || 'https://placehold.co/640x360?text=Course'} 
                                            alt={course.title || ''}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                                    {course.title || 'Chưa đặt tên'}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Users size={12} /> {course.enrollmentCount} học viên</span>
                                                    <span className="flex items-center gap-1.5"><BookOpen size={12} /> {course.chapterCount} chương</span>
                                                </div>
                                            </div>
                                            <Badge 
                                                variant={course.status === 'Published' ? 'success' : 'secondary'}
                                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                            >
                                                {course.status === 'Published' ? 'Đã xuất bản' : course.status === 'Draft' ? 'Bản nháp' : course.status}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold px-4 hover:bg-primary/10" asChild>
                                                <Link to={`/instructor/courses/${course.id}/edit`}>Chỉnh sửa</Link>
                                            </Button>
                                            <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold px-4 hover:bg-muted" asChild>
                                                <Link to={`/instructor/courses/${course.id}/curriculum`}>Quản lý giáo trình</Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-dashed border-2 border-border bg-muted/30 p-12 text-center">
                            <div className="flex justify-center mb-6 text-muted-foreground/30">
                                <BookOpen size={48} />
                            </div>
                            <p className="font-bold text-muted-foreground">Bạn chưa tạo khóa học nào</p>
                            <Button asChild className="mt-4 rounded-xl font-bold">
                                <Link to="/instructor/courses/create">Tạo khóa học đầu tiên</Link>
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
