import { Link } from 'react-router-dom';
import { useMyEnrollments } from '../hooks/useEnrollments';
import type { EnrollmentDto } from '../types';
import { Card, CardContent } from '@/components/ui';
import { Progress } from '@/components/ui';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui';

import { BookOpen, Info, PlayCircle, Star } from 'lucide-react';

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentDto }) {
    return (
        <Card className="group overflow-hidden border border-gray-100 rounded-none hover:shadow-2xl transition-all duration-500 bg-white">
            <Link to={`/learning/${enrollment.courseId}`} className="block relative aspect-video overflow-hidden">
                <img
                    src={enrollment.courseThumbnail || 'https://placehold.co/640x360?text=No+Thumbnail'}
                    alt={enrollment.courseTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        <span className="text-gray-900 fill-current"><PlayCircle /></span>
                    </div>
                </div>
                {enrollment.completionPercent === 100 && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest shadow-lg">
                        HOÀN THÀNH
                    </div>
                )}
            </Link>

            <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                        <h3 className="font-bold leading-tight line-clamp-2 min-h-10 group-hover:text-primary transition-colors">
                        {enrollment.courseTitle}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground">{enrollment.instructorName}</p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-primary">{enrollment.completionPercent}% hoàn thành</span>
                        <span className="text-gray-400">{enrollment.completedLessons}/{enrollment.totalLessons} bài</span>
                    </div>
                    <Progress value={enrollment.completionPercent} className="h-1.5" />
                </div>

                {enrollment.completionPercent < 100 && (
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={12} className="fill-yellow-500" />
                        <span className="text-[10px] font-bold uppercase">Đánh giá khóa học</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function EmptyState() {
    return (
        <div className="py-32 text-center space-y-8">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto">
                <BookOpen size={48} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tight">Bắt đầu hành trình của bạn</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">Bạn chưa đăng ký khóa học nào. Hãy khám phá hàng ngàn khóa học chất lượng cao của chúng tôi.</p>
            </div>
            <Button asChild size="lg" className="h-14 px-10 font-black">
                <Link to="/courses">KHÁM PHÁ NGAY</Link>
            </Button>
        </div>
    );
}

export default function EnrollmentsPage() {
    const { data: enrollments, isLoading, isError } = useMyEnrollments();

    return (
        <div className="bg-white min-h-screen">
            {/* Header Section */}
            <div className="bg-[#1c1d1f] text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-black tracking-tight">Học tập của tôi</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Tabs Placeholder */}
                <div className="flex items-center gap-8 border-b border-gray-200 text-sm font-black text-gray-500 uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <button className="pb-4 border-b-4 border-gray-900 text-gray-900">Tất cả khóa học</button>
                    <button className="pb-4 hover:text-gray-900 transition-colors">Danh sách của tôi</button>
                    <button className="pb-4 hover:text-gray-900 transition-colors">Yêu thích</button>
                    <button className="pb-4 hover:text-gray-900 transition-colors">Lưu trữ</button>
                </div>

                {isError && (
                    <div className="p-8 border border-red-100 bg-red-50/50 rounded-none flex items-center gap-4 text-red-700">
                        <Info />
                        <div>
                            <p className="font-black">Không thể tải dữ liệu</p>
                            <p className="text-sm font-medium">Đã có lỗi xảy ra khi kết nối tới máy chủ. Vui lòng thử lại.</p>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Skeleton key={i} className="aspect-square w-full rounded-none" />
                        ))}
                    </div>
                ) : !enrollments || enrollments.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {enrollments.map((enrollment: EnrollmentDto) => (
                            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
