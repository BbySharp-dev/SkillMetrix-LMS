import { Link } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';
import type { CourseListItem } from '../types';

interface CourseCardProps {
    course: CourseListItem;
}

const formatPrice = (price: number) => {
    if (price <= 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND', 
        minimumFractionDigits: 0 
    }).format(price);
};

export default function CourseCard({ course }: CourseCardProps) {
    const title = course.title || 'Khóa học chưa có tên';
    const instructor = course.instructorName || 'Đang cập nhật';

    return (
        <Link to={`/courses/${course.id}`} className="block group h-full">
            <div className="flex flex-col h-full space-y-3 bg-white transition-all">
                <div className="relative aspect-video overflow-hidden border border-gray-100 rounded-lg shrink-0">
                    <img
                        src={course.thumbnail || 'https://placehold.co/640x360?text=No+Image'}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1 flex flex-col space-y-2 px-1 pb-2">
                    <div className="space-y-1 flex-1">
                        <h3 className="font-black text-gray-900 leading-tight line-clamp-2 text-[15px] group-hover:text-indigo-700 transition-colors">
                            {title}
                        </h3>
                        <p className="text-[12px] text-gray-500 font-medium truncate">{instructor}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider py-1 border-y border-gray-50">
                        <span className="flex items-center gap-1.5"><BookOpen className="size-3" /> {course.chapterCount} chương</span>
                        <span className="flex items-center gap-1.5"><Users className="size-3" /> {course.enrollmentCount} học viên</span>
                    </div>

                    <div className="pt-1">
                        <span className="text-lg font-black text-gray-900">{formatPrice(course.price)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
