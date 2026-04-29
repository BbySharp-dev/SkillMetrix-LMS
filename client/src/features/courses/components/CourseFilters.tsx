import { useState, useEffect, useRef } from 'react';
import { Filter, ChevronRight, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface CourseFilterState {
    search: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
}

interface CourseFiltersProps {
    value: CourseFilterState;
    onChange: (next: CourseFilterState) => void;
    className?: string;
}

export default function CourseFilters({ value, onChange, className }: CourseFiltersProps) {
    const [local, setLocal] = useState(value);
    const isApplying = useRef(false);

    useEffect(() => {
        if (!isApplying.current) {
            setLocal(value);
        }
        isApplying.current = false;
    }, [value]);

    const handlePriceChange = (vals: number[]) => {
        setLocal(s => ({ ...s, minPrice: vals[0], maxPrice: vals[1] }));
    };

    const apply = () => onChange(local);

    const reset = () => {
        const resetVal = {
            search: '',
            minPrice: undefined,
            maxPrice: undefined,
            minRating: undefined,
        };
        setLocal(resetVal);
        onChange(resetVal);
    };

    return (
        <aside className={cn("space-y-10 bg-white p-2", className)}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-900 size-5" />
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Bộ lọc</h2>
                </div>
                <button
                    onClick={reset}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                    Xóa tất cả
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-md font-black text-gray-900 flex items-center justify-between group cursor-pointer">
                    Tìm kiếm
                    <span className="text-gray-400 group-hover:text-gray-900 transition-colors"><ChevronRight className="size-4" /></span>
                </h3>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
                    <Input
                        value={local.search}
                        onChange={(e) => setLocal((s) => ({ ...s, search: e.target.value }))}
                        placeholder="VD: Lập trình React..."
                        className="pl-10 h-11 border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-gray-900 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-md font-black text-gray-900 flex items-center justify-between group cursor-pointer">
                    Xếp hạng
                    <span className="text-gray-400"><ChevronRight className="size-4" /></span>
                </h3>
                <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <label
                            key={rating}
                            className="flex items-center gap-3 group cursor-pointer py-1"
                        >
                            <input
                                type="checkbox"
                                checked={local.minRating === rating}
                                onChange={() => setLocal(s => ({ ...s, minRating: s.minRating === rating ? undefined : rating }))}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex items-center gap-1">
                                <div className="flex items-center text-amber-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="size-3" fill={s <= Math.floor(rating) ? 'currentColor' : 'none'} />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{rating} trở lên</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-md font-black text-gray-900 flex items-center justify-between group cursor-pointer">
                    Giá tiền
                    <span className="text-gray-400"><ChevronRight className="size-4" /></span>
                </h3>
                <div className="px-1">
                    <Slider 
                        max={2000000}
                        step={50000}
                        value={[local.minPrice ?? 0, local.maxPrice ?? 2000000]}
                        onValueChange={handlePriceChange}
                        className="py-4"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <span>{local.minPrice?.toLocaleString() ?? '0'}đ</span>
                        <span>{local.maxPrice?.toLocaleString() ?? '2tr+'}đ</span>
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <Button 
                    onClick={apply} 
                    className="w-full h-12 bg-gray-900 hover:bg-black text-white font-black rounded-none shadow-xl transition-all"
                >
                    ÁP DỤNG BỘ LỌC
                </Button>
            </div>
        </aside>
    );
}
