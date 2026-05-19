import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Users, Star, GraduationCap, Clock, Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, Input, Button, Badge, Skeleton, AvatarRoot, AvatarFallback, AvatarImage } from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';
import { useInstructorProfile, useInstructorCourses } from '../hooks/useProfile';
import { PageLoader, EmptyState } from '@/components/common';
import { formatCurrency } from '@/lib/utils';

export function InstructorProfilePage() {
    const { instructorId } = useParams<{ instructorId: string }>();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [status, setStatus] = useState('Published');

    const queryParams = {
        pageNumber: page,
        pageSize: 6, // 6 items fits perfectly on a 3-column grid
        search: search.trim() || undefined,
        status: status || undefined,
        sortBy
    };

    const { data: profile, isLoading: isLoadingProfile } = useInstructorProfile(instructorId!);
    const { data: coursesData, isLoading: isLoadingCourses } = useInstructorCourses(instructorId!, queryParams);

    const courses = coursesData?.data ?? [];
    const totalRecords = coursesData?.totalRecords ?? 0;
    const totalPages = coursesData?.totalPages ?? 1;

    const handleReset = () => {
        setPage(1);
        setSearch('');
        setSortBy('latest');
        setStatus('Published');
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        // Scroll slightly down to focus on the courses section
        const coursesEl = document.getElementById('instructor-courses-section');
        if (coursesEl) {
            coursesEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (isLoadingProfile) return <PageLoader />;

    if (!profile) {
        return (
            <EmptyState
                title="Không tìm thấy giảng viên"
                description="Giảng viên bạn đang tìm kiếm không tồn tại."
                icon="search"
            />
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <AvatarRoot className="w-24 h-24 border-4 border-white shadow-lg shrink-0">
                    <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.fullName} />
                    <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">
                        {profile.fullName.charAt(0)}
                    </AvatarFallback>
                </AvatarRoot>

                <div className="flex-1 space-y-3">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.fullName}</h1>
                        <p className="text-sm font-semibold text-muted-foreground">{profile.email}</p>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">{profile.bio || 'Chưa có thông tin giới thiệu.'}</p>

                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{profile.totalCourses}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng khóa học</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{profile.publishedCourses}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đã xuất bản</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{profile.totalStudents.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Học viên</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                            <Star className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">
                                {profile.averageRating ? profile.averageRating.toFixed(1) : '—'}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đánh giá TB</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Courses Section */}
            <div id="instructor-courses-section" className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Khóa học của giảng viên</h2>
                </div>

                {/* Filter and Search Panel */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <SlidersHorizontal size={16} className="text-indigo-600" />
                        Tìm kiếm khóa học
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="relative sm:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Tìm kiếm theo tên khóa học..."
                                className="pl-10 h-10 w-full rounded-xl border border-gray-200 text-sm font-semibold focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                            <option value="Published">Đã xuất bản</option>
                            <option value="Pending">Chờ duyệt</option>
                            <option value="Draft">Bản nháp</option>
                            <option value="">Tất cả trạng thái</option>
                        </select>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                            <option value="latest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="title">Tên khóa học (A-Z)</option>
                            <option value="popular">Học viên nhiều nhất</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <div className="text-xs font-bold text-gray-500">
                            {totalRecords > 0 && `Tìm thấy ${totalRecords} khóa học`}
                        </div>
                        {(search || status !== 'Published' || sortBy !== 'latest') && (
                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                className="text-xs font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 h-8 px-3 rounded-lg flex items-center gap-1.5"
                            >
                                <RotateCcw size={12} />
                                Đặt lại bộ lọc
                            </Button>
                        )}
                    </div>
                </div>

                {isLoadingCourses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="overflow-hidden border border-gray-100 rounded-2xl">
                                <Skeleton className="aspect-video w-full rounded-none" />
                                <CardContent className="p-5 space-y-3">
                                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <Card key={course.id} className="overflow-hidden border border-gray-100 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                                    <div className="aspect-video bg-gray-50 relative shrink-0">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                        <Badge
                                            className={`absolute top-2 right-2 rounded-md font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 border-none text-white ${
                                                course.status === 'Published'
                                                    ? 'bg-emerald-500'
                                                    : course.status === 'Pending'
                                                        ? 'bg-amber-500'
                                                        : 'bg-gray-500'
                                            }`}
                                        >
                                            {course.status === 'Published'
                                                ? 'Đã xuất bản'
                                                : course.status === 'Pending'
                                                    ? 'Chờ duyệt'
                                                    : 'Nháp'}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-5 flex flex-col justify-between flex-1 gap-4">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-snug min-h-10">{course.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {course.description}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    {course.rating && (
                                                        <div className="flex items-center gap-0.5 text-amber-500">
                                                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                                                            <span className="font-bold">{course.rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                    <span className="text-muted-foreground font-semibold">
                                                        ({course.enrollmentCount} học viên)
                                                    </span>
                                                </div>
                                                <span className="font-extrabold text-indigo-600 text-sm">
                                                    {course.price === 0 ? 'Miễn phí' : formatCurrency(course.price)}
                                                </span>
                                            </div>
                                            <Button variant="outline" className="w-full rounded-xl font-bold h-10 text-xs" asChild>
                                                <Link to={`/courses/${course.id}`}>Xem khóa học</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Section */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                                <div className="text-xs font-bold text-gray-500">
                                    Hiển thị {(page - 1) * 6 + 1}–{Math.min(page * 6, totalRecords)} trong tổng số {totalRecords} khóa học
                                </div>
                                <Pagination
                                    pageNumber={page}
                                    totalPages={totalPages}
                                    onChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        title="Không tìm thấy khóa học"
                        description={search || status !== 'Published' || sortBy !== 'latest'
                            ? 'Không tìm thấy khóa học nào phù hợp với bộ lọc.'
                            : 'Giảng viên này chưa xuất bản khóa học nào.'}
                        icon="book"
                    />
                )}
            </div>
        </div>
    );
}

