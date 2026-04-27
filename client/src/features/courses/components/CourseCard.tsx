import { Link } from 'react-router-dom';
import type { CourseListItem } from '../types';

interface CourseCardProps {
    course: CourseListItem;
}

const formatPrice = (price: number) => {
    if (price <= 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(price);
};

export default function CourseCard({ course }: CourseCardProps) {
    const title = course.title || 'Khóa học chưa có tên';
    const instructor = course.instructorName || 'Đang cập nhật';

    return (
        <article className="group rounded-xl border overflow-hidden bg-white hover:shadow-lg transition-shadow flex flex-col h-full">
            <div className="relative overflow-hidden">
                <img
                    src={course.thumbnail || 'https://placehold.co/640x360?text=No+Image'}
                    alt={title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded bg-black/75 text-white shadow-sm">
                    {formatPrice(course.price)}
                </span>
            </div>

            <div className="p-4 flex flex-col grow space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-12" title={title}>
                    {title}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-1">
                    by <span className="font-medium text-gray-700">{instructor}</span>
                </p>

                <div className="flex items-center text-xs text-gray-500 space-x-2 pt-1">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {course.chapterCount} chương
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {course.enrollmentCount.toLocaleString()} học viên
                    </span>
                </div>

                <div className="mt-auto pt-4">
                    <Link
                        to={`/courses/${course.id}`}
                        className="inline-block w-full text-center px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                    >
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </article>
    );
}
