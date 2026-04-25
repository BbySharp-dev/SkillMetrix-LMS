interface PaginationProps {
    pageNumber: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export default function Pagination({ pageNumber, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => onChange(pageNumber - 1)} disabled={pageNumber <= 1}>Prev</button>
            <span>Page {pageNumber}/{totalPages}</span>
            <button onClick={() => onChange(pageNumber + 1)} disabled={pageNumber >= totalPages}>Next</button>
        </div>
    );
}