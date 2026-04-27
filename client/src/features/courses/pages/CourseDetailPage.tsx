import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCourseCurriculum, useCourseDetail } from '@/features/courses/hooks/useCourses';
import { enrollmentApi } from '@/features/enrollments/api/enrollmentApi';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import ChapterAccordion from '../components/ChapterAccordion';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const { data, isLoading, isError, error } = useCourseDetail(id);
    const { data: curriculum } = useCourseCurriculum(id);

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate(`/login?returnUrl=/courses/${id}`);
            return;
        }

        if (!id) return;
        setIsEnrolling(true);
        try {
            await enrollmentApi.enroll(id);
            navigate(`/dashboard/my-enrollments`);
        } catch {
            setIsEnrolling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-52 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700">
                Không thể tải chi tiết khóa học: {String(error)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <section className="space-y-6">
                <div className="rounded-2xl overflow-hidden bg-linear-to-br from-indigo-700 to-cyan-600 text-white p-6 md:p-8">
                    <p className="text-indigo-100 text-sm mb-2">Chi tiết khóa học</p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">{data.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span>{data.enrollmentCount.toLocaleString()} học viên</span>
                        <span>{data.chapterCount} chương</span>
                        <span className="capitalize text-indigo-200">{data.status}</span>
                    </div>

                    <p className="mt-4 text-indigo-100">Giảng viên: {data.instructorName}</p>
                </div>

                {data.description && (
                    <article className="bg-white border rounded-xl p-5">
                        <h2 className="font-semibold text-lg mb-2">Giới thiệu khóa học</h2>
                        <p className="text-gray-700 whitespace-pre-line">{data.description}</p>
                    </article>
                )}

                {curriculum && curriculum.length > 0 && (
                    <article className="bg-white border rounded-xl p-5">
                        <h2 className="font-semibold text-lg mb-4">Nội dung khóa học</h2>
                        <ChapterAccordion chapters={curriculum} />
                    </article>
                )}
            </section>

            <aside className="rounded-xl border bg-white p-5 shadow-sm sticky top-20">
                <img
                    src={data.thumbnail || 'https://placehold.co/640x360?text=No+Image'}
                    alt={data.title ?? ''}
                    className="w-full rounded-lg mb-4"
                />
                <p className="text-2xl font-bold text-gray-900 mb-4">
                    {data.price <= 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.price)}
                </p>
                <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-colors"
                >
                    {isEnrolling ? 'Đang xử lý...' : 'Đăng ký ngay'}
                </button>
            </aside>
        </div>
    );
}
