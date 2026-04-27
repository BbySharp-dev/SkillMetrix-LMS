

interface PaginationProps {
    pageNumber: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export default function Pagination({ pageNumber, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-1">
            <button
                onClick={() => onChange(pageNumber - 1)}
                disabled={pageNumber <= 1}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
                ‹
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onChange(page)}
                    className={`px-3 py-1.5 border rounded text-sm transition-colors ${
                        page === pageNumber
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'hover:bg-gray-50'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onChange(pageNumber + 1)}
                disabled={pageNumber >= totalPages}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
                ›
            </button>
        </div>
    );
}
