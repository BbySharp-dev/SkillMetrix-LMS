import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { enrollmentApi } from '../api/enrollmentApi';
import type { EnrollmentDto } from '../types';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function formatPrice(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
}

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentDto }) {
    return (
        <div className="card overflow-hidden card-hover flex flex-col sm:flex-row">
            {enrollment.course?.thumbnail ? (
                <img
                    src={enrollment.course.thumbnail}
                    alt={enrollment.course.title ?? ''}
                    className="w-full sm:w-48 h-40 sm:h-auto object-cover shrink-0"
                />
            ) : (
                <div className="w-full sm:w-48 h-40 sm:h-auto bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                </div>
            )}

            <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg leading-snug">
                        {enrollment.course?.title ?? 'Khóa học'}
                    </h3>
                    {enrollment.course?.instructorName && (
                        <p className="text-sm text-gray-500 mt-1">
                            Giảng viên: {enrollment.course.instructorName}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="badge badge-primary">
                            {formatPrice(enrollment.pricePaid)}
                        </span>
                        <span>Đã ghi danh: {formatDate(enrollment.enrolledAt)}</span>
                    </div>

                    <Link
                        to={`/courses/${enrollment.courseId}`}
                        className="btn-primary text-sm py-1.5 px-4"
                    >
                        Tiếp tục học
                    </Link>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có khóa học nào</h3>
            <p className="text-gray-500 mb-6">Hãy khám phá và ghi danh khóa học phù hợp với bạn.</p>
            <Link to="/courses" className="btn-primary">
                Khám phá khóa học
            </Link>
        </div>
    );
}

export default function EnrollmentsPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['enrollments', 'me'],
        queryFn: () => enrollmentApi.getMyEnrollments(),
    });

    const enrollments = data?.data ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? 'Đang tải...' : `${enrollments.length} khóa học đã ghi danh`}
                    </p>
                </div>
            </div>

            {isError && (
                <div className="card p-4 border-red-200 bg-red-50 text-red-600">
                    Không thể tải danh sách khóa học. Vui lòng thử lại.
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card h-40 animate-pulse bg-gray-50" />
                    ))}
                </div>
            ) : enrollments.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {enrollments.map((enrollment: EnrollmentDto) => (
                        <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                </div>
            )}
        </div>
    );
}
