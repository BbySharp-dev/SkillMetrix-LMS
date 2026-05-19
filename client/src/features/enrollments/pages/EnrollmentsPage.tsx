import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyEnrollments } from '../hooks/useEnrollments';
import type { EnrollmentDto } from '../types';
import { Card, CardContent, Input, Button, Skeleton } from '@/components/ui';
import { Progress } from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';
import { BookOpen, Info, PlayCircle, Star, Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentDto }) {
    return (
        <Card className="group overflow-hidden border border-gray-100 rounded-2xl hover:shadow-xl transition-all duration-500 bg-white">
            <Link to={`/learning/${enrollment.courseId}`} className="block relative aspect-video overflow-hidden">
                <img
                    src={enrollment.courseThumbnail || 'https://placehold.co/640x360?text=No+Thumbnail'}
                    alt={enrollment.courseTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        <span className="text-indigo-600 fill-current"><PlayCircle size={24} /></span>
                    </div>
                </div>
                {enrollment.completionPercent === 100 && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest shadow-lg rounded-md">
                        HOÀN THÀNH
                    </div>
                )}
            </Link>

            <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 min-h-10 group-hover:text-indigo-600 transition-colors">
                        {enrollment.courseTitle}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground">{enrollment.instructorName}</p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-indigo-600">{enrollment.completionPercent}% hoàn thành</span>
                        <span className="text-gray-400">{enrollment.completedLessons}/{enrollment.totalLessons} bài</span>
                    </div>
                    <Progress value={enrollment.completionPercent} className="h-1.5" />
                </div>

                {enrollment.completionPercent < 100 && (
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} className="fill-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Đánh giá khóa học</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function EmptyState({ onClear }: { onClear?: () => void }) {
    return (
        <div className="py-24 text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <BookOpen size={40} className="text-gray-300" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">Không tìm thấy khóa học nào</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">Hãy thử điều chỉnh lại bộ lọc tìm kiếm hoặc khám phá các khóa học mới.</p>
            </div>
            <div className="flex justify-center gap-3">
                {onClear && (
                    <Button variant="outline" onClick={onClear} className="rounded-xl font-bold h-11 px-6">
                        Xóa bộ lọc
                    </Button>
                )}
                <Button asChild className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 h-11 px-6">
                    <Link to="/courses">Khám phá khóa học</Link>
                </Button>
            </div>
        </div>
    );
}

export default function EnrollmentsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    const queryParams = {
        pageNumber: page,
        pageSize: 8,
        search: search.trim() || undefined,
        sortBy
    };

    const { data, isLoading, isError } = useMyEnrollments(queryParams);

    const enrollments = data?.data ?? [];
    const totalRecords = data?.totalRecords ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const handleReset = () => {
        setPage(1);
        setSearch('');
        setSortBy('latest');
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-white min-h-screen pb-16 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-slate-900 text-white py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <BookOpen size={32} className="text-indigo-400" />
                        Khóa học của tôi
                    </h1>
                    <p className="text-slate-400 font-medium text-sm">
                        Theo dõi tiến độ học tập và tiếp tục chinh phục kiến thức mới.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Filter and Search Panel */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <SlidersHorizontal size={16} className="text-indigo-600" />
                        Tìm kiếm khóa học
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
                            <option value="price">Học phí cao nhất</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <div className="text-xs font-bold text-gray-500">
                            {totalRecords > 0 && `Tìm thấy ${totalRecords} khóa học đã đăng ký`}
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

                {isError && (
                    <div className="p-6 border border-red-100 bg-red-50/50 rounded-2xl flex items-center gap-4 text-red-700">
                        <Info />
                        <div>
                            <p className="font-bold">Không thể tải dữ liệu</p>
                            <p className="text-sm font-medium">Đã có lỗi xảy ra khi kết nối tới máy chủ. Vui lòng thử lại.</p>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden border border-gray-100 rounded-2xl">
                                <Skeleton className="aspect-video w-full" />
                                <div className="p-5 space-y-4">
                                    <Skeleton className="h-5 w-5/6" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="space-y-2 pt-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-1.5 w-full" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : enrollments.length === 0 ? (
                    <EmptyState onClear={search || sortBy !== 'latest' ? handleReset : undefined} />
                ) : (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {enrollments.map((enrollment: EnrollmentDto) => (
                                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                            ))}
                        </div>

                        {/* Pagination Section */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                                <div className="text-xs font-bold text-gray-500">
                                    Hiển thị {(page - 1) * 8 + 1}–{Math.min(page * 8, totalRecords)} trong tổng số {totalRecords} khóa học
                                </div>
                                <Pagination
                                    pageNumber={page}
                                    totalPages={totalPages}
                                    onChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

