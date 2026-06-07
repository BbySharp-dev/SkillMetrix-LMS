import { useState } from 'react';
import {
    BookImage, Search, Eye, CheckCircle2, XCircle, Filter,
    User, Star, Users, Loader2, AlertCircle, Trash2, RotateCcw,
} from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Input } from '@/components/ui';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui';
import { Textarea } from '@/components/ui';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAdminCourses, useAdminCourseMutations } from '../hooks/useAdminCourses';
import { useAdminOverview } from '../hooks/useAdminUsers';

const statusStyles: Record<string, string> = {
    Published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
    Draft: 'bg-gray-50 text-gray-600 border-gray-200',
};
const statusLabels: Record<string, string> = {
    Published: 'Đang hiển thị', Pending: 'Chờ duyệt',
    Rejected: 'Bị từ chối', Draft: 'Bản nháp',
};

export default function AdminCoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [showDeleted, setShowDeleted] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
    const [restoreCourseId, setRestoreCourseId] = useState<string | null>(null);

    const { data, isLoading, isError, refetch } = useAdminCourses({
        search: searchTerm || undefined,
        status: statusFilter === 'All' ? undefined : statusFilter,
        pageNumber: page, pageSize,
        includeDeleted: showDeleted,
    });
    const { approveCourse, rejectCourse, deleteCourse, restoreCourse } = useAdminCourseMutations();
    const { data: overviewData } = useAdminOverview();

    const courses = data?.data ?? [];
    const totalRecords = data?.totalRecords ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const handleReject = () => {
        if (!rejectingCourseId || !rejectReason.trim()) return;
        rejectCourse.mutate(
            { courseId: rejectingCourseId, reason: rejectReason.trim() },
            { onSettled: () => { setRejectingCourseId(null); setRejectReason(''); } }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <BookImage className="text-indigo-600 size-6" />
                        Quản lý khóa học
                    </h1>
                    <p className="text-sm font-medium text-gray-500">Quản lý và xử lý tất cả khóa học trên hệ thống</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={`${statusStyles['Published']} font-black text-[10px] uppercase tracking-wider border rounded-lg px-2 py-0.5`}>
                        Đang hiển thị: {overviewData?.publishedCourses ?? 0}
                    </Badge>
                    <Badge className={`${statusStyles['Pending']} font-black text-[10px] uppercase tracking-wider border rounded-lg px-2 py-0.5`}>
                        Chờ duyệt: {overviewData?.pendingCourses ?? 0}
                    </Badge>
                    <Badge className={`${statusStyles['Rejected']} font-black text-[10px] uppercase tracking-wider border rounded-lg px-2 py-0.5`}>
                        Bị từ chối: {overviewData?.rejectedCourses ?? 0}
                    </Badge>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input placeholder="Tìm theo tên khóa học..." value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 rounded-xl font-bold border-gray-200 hover:bg-gray-50 flex-1 md:flex-none">
                                <Filter className="size-4 mr-2" />
                                {statusFilter === 'All' ? 'Trạng thái' : statusLabels[statusFilter] ?? statusFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-xl border-gray-100 w-48">
                            <DropdownMenuItem onClick={() => { setStatusFilter('All'); setPage(1); }} className="rounded-lg py-2 font-bold text-sm">Tất cả</DropdownMenuItem>
                            {Object.keys(statusLabels).map(status => (
                                <DropdownMenuItem key={status} onClick={() => { setStatusFilter(status); setPage(1); }} className="rounded-lg py-2 font-bold text-sm">{statusLabels[status]}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold border-gray-200" onClick={() => refetch()}>Làm mới</Button>
                    <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                        <input
                            type="checkbox"
                            id="show-deleted"
                            checked={showDeleted}
                            onChange={e => { setShowDeleted(e.target.checked); setPage(1); }}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                        <label htmlFor="show-deleted" className="text-sm font-bold text-gray-500 cursor-pointer select-none whitespace-nowrap">
                            Hiển thị đã xóa
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 rounded-xl border border-gray-100">
                    <div className="text-2xl font-black text-gray-900">{overviewData?.totalCourses ?? 0}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Tổng khóa học</div>
                </Card>
                <Card className="p-4 rounded-xl border border-gray-100">
                    <div className="text-2xl font-black text-emerald-600">{overviewData?.publishedCourses ?? 0}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Đang hiển thị</div>
                </Card>
                <Card className="p-4 rounded-xl border border-gray-100">
                    <div className="text-2xl font-black text-amber-600">{overviewData?.pendingCourses ?? 0}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Chờ duyệt</div>
                </Card>
                <Card className="p-4 rounded-xl border border-gray-100">
                    <div className="text-2xl font-black text-red-600">{overviewData?.rejectedCourses ?? 0}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Bị từ chối</div>
                </Card>
            </div>

            {isError && (
                <Card className="border border-red-100 bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-red-600 font-bold text-sm">
                        <AlertCircle className="size-4 shrink-0" />
                        Không thể tải danh sách. Vui lòng thử lại.
                    </div>
                </Card>
            )}

            <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-2xl">
                <div className="overflow-x-auto w-full">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-5 pl-6 w-[30%]">Khóa học</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Giảng viên</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Trạng thái</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Học viên</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Giá</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Đánh giá</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-gray-500 pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i} className="border-gray-50">
                                        <TableCell className="py-5 pl-6"><div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-xl shrink-0" /><Skeleton className="h-4 w-40 rounded" /></div></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                                        <TableCell><Skeleton className="h-9 w-32 ml-auto rounded-xl" /></TableCell>
                                    </TableRow>
                                ))
                                : courses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                                                <BookImage className="size-12 text-gray-300" />
                                                <div className="space-y-1">
                                                    <p className="text-base font-black text-gray-900">Không có khóa học nào</p>
                                                    <p className="text-sm font-medium text-gray-400">Thử thay đổi bộ lọc để xem kết quả khác.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : courses.map(course => {
                                    const isApproving = approveCourse.isPending && approveCourse.variables === course.id;
                                    const isRejecting = rejectCourse.isPending && rejectCourse.variables?.courseId === course.id;
                                    const isProcessing = isApproving || isRejecting;
                                    return (
                                        <TableRow key={course.id} className={`hover:bg-gray-50/40 border-gray-50 group transition-colors ${course.isDeleted ? 'opacity-50 bg-red-50/20' : ''}`}>
                                            <TableCell className="py-5 pl-6">
                                                <div className="flex items-center gap-3">
                                                    {course.thumbnail
                                                         ? <img 
                                                             src={course.thumbnail} 
                                                             alt={course.title} 
                                                             className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" 
                                                             onError={(e) => {
                                                                 (e.target as HTMLImageElement).src = 'https://placehold.co/640x360?text=SkillMetrix+LMS';
                                                             }}
                                                           />
                                                        : <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0"><BookImage className="size-5 text-indigo-400" /></div>
                                                    }
                                                    <div className="min-w-0">
                                                        <p className={`font-black text-sm truncate transition-colors ${course.isDeleted ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-indigo-600'}`}>{course.title}</p>
                                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Cập nhật: {formatDate(course.updatedAt ?? course.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                                    <User className="size-3.5 text-gray-400 shrink-0" />
                                                    {course.instructorName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`rounded-lg px-2.5 py-1 font-black text-[10px] uppercase tracking-wider border ${statusStyles[course.status] ?? statusStyles['Draft']}`}>
                                                    {statusLabels[course.status] ?? course.status}
                                                </Badge>
                                                {course.status === 'Rejected' && course.rejectionReason && (
                                                    <p className="text-xs text-red-400 font-medium mt-0.5 max-w-30 truncate" title={course.rejectionReason}>Lý do: {course.rejectionReason}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm font-bold text-gray-600">
                                                    <Users className="size-3.5 text-gray-400" />
                                                    {course.enrollmentCount}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-black text-sm text-gray-900">
                                                    {course.price <= 0 ? 'Miễn phí' : formatCurrency(course.price)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                                                    <Star className="size-3.5 text-amber-400 fill-amber-400" />
                                                    {course.rating > 0 ? course.rating.toFixed(1) : '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                {!course.isDeleted ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold px-2.5 border-gray-200 hover:bg-gray-50 text-gray-500" asChild>
                                                            <a href={`/courses/${course.id}`} target="_blank" rel="noreferrer"><Eye className="size-3.5" /></a>
                                                        </Button>
                                                        {course.status === 'Pending' && (
                                                            <>
                                                                <Button size="sm" className="h-8 rounded-lg font-bold px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                    onClick={() => approveCourse.mutate(course.id)} disabled={isProcessing} title="Duyệt">
                                                                    {isApproving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                                                                </Button>
                                                                <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold px-2.5 border-red-200 text-red-600 hover:bg-red-50"
                                                                    onClick={() => setRejectingCourseId(course.id)} disabled={isProcessing} title="Từ chối">
                                                                    {isRejecting ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold px-2.5 border-gray-200 text-red-500 hover:bg-red-50"
                                                            onClick={() => setDeleteCourseId(course.id)} disabled={isProcessing} title="Xóa mềm">
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold px-2.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                        onClick={() => setRestoreCourseId(course.id)} title="Khôi phục">
                                                        <RotateCcw className="size-3.5" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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
                                onChange={setPage}
                            />
                        )}
                    </div>
                )}
            </Card>

            <Dialog open={!!rejectingCourseId} onOpenChange={open => { if (!open) { setRejectingCourseId(null); setRejectReason(''); } }}>
                <DialogContent size="md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="size-5" />
                            Từ chối khóa học
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            Nhập lý do từ chối. Lý do này sẽ được gửi đến giảng viên.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-bold text-gray-700">
                            Lý do từ chối <span className="text-red-500">*</span>
                        </label>
                        <Textarea placeholder="VD: Nội dung khóa học chưa đạt chuẩn chất lượng, cần bổ sung phần bài tập thực hành..."
                            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            rows={4} className="rounded-xl resize-none" />
                        <p className="text-xs text-gray-400 font-medium">Tối thiểu 10 ký tự</p>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="outline" className="h-10 rounded-xl font-bold border-gray-200"
                            onClick={() => { setRejectingCourseId(null); setRejectReason(''); }}>Hủy</Button>
                        <Button className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleReject} disabled={rejectCourse.isPending || rejectReason.trim().length < 10}>
                            {rejectCourse.isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                            <span className="ml-1.5">Xác nhận từ chối</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm xóa mềm */}
            <ConfirmModal
                open={deleteCourseId !== null}
                title="Xóa khóa học"
                message="Khóa học sẽ được chuyển vào thùng rác và có thể khôi phục sau."
                confirmText="Xóa"
                loading={deleteCourse.isPending}
                onConfirm={() => {
                    if (deleteCourseId) deleteCourse.mutate(deleteCourseId);
                    setDeleteCourseId(null);
                }}
                onCancel={() => setDeleteCourseId(null)}
            />

            {/* Confirm khôi phục */}
            <ConfirmModal
                open={restoreCourseId !== null}
                title="Khôi phục khóa học"
                message="Khóa học sẽ được khôi phục và quay lại trạng thái bản nháp."
                confirmText="Khôi phục"
                loading={restoreCourse.isPending}
                onConfirm={() => {
                    if (restoreCourseId) restoreCourse.mutate(restoreCourseId);
                    setRestoreCourseId(null);
                }}
                onCancel={() => setRestoreCourseId(null)}
            />
        </div>
    );
}
