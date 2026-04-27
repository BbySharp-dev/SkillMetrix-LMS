export default function CourseCardSkeleton() {
    return (
        <div className="rounded-xl border bg-white overflow-hidden">
            <div className="h-44 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mt-4" />
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-4" />
            </div>
        </div>
    );
}
