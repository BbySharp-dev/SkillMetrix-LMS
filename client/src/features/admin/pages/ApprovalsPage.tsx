import { useState } from 'react';
import {
    ShieldCheck,
    Search,
    CheckCircle2,
    XCircle,
    Eye,
    User,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui';
import { Textarea } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePendingCourses, useAdminCourseMutations } from '../hooks/useAdminCourses';



export default function ApprovalsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const { data, isLoading, isError, refetch } = usePendingCourses({
        pageSize: 100,
        search: searchTerm || undefined,
    });

    const { approveCourse, rejectCourse } = useAdminCourseMutations();

    const courses = data?.data ?? [];
    const filteredCourses = courses.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleReject = () => {
        if (!rejectingCourseId || !rejectReason.trim()) return;
        rejectCourse.mutate(
            { courseId: rejectingCourseId, reason: rejectReason.trim() },
            {
                onSettled: () => {
                    setRejectingCourseId(null);
                    setRejectReason('');
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-indigo-600 size-6" />
                        Duyệt khóa học
                    </h1>
                    <p className="text-sm font-medium text-gray-500">
                        Xem xét và phê duyệt các khóa học mới từ giảng viên
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-black text-sm px-3 py-1.5 rounded-xl">
                        {data?.totalRecords ?? 0} chờ duyệt
                    </Badge>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold border-gray-200" onClick={() => refetch()}>
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
                <Input
                    placeholder="Tìm theo tên khóa học hoặc giảng viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 rounded-xl border-gray-200 bg-white"
                />
            </div>

            {/* Error */}
            {isError && (
                <Card className="border border-red-100 bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-red-600 font-bold text-sm">
                        <AlertCircle className="size-4 shrink-0" />
                        Không thể tải danh sách. Vui lòng thử lại.
                    </div>
                </Card>
            )}

            {/* Table */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-2xl">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-5 pl-6 w-[35%]">Khóa học</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Giảng viên</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Ngày nộp</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Giá</TableHead>
                            <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-gray-500 pr-6">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-gray-50">
                                    <TableCell className="py-5 pl-6">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                                            <Skeleton className="h-4 w-48 rounded" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                                    <TableCell><Skeleton className="h-9 w-40 ml-auto rounded-xl" /></TableCell>
                                </TableRow>
                            ))
                            : filteredCourses.length === 0 && !searchTerm ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                                            <CheckCircle2 className="size-12 text-gray-300" />
                                            <div className="space-y-1">
                                                <p className="text-base font-black text-gray-900">Không có yêu cầu chờ duyệt</p>
                                                <p className="text-sm font-medium text-gray-400">Tất cả khóa học đã được xử lý xong.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCourses.length === 0 && searchTerm ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-sm font-medium text-gray-400">
                                        Không tìm thấy khóa học phù hợp với "{searchTerm}"
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCourses.map((course) => {
                                    const isApproving = approveCourse.isPending && approveCourse.variables === course.id;
                                    const isRejecting = rejectCourse.isPending && rejectCourse.variables?.courseId === course.id;
                                    const isProcessing = isApproving || isRejecting;

                                    return (
                                        <TableRow key={course.id} className="hover:bg-gray-50/40 border-gray-50 group transition-colors">
                                            <TableCell className="py-5 pl-6">
                                                <div className="flex items-center gap-3">
                                                    {course.thumbnail ? (
                                                        <img src={course.thumbnail} alt={course.title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                                            <Eye className="size-4 text-indigo-400" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-black text-sm text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{course.title}</p>
                                                        <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                                                            {course.description?.substring(0, 80)}{course.description && course.description.length > 80 ? '...' : ''}
                                                        </p>
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
                                                <span className="text-xs font-bold text-gray-400">{formatDate(course.createdAt)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-black text-sm text-gray-900">
                                                    {course.price <= 0 ? 'Miễn phí' : formatCurrency(course.price)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold px-3 border-gray-200 hover:bg-gray-50 text-gray-600" asChild>
                                                        <a href={`/courses/${course.id}`} target="_blank" rel="noreferrer">
                                                            <Eye className="size-4 mr-1" />Xem
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="h-9 rounded-xl font-bold px-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                                        onClick={() => approveCourse.mutate(course.id)}
                                                        disabled={isProcessing}
                                                    >
                                                        {isApproving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                                                        <span className="ml-1">Duyệt</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 rounded-xl font-bold px-3 border-red-200 text-red-600 hover:bg-red-50"
                                                        onClick={() => setRejectingCourseId(course.id)}
                                                        disabled={isProcessing}
                                                    >
                                                        {isRejecting ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                                                        <span className="ml-1">Từ chối</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                    </TableBody>
                </Table>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={!!rejectingCourseId} onOpenChange={(open) => { if (!open) { setRejectingCourseId(null); setRejectReason(''); } }}>
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
                        <Textarea
                            placeholder="VD: Nội dung khóa học chưa đạt chuẩn chất lượng, cần bổ sung phần bài tập thực hành..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            className="rounded-xl resize-none"
                        />
                        <p className="text-xs text-gray-400 font-medium">Tối thiểu 10 ký tự</p>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="outline" className="h-10 rounded-xl font-bold border-gray-200" onClick={() => { setRejectingCourseId(null); setRejectReason(''); }}>
                            Hủy
                        </Button>
                        <Button
                            className="h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleReject}
                            disabled={rejectCourse.isPending || rejectReason.trim().length < 10}
                        >
                            {rejectCourse.isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                            <span className="ml-1.5">Xác nhận từ chối</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
