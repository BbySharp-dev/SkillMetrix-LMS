interface RatingStarsProps {
    value: number;
    max?: number;
}
export default function RatingStars({ value, max = 5 }: RatingStarsProps) {
    const safeValue = Math.max(0, Math.min(max, value));

    return (
        <div className="flex items-center gap-1" aria-label={`rating-${safeValue}`}>
            {Array.from({ length: max }).map((_, idx) => {
                const filled = idx + 1 <= Math.round(safeValue);
                return (
                    <span key={idx} className={filled ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
                );
            })}
            <span className="text-xs text-gray-500 ml-1">{safeValue.toFixed(1)}</span>
        </div>
    );
}