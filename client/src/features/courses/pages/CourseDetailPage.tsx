import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, User, Calendar, Globe, AlertCircle, Play, Star } from 'lucide-react';
import { useCourseCurriculum, useCourseDetail } from '@/features/courses/hooks/useCourses';
import { enrollmentApi } from '@/features/enrollments/api/enrollmentApi';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useEnrollCourse } from '@/features/enrollments/hooks/useEnrollments';
import { CourseReviewsPage } from '@/features/reviews';
import ChapterAccordion from '../components/ChapterAccordion';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VideoPlayer from '@/features/learning/components/VideoPlayer';
import { VideoPlayerProvider } from '@/features/learning/context/VideoPlayerContext';
import type { LessonDto } from '../types';

const fetchEnrollmentCheck = async (courseId: string) => {
    const response = await enrollmentApi.checkEnrollment(courseId);
    return response.data;
};

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    
    const { data: course, isLoading, isError } = useCourseDetail(id);
    const { data: curriculum } = useCourseCurriculum(id);
    const enrollMutation = useEnrollCourse();

    const [openEnrollModal, setOpenEnrollModal] = useState(false);
    const [optimisticEnrolledId, setOptimisticEnrolledId] = useState<string | null>(null);
    const [previewLesson, setPreviewLesson] = useState<LessonDto | null>(null);

    const { data: serverEnrolled = false } = useQuery({
        queryKey: ['enrollment-check', id],
        queryFn: () => fetchEnrollmentCheck(id!),
        enabled: Boolean(id) && isAuthenticated,
    });

    const isEnrolled = serverEnrolled || (optimisticEnrolledId === id);

    const handleEnrollClick = useCallback(() => {
        if (!isAuthenticated) {
            navigate(`/login?returnUrl=/courses/${id}`);
            return;
        }
        if (!isEnrolled) {
            setOpenEnrollModal(true);
        } else {
            navigate(`/learning/${id}`);
        }
    }, [isAuthenticated, isEnrolled, navigate, id]);

    const handleEnrollConfirm = useCallback(async () => {
        if (!id) return;
        await enrollMutation.mutateAsync(id);
        setOptimisticEnrolledId(id);
        setOpenEnrollModal(false);
        navigate(`/learning/${id}`);
    }, [id, enrollMutation, navigate]);

    if (isLoading) {
        return (
            <div className="space-y-0">
                <Skeleton className="h-75 w-full rounded-none" />
                <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
                    <div className="space-y-6">
                        <Skeleton className="h-40 w-full rounded-xl" />
                        <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !course) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="flex justify-center mb-4 text-gray-200">
                    <AlertCircle className="size-6 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Không tìm thấy khóa học</h3>
                <p className="text-gray-500 mb-6">Vui lòng kiểm tra lại đường dẫn hoặc quay lại danh sách.</p>
                <Button onClick={() => navigate('/courses')}>Quay lại danh sách</Button>
            </div>
        );
    }

    return (
        <>
            <div className="relative animate-in fade-in duration-500">
                <div className="bg-[#1c1d1f] text-white py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:w-[calc(100%-380px)] space-y-6">
                            <nav className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-4">
                                <Link to="/courses" className="hover:underline">Khóa học</Link>
                            </nav>

                            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight max-w-3xl">
                                {course.title}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="text-gray-400">{course.enrollmentCount.toLocaleString()} học viên</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center text-amber-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={16} fill={s <= Math.round(course.rating) ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-indigo-300">{course.rating.toFixed(1)}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 font-normal">Giảng viên:</span>
                                    {course.instructorId ? (
                                        <Link to={`/profile/instructor/${course.instructorId}`} className="text-indigo-400 font-bold hover:underline">
                                            {course.instructorName}
                                        </Link>
                                    ) : (
                                        <span className="text-indigo-400 font-bold">{course.instructorName}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-gray-500 size-4" />
                                    <span>Cập nhật mới nhất {new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="text-gray-500 size-4" />
                                    <span>Tiếng Việt</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <aside className="hidden lg:block absolute right-8 -top-70 w-87.5 z-20">
                        <Card className="shadow-2xl border-none rounded-none overflow-hidden sticky top-8">
                            <div className="relative aspect-video group border-b border-gray-100">
                                <img 
                                    src={course.thumbnail || 'https://placehold.co/640x360?text=No+Thumbnail'} 
                                    alt={course.title || 'Course thumbnail'} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/640x360?text=SkillMetrix+LMS';
                                    }}
                                />
                            </div>

                            <CardContent className="p-6 space-y-6 bg-white">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-black text-gray-900">
                                            {course.price <= 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(course.price)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {isEnrolled ? (
                                        <div className="space-y-3">
                                            <Button
                                                asChild
                                                size="lg"
                                                className="w-full h-14 rounded-none text-md font-black bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50 shadow-lg"
                                            >
                                                <Link to={`/learning/${id}`}>
                                                    VÀO HỌC NGAY
                                                </Link>
                                            </Button>
                                            <p className="text-[10px] text-center font-bold text-emerald-600 uppercase tracking-widest">
                                                Bạn đã sở hữu khóa học này
                                            </p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleEnrollClick}
                                            disabled={enrollMutation.isPending}
                                            size="lg"
                                            className="w-full h-14 rounded-none text-md font-black bg-[#a435f0] hover:bg-[#8710d8] shadow-xl"
                                        >
                                            {enrollMutation.isPending ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm font-bold text-gray-900">Khóa học này bao gồm:</p>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center gap-3">
                                            <Play className="size-4 text-gray-500" />
                                            <span>Truy cập trọn đời</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <BookOpen className="size-4 text-gray-500" />
                                            <span>{course.chapterCount} chương học</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="lg:w-[calc(100%-400px)] space-y-12">
                        
                        <section className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Nội dung khóa học</h2>
                                <div className="text-sm font-medium text-gray-500">
                                    {course.chapterCount} chương • {curriculum?.reduce((a, c) => a + c.lessons.length, 0)} bài giảng
                                </div>
                            </div>
                            
                            {curriculum ? (
                                <ChapterAccordion 
                                    chapters={curriculum} 
                                    onLessonClick={(lesson) => setPreviewLesson(lesson)} 
                                />
                            ) : (
                                <div className="p-10 border border-dashed border-gray-200 rounded-none text-center">
                                    <p className="font-bold text-gray-400">Đang tải nội dung học tập...</p>
                                </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-gray-900">Mô tả</h2>
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                                {course.description}
                            </div>
                        </section>

                        <section className="space-y-6 pt-10 border-t border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Giảng viên</h2>
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100 shadow-sm overflow-hidden">
                                        <User className="text-gray-300 size-8" />
                                    </div>
                                    <div className="space-y-1">
                                        {course.instructorId ? (
                                            <Link to={`/profile/instructor/${course.instructorId}`} className="hover:underline">
                                                <h3 className="text-xl font-black text-indigo-600">{course.instructorName}</h3>
                                            </Link>
                                        ) : (
                                            <h3 className="text-xl font-black text-indigo-600">{course.instructorName}</h3>
                                        )}
                                        <p className="text-sm font-bold text-gray-500">Giảng viên tại SkillMetrix</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="space-y-6 pt-10 border-t border-gray-100">
                            <CourseReviewsPage courseId={id!} />
                        </section>                    </div>
                </div>
            </div>

            <ConfirmModal
                open={openEnrollModal}
                title="Xác nhận đăng ký khóa học"
                message={`Bạn có chắc muốn đăng ký khóa học "${course.title}" không?`}
                confirmText="ĐĂNG KÝ NGAY"
                cancelText="Hủy"
                loading={enrollMutation.isPending}
                onConfirm={handleEnrollConfirm}
                onCancel={() => setOpenEnrollModal(false)}
            />

            <Dialog open={previewLesson !== null} onOpenChange={(open) => { if (!open) setPreviewLesson(null); }}>
                <DialogContent size="lg" className="bg-[#1c1d1f] text-white border-gray-800 p-0 overflow-hidden max-w-3xl">
                    <DialogHeader className="p-4 border-b border-gray-800 flex flex-row items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                                Học thử miễn phí
                            </span>
                            <DialogTitle className="text-lg font-black text-white">
                                {previewLesson?.title}
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    
                    <div className="bg-black aspect-video w-full">
                        {previewLesson && (
                            <VideoPlayerProvider>
                                <VideoPlayer
                                    lessonId={previewLesson.id}
                                    videoUrl={previewLesson.videoUrl || ''}
                                    initialSecond={0}
                                    onPersistProgress={() => {}}
                                />
                            </VideoPlayerProvider>
                        )}
                    </div>
                    
                    <div className="p-4 bg-gray-900 flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Bạn đang xem thử bài học này miễn phí</span>
                        {!isEnrolled && (
                            <Button 
                                onClick={() => {
                                    setPreviewLesson(null);
                                    handleEnrollClick();
                                }}
                                size="sm"
                                className="bg-[#a435f0] hover:bg-[#8710d8] hover:text-white"
                            >
                                Đăng ký khóa học
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}