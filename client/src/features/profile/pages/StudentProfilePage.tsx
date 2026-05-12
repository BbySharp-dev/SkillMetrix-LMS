import { useParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, CreditCard, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui';
import { AvatarRoot, AvatarFallback, AvatarImage } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Progress } from '@/components/ui';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { useStudentProfile, useStudentEnrollments } from '../hooks/useProfile';
import { PageLoader, EmptyState } from '@/components/common';

export function StudentProfilePage() {
    const { studentId } = useParams<{ studentId: string }>();

    const { data: profile, isLoading: isLoadingProfile } = useStudentProfile(studentId!);
    const { data: enrollments, isLoading: isLoadingEnrollments } = useStudentEnrollments(studentId!);

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <AvatarRoot className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.fullName} />
                    <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">
                        {profile.fullName.charAt(0)}
                    </AvatarFallback>
                </AvatarRoot>

                <div className="flex-1 space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                        <p className="text-muted-foreground">{profile.email}</p>
                    </div>

                    <p className="text-gray-600">
                        Thành viên từ {new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.totalEnrolledCourses}</p>
                            <p className="text-xs text-muted-foreground">Khóa học đã đăng ký</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.completedCourses}</p>
                            <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.totalLessonsCompleted}</p>
                            <p className="text-xs text-muted-foreground">Bài học đã học</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.totalSpent.toLocaleString()}đ</p>
                            <p className="text-xs text-muted-foreground">Đã chi tiêu</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Enrollments */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Khóa học đã đăng ký</h2>

                {isLoadingEnrollments ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4">
                                <div className="flex gap-4">
                                    <Skeleton className="w-32 h-20 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-2 w-full" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : enrollments && enrollments.length > 0 ? (
                    <div className="space-y-4">
                        {enrollments.map((enrollment) => (
                            <Card key={enrollment.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-32 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                                                <h3 className="font-bold text-lg truncate">
                                                    {enrollment.courseTitle}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Giảng viên: {enrollment.instructorName}
                                                </p>
                                            </div>
                                            <Badge
                                                className={
                                                    enrollment.completionPercent === 100
                                                        ? 'bg-emerald-500'
                                                        : enrollment.completionPercent >= 50
                                                            ? 'bg-blue-500'
                                                            : 'bg-gray-500'
                                                }
                                            >
                                                {enrollment.completionPercent}% hoàn thành
                                            </Badge>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <Progress value={enrollment.completionPercent} className="h-2" />
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>
                                                    {enrollment.completedLessons}/{enrollment.totalLessons} bài học
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Đăng ký {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/learning/${enrollment.courseId}`}>Tiếp tục học</a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Chưa có khóa học nào"
                        description="Học viên này chưa đăng ký khóa học nào."
                        icon="book"
                    />
                )}
            </div>
        </div>
    );
}
