import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCard from '@/components/CourseCard';
import CourseFilters, { type CourseFilterState } from '@/components/CourseFilters';
import Pagination from '@/components/ui/Pagination';
import CourseCardSkeleton from '@/components/ui/CourseCardSkeleton';
import { useCourses } from '@/hooks/useCourses';

const PAGE_SIZE = 9;

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

    const pageNumber = parsePositiveNumber(searchParams.get('page'), 1);

    const filters: CourseFilterState = {
        search: searchParams.get('search') ?? '',
        minPrice: parseOptionalNumber(searchParams.get('minPrice')),
        maxPrice: parseOptionalNumber(searchParams.get('maxPrice')),
        minRating: parseOptionalNumber(searchParams.get('minRating')),
    };

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

    const { data, isLoading, isError, error, isFetching } = useCourses(queryParams);

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
        
        updateUrl({ page: 1, filters: next });
    };

    const onPageChange = (nextPage: number) => {
        updateUrl({ page: nextPage });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Explore Courses</h1>
                <p className="text-gray-500 mt-1">Find the right course for your learning journey.</p>
            </div>

            <CourseFilters value={filters} onChange={onFilterChange} />

            {isError && (
                <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700">
                    Failed to load courses: {String(error)}
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <CourseCardSkeleton key={idx} />
                    ))}
                </div>
            ) : data?.data?.length ? (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{data.totalRecords.toLocaleString()} courses found</p>
                        {isFetching && <span className="text-xs text-indigo-600">Updating...</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.data.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>

                    <Pagination
                        pageNumber={data.pageNumber}
                        totalPages={data.totalPages}
                        onChange={onPageChange}
                    />
                </>
            ) : (
                <div className="rounded-xl border bg-white p-12 text-center">
                    <p className="text-lg font-medium">No courses found</p>
                    <p className="text-gray-500 mt-1">Try changing keyword or filters.</p>
                </div>
            )}
        </div>
    );
}