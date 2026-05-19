import { useQuery } from '@tanstack/react-query';
import { Award, Download, AlertCircle, GraduationCap } from 'lucide-react';
import { certificateApi } from '../api/certificateApi';
import type { CertificateDto } from '../types';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function CertificatesPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['certificates', 'me'],
        queryFn: () => certificateApi.getMyCertificates(),
    });

    const certificates = data ?? [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Award size={28} className="text-primary" />
                        Chứng chỉ hoàn thành
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Danh sách chứng chỉ bạn đã nhận được khi hoàn thành các khóa học.
                    </p>
                </div>
            </div>

            {isError && (
                <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                        <AlertCircle size={20} className="text-destructive shrink-0" />
                        <span className="text-sm font-medium text-destructive">Không thể tải danh sách chứng chỉ. Vui lòng thử lại sau.</span>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden rounded-2xl shadow-sm border">
                            <Skeleton className="h-36 w-full rounded-none" />
                            <CardContent className="p-4 space-y-3">
                                <Skeleton className="h-5 w-3/4 rounded-lg" />
                                <Skeleton className="h-4 w-1/2 rounded-lg" />
                                <Skeleton className="h-4 w-2/3 rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : certificates.length === 0 ? (
                <Card className="rounded-2xl shadow-sm border">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-20 opacity-40">
                        <GraduationCap size={64} className="text-muted-foreground" />
                        <div className="space-y-1 text-center">
                            <p className="text-xl font-bold">Chưa có chứng chỉ nào</p>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Hoàn thành tất cả bài học trong khóa học để nhận chứng chỉ hoàn thành.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert: CertificateDto) => (
                        <Card key={cert.id} className="overflow-hidden rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="h-36 bg-linear-to-br from-primary/80 via-primary/60 to-primary/30 flex items-center justify-center relative">
                                <Award size={56} className="text-white/90" />
                                <div className="absolute inset-0 bg-black/10" />
                            </div>s
                            <CardContent className="p-4 space-y-3">
                                <h3 className="font-bold text-base line-clamp-2 leading-snug">
                                    {cert.courseTitle}
                                </h3>
                                {cert.instructorName && (
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Giảng viên: {cert.instructorName}
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        {cert.certificateCode}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                        {formatDate(cert.issuedAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                {cert.pdfUrl && cert.pdfUrl !== "" && (
                                    <a
                                        href={cert.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                                    >
                                        <Download size={14} />
                                        Tải chứng chỉ PDF
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
