import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Download, AlertCircle, GraduationCap, Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { certificateApi } from '../api/certificateApi';
import type { CertificateDto } from '../types';
import { Card, CardContent, Input, Button, Badge, Skeleton } from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';

export default function CertificatesPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    const queryParams = {
        pageNumber: page,
        pageSize: 6, // 6 items fits perfectly on a 3-column grid
        search: search.trim() || undefined,
        sortBy
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['certificates', 'me', queryParams],
        queryFn: () => certificateApi.getMyCertificates(queryParams),
    });

    const certificates = data?.data ?? [];
    const totalRecords = data?.totalRecords ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const handleReset = () => {
        setPage(1);
        setSearch('');
        setSortBy('latest');
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Award size={32} className="text-indigo-600 animate-pulse" />
                        Chứng chỉ hoàn thành
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">
                        Danh sách chứng chỉ bạn đã nhận được khi hoàn thành xuất sắc các khóa học.
                    </p>
                </div>
            </div>

            {/* Filter and Search Panel */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <SlidersHorizontal size={16} className="text-indigo-600" />
                    Tìm kiếm chứng chỉ
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div className="relative sm:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Tìm kiếm theo tên khóa học..."
                            className="pl-10 h-10 w-full rounded-xl border border-gray-200 text-sm font-semibold focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                        <option value="latest">Mới nhận</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="title">Tên khóa học (A-Z)</option>
                    </select>
                </div>

                <div className="flex justify-between items-center pt-1">
                    <div className="text-xs font-bold text-gray-500">
                        {totalRecords > 0 && `Tìm thấy ${totalRecords} chứng chỉ`}
                    </div>
                    {(search || sortBy !== 'latest') && (
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="text-xs font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 h-8 px-3 rounded-lg flex items-center gap-1.5"
                        >
                            <RotateCcw size={12} />
                            Đặt lại bộ lọc
                        </Button>
                    )}
                </div>
            </div>

            {isError && (
                <Card className="border-destructive/20 bg-destructive/5 shadow-sm rounded-2xl">
                    <CardContent className="flex items-center gap-3 p-4">
                        <AlertCircle size={20} className="text-destructive shrink-0" />
                        <span className="text-sm font-medium text-destructive">Không thể tải danh sách chứng chỉ. Vui lòng thử lại sau.</span>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden rounded-2xl shadow-sm border">
                            <Skeleton className="h-36 w-full rounded-none" />
                            <CardContent className="p-5 space-y-3">
                                <Skeleton className="h-5 w-3/4 rounded-lg" />
                                <Skeleton className="h-4 w-1/2 rounded-lg" />
                                <Skeleton className="h-4 w-2/3 rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : certificates.length === 0 ? (
                <Card className="rounded-2xl shadow-sm border border-gray-100 bg-gray-50/20">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-20 opacity-60">
                        <GraduationCap size={64} className="text-gray-300" />
                        <div className="space-y-1 text-center">
                            <p className="text-lg font-bold text-gray-900">Không tìm thấy chứng chỉ nào</p>
                            <p className="text-sm text-gray-500 max-w-sm">
                                {search || sortBy !== 'latest'
                                    ? 'Thử thay đổi từ khóa hoặc đặt lại bộ lọc tìm kiếm.'
                                    : 'Hoàn thành tất cả các bài học của khóa học để nhận chứng chỉ chính thức.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert: CertificateDto) => (
                            <Card key={cert.id} className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                                <div className="h-36 bg-linear-to-br from-indigo-600 via-indigo-500/80 to-purple-500/40 flex items-center justify-center relative">
                                    <Award size={56} className="text-white/95 drop-shadow-md" />
                                    <div className="absolute inset-0 bg-black/5" />
                                </div>
                                <CardContent className="p-5 space-y-4">
                                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug min-h-10">
                                        {cert.courseTitle}
                                    </h3>
                                    {cert.instructorName && (
                                        <p className="text-xs text-muted-foreground font-semibold">
                                            Giảng viên: {cert.instructorName}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between pt-1">
                                        <Badge variant="secondary" className="rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border-none px-2.5 py-0.5">
                                            {cert.certificateCode}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                                            {formatDate(cert.issuedAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {cert.pdfUrl && cert.pdfUrl !== "" && (
                                        <div className="pt-2">
                                            <a
                                                href={cert.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                            >
                                                <Download size={14} />
                                                Tải chứng chỉ PDF
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                            <div className="text-xs font-bold text-gray-500">
                                Hiển thị {(page - 1) * 6 + 1}–{Math.min(page * 6, totalRecords)} trong tổng số {totalRecords} chứng chỉ
                            </div>
                            <Pagination
                                pageNumber={page}
                                totalPages={totalPages}
                                onChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

