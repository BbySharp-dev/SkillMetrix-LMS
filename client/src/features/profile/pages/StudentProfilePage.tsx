import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, CreditCard, GraduationCap, Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Card, Input, Button, Badge, Progress, Skeleton, AvatarRoot, AvatarFallback, AvatarImage } from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';
import { useStudentProfile, useStudentEnrollments } from '../hooks/useProfile';
import { PageLoader, EmptyState } from '@/components/common';
import { formatCurrency } from '@/lib/utils';

export function StudentProfilePage() {
    const { studentId } = useParams<{ studentId: string }>();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    const queryParams = {
        pageNumber: page,
        pageSize: 5, // 5 items is a clean vertical stack size
        search: search.trim() || undefined,
        sortBy
    };

    const { data: profile, isLoading: isLoadingProfile } = useStudentProfile(studentId!);
    const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useStudentEnrollments(studentId!, queryParams);

    const enrollments = enrollmentsData?.data ?? [];
    const totalRecords = enrollmentsData?.totalRecords ?? 0;
    const totalPages = enrollmentsData?.totalPages ?? 1;

    const handleReset = () => {
        setPage(1);
        setSearch('');
        setSortBy('latest');
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        const enrollmentsEl = document.getElementById('student-enrollments-section');
        if (enrollmentsEl) {
            enrollmentsEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (isLoadingProfile) return <PageLoader />;

    if (!profile) {
        return (
            <EmptyState
                title="Không tìm thấy học viên"
                description="Học viên bạn đang tìm kiếm không tồn tại."
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

                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Thành viên từ {new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </p>
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
                            <p className="text-2xl font-black text-gray-900">{profile.totalEnrolledCourses}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Khóa học đăng ký</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{profile.completedCourses}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đã hoàn thành</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{profile.totalLessonsCompleted}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bài học đã học</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{formatCurrency(profile.totalSpent)}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đã chi tiêu</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Enrollments Section */}
            <div id="student-enrollments-section" className="space-y-6 pt-4">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Khóa học đã đăng ký</h2>

                {/* Filter and Search Panel */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <SlidersHorizontal size={16} className="text-indigo-600" />
                        Tìm kiếm khóa học học viên
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div className="relative sm:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Tìm kiếm theo tên khóa học hoặc giảng viên..."
                                className="pl-10 h-10 w-full rounded-xl border border-gray-200 text-sm font-semibold focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                            <option value="latest">Gần đây nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="title">Tên khóa học (A-Z)</option>
                            <option value="progress">Tiến độ cao nhất</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <div className="text-xs font-bold text-gray-500">
                            {totalRecords > 0 && `Tìm thấy ${totalRecords} khóa học`}
                        </div>
                        {(search || sortBy !== 'latest') && (
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

                {isLoadingEnrollments ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-5 border border-gray-100 rounded-2xl">
                                <div className="flex gap-4">
                                    <Skeleton className="w-32 h-20 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4 rounded-md" />
                                        <Skeleton className="h-4 w-1/2 rounded-md" />
                                        <Skeleton className="h-2 w-full rounded-md" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : enrollments.length > 0 ? (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {enrollments.map((enrollment) => (
                                <Card key={enrollment.id} className="p-5 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow duration-300">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Thumbnail */}
                                        <div className="w-full md:w-32 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                            {enrollment.courseThumbnail ? (
                                                <img
                                                    src={enrollment.courseThumbnail}
                                                    alt={enrollment.courseTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-8 h-8 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 text-base truncate">
                                                        {enrollment.courseTitle}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground font-semibold">
                                                        Giảng viên: {enrollment.instructorName}
                                                    </p>
                                                </div>
                                                <Badge
                                                    className={`rounded-md font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 border-none text-white ${
                                                        enrollment.completionPercent === 100
                                                            ? 'bg-emerald-500'
                                                            : enrollment.completionPercent >= 50
                                                                ? 'bg-indigo-500'
                                                                : 'bg-gray-500'
                                                    }`}
                                                >
                                                    {enrollment.completionPercent}% hoàn thành
                                                </Badge>
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                <Progress value={enrollment.completionPercent} className="h-2" />
                                                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                                    <span>
                                                        {enrollment.completedLessons}/{enrollment.totalLessons} bài học
                                                    </span>
                                                    <span className="flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                        Đăng ký {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Button variant="outline" size="sm" className="rounded-xl font-bold h-8 text-xs px-4" asChild>
                                                    <Link to={`/learning/${enrollment.courseId}`}>Tiếp tục học</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Section */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                                <div className="text-xs font-bold text-gray-500">
                                    Hiển thị {(page - 1) * 5 + 1}–{Math.min(page * 5, totalRecords)} trong tổng số {totalRecords} khóa học
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
                        description={search || sortBy !== 'latest'
                            ? 'Không tìm thấy khóa học nào phù hợp với bộ lọc.'
                            : 'Học viên này chưa đăng ký khóa học nào.'}
                        icon="book"
                    />
                )}
            </div>
        </div>
    );
}

