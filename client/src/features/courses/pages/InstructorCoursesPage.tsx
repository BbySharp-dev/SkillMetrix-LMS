import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Plus, 
    Search,
    Edit2,
    Trash2,
    Eye,
    MoreHorizontal,
    Filter,
    ArrowUpDown,
    RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CourseStatus } from '../types';

import { useMyCourses, useCourseMutations } from '@/features/courses/hooks/useCourses';
import { Skeleton } from '@/components/ui';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Pagination } from '@/components/ui/Pagination';

const statusStyles: Record<CourseStatus, string> = {
    Published: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Draft: 'bg-gray-50 text-gray-600 border-gray-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Rejected: 'bg-red-50 text-red-600 border-red-100',
};

const statusLabels: Record<CourseStatus, string> = {
    Published: 'Đang hiển thị',
    Draft: 'Bản nháp',
    Pending: 'Đang chờ duyệt',
    Rejected: 'Bị từ chối',
};

export default function InstructorCoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<CourseStatus | 'All'>('All');
    const [showDeleted, setShowDeleted] = useState(false);
    const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
    const [restoreCourseId, setRestoreCourseId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const { data: coursesData, isLoading } = useMyCourses({
        pageNumber: page,
        pageSize,
        search: searchTerm,
        status: statusFilter === 'All' ? undefined : statusFilter,
        includeDeleted: showDeleted || undefined,
    });

    const { deleteCourse, submitCourse, restoreCourse } = useCourseMutations();

    const courses = coursesData?.data ?? [];
    const totalRecords = coursesData?.totalRecords ?? 0;
    const totalPages = coursesData?.totalPages ?? 1;


    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Khóa học của tôi</h1>
                    <p className="text-sm font-bold text-gray-400 mt-1">Quản lý và cập nhật các khóa học của bạn</p>
                </div>
                <Button asChild className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl shadow-lg shadow-indigo-200 transition-all">
                    <Link to="/instructor/courses/new">
                        <Plus className="size-5 mr-2" />
                        TẠO KHÓA HỌC MỚI
                    </Link>
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">                <div className="flex items-center gap-2 shrink-0">
                    <input
                        type="checkbox"
                        id="show-deleted"
                        checked={showDeleted}
                        onChange={(e) => setShowDeleted(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                    <label htmlFor="show-deleted" className="text-sm font-bold text-gray-500 cursor-pointer select-none whitespace-nowrap">
                        Hiển thị đã xóa
                    </label>
                </div>                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên khóa học..." 
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 rounded-xl font-bold border-gray-200 hover:bg-gray-50 flex-1 md:flex-none">
                                <Filter className="size-4 mr-2" />
                                {statusFilter === 'All' ? 'Trạng thái' : statusLabels[statusFilter]}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl border-gray-100 w-48">
                            <DropdownMenuItem onClick={() => setStatusFilter('All')} className="rounded-lg py-2 font-bold text-sm">Tất cả</DropdownMenuItem>
                            {(Object.keys(statusLabels) as CourseStatus[]).map(status => (
                                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className="rounded-lg py-2 font-bold text-sm">
                                    {statusLabels[status]}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" className="h-11 rounded-xl font-bold border-gray-200 hover:bg-gray-50 flex-1 md:flex-none">
                        <ArrowUpDown className="size-4 mr-2" />
                        Sắp xếp
                    </Button>
                </div>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-100 font-black text-[10px] uppercase tracking-widest text-gray-400 py-6 pl-8">Khóa học</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Giá bán</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Trạng thái</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Học viên</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Cập nhật</TableHead>
                                <TableHead className="w-25 text-right pr-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6} className="py-8 pl-8">
                                            <div className="flex gap-4">
                                                <Skeleton className="w-20 h-12 rounded-lg" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-3/4" />
                                                    <Skeleton className="h-3 w-1/4" />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : courses.map((course) => (
                                <TableRow key={course.id} className={`group hover:bg-gray-50/50 transition-colors ${course.isDeleted ? 'opacity-50 bg-red-50/20' : ''}`}>
                                    <TableCell className="py-6 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                                                {course.thumbnail ? (
                                                    <img 
                                                        src={course.thumbnail} 
                                                        alt={course.title ?? ''}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/640x360?text=SkillMetrix+LMS';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 opacity-20" />
                                                )}
                                            </div>
                                            <Link 
                                                to={course.isDeleted ? '#' : `/instructor/courses/${course.id}`}
                                                className={`font-bold text-sm transition-colors line-clamp-2 ${course.isDeleted ? 'text-gray-400 line-through pointer-events-none' : 'text-gray-900 hover:text-indigo-600'}`}
                                            >
                                                {course.title}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-sm text-gray-900">
                                        {course.price.toLocaleString('vi-VN')}đ
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-lg px-2.5 py-1 font-black text-[10px] uppercase tracking-wider border ${statusStyles[course.status as CourseStatus] ?? statusStyles['Draft']}`}>
                                            {statusLabels[course.status as CourseStatus] ?? 'Bản nháp'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-sm text-gray-500">
                                        {course.enrollmentCount}
                                    </TableCell>
                                    <TableCell className="text-xs font-bold text-gray-400">
                                        {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-white border border-transparent hover:border-gray-200">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-gray-100">
                                                {!course.isDeleted ? (
                                                    <>
                                                        <DropdownMenuItem asChild className="rounded-lg py-2 font-bold text-sm cursor-pointer">
                                                            <Link to={`/instructor/courses/${course.id}`}>
                                                                <Edit2 className="size-4 mr-3 text-gray-400" />
                                                                Chỉnh sửa
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {course.status === 'Draft' && (
                                                            <DropdownMenuItem 
                                                                onClick={() => submitCourse.mutate(course.id)}
                                                                className="rounded-lg py-2 font-bold text-sm cursor-pointer text-indigo-600 focus:bg-indigo-50"
                                                            >
                                                                <Plus className="size-4 mr-3" />
                                                                Nộp duyệt
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem asChild className="rounded-lg py-2 font-bold text-sm cursor-pointer">
                                                            <Link to={`/courses/${course.id}`}>
                                                                <Eye className="size-4 mr-3 text-gray-400" />
                                                                Xem trước
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => setDeleteCourseId(course.id)}
                                                            className="rounded-lg py-2 font-bold text-sm text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600"
                                                        >
                                                            <Trash2 className="size-4 mr-3" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        onClick={() => setRestoreCourseId(course.id)}
                                                        className="rounded-lg py-2 font-bold text-sm text-emerald-600 cursor-pointer focus:bg-emerald-50 focus:text-emerald-600"
                                                    >
                                                        <RotateCcw className="size-4 mr-3" />
                                                        Khôi phục
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {totalRecords > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-white">
                        <div className="text-sm font-bold text-gray-500">
                            Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalRecords)} trong {totalRecords} khóa học
                        </div>
                        {totalPages > 1 && (
                            <Pagination
                                pageNumber={page}
                                totalPages={totalPages}
                                onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            />
                        )}
                    </div>
                )}
            </div>

                {/* Confirm Modals */}
                <ConfirmModal
                    open={deleteCourseId !== null}
                    title="Xóa khóa học"
                    message="Bạn có chắc chắn muốn xóa khóa học này? Khóa học sẽ được chuyển vào thùng rác và có thể khôi phục sau."
                    confirmText="Xóa"
                    loading={deleteCourse.isPending}
                    onConfirm={() => {
                        if (deleteCourseId) deleteCourse.mutate(deleteCourseId);
                        setDeleteCourseId(null);
                    }}
                    onCancel={() => setDeleteCourseId(null)}
                />
                <ConfirmModal
                    open={restoreCourseId !== null}
                    title="Khôi phục khóa học"
                    message="Khôi phục khóa học này? Khóa học sẽ quay lại trạng thái bản nháp."
                    confirmText="Khôi phục"
                    loading={restoreCourse.isPending}
                    onConfirm={() => {
                        if (restoreCourseId) restoreCourse.mutate(restoreCourseId);
                        setRestoreCourseId(null);
                    }}
                    onCancel={() => setRestoreCourseId(null)}
                />

                {courses.length === 0 && !isLoading && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="size-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900">Chưa có khóa học nào</h3>
                        <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto mt-2">
                            Hãy tạo khóa học đầu tiên của bạn để chia sẻ kiến thức với mọi người.
                        </p>
                    </div>
                )}
            </div>
    );
}
