import { Star } from 'lucide-react';

interface RatingStarsProps {
    value: number;
    max?: number;
    size?: number;
    showValue?: boolean;
}

export function RatingStars({ value, max = 5, size = 14, showValue = true }: RatingStarsProps) {
    const safeValue = Math.max(0, Math.min(max, value));

    return (
        <div className="flex items-center gap-1" aria-label={`rating-${safeValue.toFixed(1)}`}>
            <div className="flex items-center">
                {Array.from({ length: max }).map((_, idx) => {
                    const filled = idx + 1 <= Math.round(safeValue);
                    return (
                        <Star
                            key={idx}
                            size={size}
                            className={filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                        />
                    );
                })}
            </div>
            {showValue && (
                <span className="text-xs font-bold text-gray-500 ml-1">{safeValue.toFixed(1)}</span>
            )}
        </div>
    );
}