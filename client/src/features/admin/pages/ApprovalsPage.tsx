import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShieldCheck, Search, AlertCircle, CheckCircle2, XCircle, Eye, User,
} from 'lucide-react';
import api from '@/lib/axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PendingCourse {
    id: string;
    title: string;
    instructorName: string;
    price: number;
    status: string;
    createdAt: string;
}

export default function ApprovalsPage() {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-approvals'],
        queryFn: async () => {
            const res = await api.get('/courses?status=Pending&pageSize=100');
            return res.data;
        }
    });

    const courses = (data?.data as PendingCourse[]) ?? [];

    const approveMutation = useMutation({
        mutationFn: (id: string) => api.put(`/courses/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
            toast.success('Đã duyệt khóa học thành công');
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => api.put(`/courses/${id}/reject`, { reason: 'Không đạt tiêu chuẩn chất lượng' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
            toast.error('Đã từ chối khóa học');
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-indigo-600 size-7" />
                        Duyệt khóa học
                    </h1>
                    <p className="text-gray-500 font-medium">Xem xét và phê duyệt các khóa học mới từ giảng viên.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
                    <Input placeholder="Tìm kiếm khóa học..." className="pl-10 h-11 rounded-xl border-gray-200" />
                </div>
            </div>

            {isError && (
                <Card className="border-rose-100 bg-rose-50 text-rose-600 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4 font-bold">
                        <AlertCircle className="size-4 shrink-0" />
                        Không thể tải danh sách chờ duyệt.
                    </CardContent>
                </Card>
            )}

            <Card className="border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden rounded-2xl">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="w-87.5 font-black text-gray-900 uppercase tracking-widest text-[10px]">Khóa học</TableHead>
                            <TableHead className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Giảng viên</TableHead>
                            <TableHead className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Ngày nộp</TableHead>
                            <TableHead className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Giá</TableHead>
                            <TableHead className="text-right font-black text-gray-900 uppercase tracking-widest text-[10px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-gray-50">
                                    <TableCell><Skeleton className="h-10 w-full rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-32 ml-auto rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                                        <CheckCircle2 className="size-16 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-gray-900">Không có yêu cầu chờ duyệt</p>
                                            <p className="text-sm font-medium">Tất cả khóa học đã được xử lý xong.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => (
                                <TableRow key={course.id} className="hover:bg-gray-50/50 border-gray-50 group transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                                <Eye className="size-4 text-indigo-600" />
                                            </div>
                                            <span className="font-black text-gray-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                {course.title}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            <User className="size-3.5 text-gray-400" />
                                            {course.instructorName}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell className="font-black text-gray-900 text-sm">
                                        {course.price <= 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="rounded-lg h-9 font-bold px-3 border-gray-200 hover:bg-gray-100"
                                                asChild
                                            >
                                                <a href={`/courses/${course.id}`} target="_blank" rel="noreferrer">
                                                    Xem
                                                </a>
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="rounded-lg h-9 font-bold px-3 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 shadow-md"
                                                onClick={() => approveMutation.mutate(course.id)}
                                                disabled={approveMutation.isPending}
                                            >
                                                <CheckCircle2 className="size-4 mr-1" />
                                                Duyệt
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="rounded-lg h-9 font-bold px-3 shadow-rose-100 shadow-md"
                                                onClick={() => rejectMutation.mutate(course.id)}
                                                disabled={rejectMutation.isPending}
                                            >
                                                <XCircle className="size-4 mr-1" />
                                                Từ chối
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
