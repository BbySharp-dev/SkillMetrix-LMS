import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, SearchX } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import CourseFilters, { type CourseFilterState } from '../components/CourseFilters';
import CourseCardSkeleton from '../components/CourseCardSkeleton';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { Pagination } from "@/components/ui/Pagination.tsx";
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 12;

const parsePositiveNumber = (raw: string | null, fallback: number) => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseOptionalNumber = (raw: string | null) => {
    if (!raw?.trim()) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
};

export default function CoursesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const isApplying = useRef(false);

    const pageNumber = parsePositiveNumber(searchParams.get('page'), 1);

    const filters = useMemo<CourseFilterState>(() => ({
        search: searchParams.get('search') ?? '',
        minPrice: parseOptionalNumber(searchParams.get('minPrice')),
        maxPrice: parseOptionalNumber(searchParams.get('maxPrice')),
        minRating: parseOptionalNumber(searchParams.get('minRating')),
    }), [searchParams]);

    const queryParams = useMemo(
        () => ({
            pageNumber,
            pageSize: PAGE_SIZE,
            search: filters.search,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            minRating: filters.minRating,
        }),
        [pageNumber, filters.search, filters.minPrice, filters.maxPrice, filters.minRating]
    );

    const { data, isLoading, isError, error } = useCourses(queryParams);

    const updateUrl = (next: { page?: number; filters?: CourseFilterState }) => {
        const finalPage = next.page ?? pageNumber;
        const finalFilters = next.filters ?? filters;

        const nextParams = new URLSearchParams();

        if (finalPage > 1) nextParams.set('page', String(finalPage));
        if (finalFilters.search?.trim()) nextParams.set('search', finalFilters.search.trim());
        if (finalFilters.minPrice !== undefined) nextParams.set('minPrice', String(finalFilters.minPrice));
        if (finalFilters.maxPrice !== undefined) nextParams.set('maxPrice', String(finalFilters.maxPrice));
        if (finalFilters.minRating !== undefined) nextParams.set('minRating', String(finalFilters.minRating));

        setSearchParams(nextParams, { replace: true });
    };

    const onFilterChange = (next: CourseFilterState) => {
        isApplying.current = true;
        updateUrl({ page: 1, filters: next });
    };

    const onPageChange = (nextPage: number) => {
        updateUrl({ page: nextPage });
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        {filters.search ? `Kết quả cho "${filters.search}"` : 'Tất cả khóa học'}
                    </h1>
                    {data && (
                        <p className="text-lg font-bold text-gray-500">
                            Có <span className="text-gray-900">{data.totalRecords}</span> kết quả phù hợp
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
                    <div className="sticky top-24">
                        <CourseFilters value={filters} onChange={onFilterChange} />
                    </div>

                    <div className="space-y-12">
                        {isError && (
                            <div className="p-8 border border-red-100 bg-red-50/50 rounded-none flex items-center gap-4 text-red-700">
                                <AlertCircle />
                                <div>
                                    <p className="font-black">Lỗi hệ thống</p>
                                    <p className="text-sm font-medium">{String(error)}</p>
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <CourseCardSkeleton key={idx} />
                                ))}
                            </div>
                        ) : data?.data?.length ? (
                            <div className="space-y-16">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {data.data.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>

                                <div className="flex justify-center pt-12 border-t border-gray-100">
                                    <Pagination
                                        pageNumber={data.pageNumber}
                                        totalPages={data.totalPages}
                                        onChange={onPageChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-6">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                    <SearchX className="text-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900">Rất tiếc, không tìm thấy kết quả</h3>
                                    <p className="text-gray-500 font-medium max-w-sm mx-auto">Hãy thử điều chỉnh lại bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                                </div>
                                <Button 
                                    onClick={() => onFilterChange({ search: '' })}
                                    variant="outline"
                                    className="rounded-none border-gray-900 font-black h-12 px-8"
                                >
                                    XÓA TẤT CẢ BỘ LỌC
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
