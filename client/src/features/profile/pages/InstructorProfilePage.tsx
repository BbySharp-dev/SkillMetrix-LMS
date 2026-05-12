import { useParams } from 'react-router-dom';
import { BookOpen, Users, Star, GraduationCap, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { AvatarRoot, AvatarFallback, AvatarImage } from '@/components/ui';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { useInstructorProfile, useInstructorCourses } from '../hooks/useProfile';
import { PageLoader, EmptyState } from '@/components/common';

export function InstructorProfilePage() {
    const { instructorId } = useParams<{ instructorId: string }>();

    const { data: profile, isLoading: isLoadingProfile } = useInstructorProfile(instructorId!);
    const { data: courses, isLoading: isLoadingCourses } = useInstructorCourses(instructorId!);

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

                    <p className="text-gray-600 max-w-2xl">{profile.bio}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
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
                            <p className="text-2xl font-bold">{profile.totalCourses}</p>
                            <p className="text-xs text-muted-foreground">Tổng khóa học</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.publishedCourses}</p>
                            <p className="text-xs text-muted-foreground">Đã xuất bản</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.totalStudents.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Học viên</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                            <Star className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {profile.averageRating ? profile.averageRating.toFixed(1) : '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">Đánh giá TB</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Courses */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Khóa học của giảng viên</h2>

                {isLoadingCourses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="aspect-video w-full rounded-none" />
                                <CardContent className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-video bg-gray-100 relative">
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
                                        className={`absolute top-2 right-2 ${
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
                                <CardContent className="p-4 space-y-3">
                                    <h3 className="font-bold line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1">
                                            {course.rating && (
                                                <>
                                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                    <span className="font-medium">{course.rating.toFixed(1)}</span>
                                                </>
                                            )}
                                            <span className="text-muted-foreground">
                                                ({course.enrollmentCount} học viên)
                                            </span>
                                        </div>
                                        <span className="font-bold text-indigo-600">
                                            {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                                        </span>
                                    </div>
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={`/courses/${course.id}`}>Xem khóa học</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Chưa có khóa học"
                        description="Giảng viên này chưa có khóa học nào."
                        icon="book"
                    />
                )}
            </div>
        </div>
    );
}
