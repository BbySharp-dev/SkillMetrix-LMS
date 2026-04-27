import { useEffect, useState } from 'react';

export interface CourseFilterState {
    search: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
}

interface CourseFiltersProps {
    value: CourseFilterState;
    onChange: (next: CourseFilterState) => void;
}

export default function CourseFilters({ value, onChange }: CourseFiltersProps) {
    const [local, setLocal] = useState<CourseFilterState>(value);

    useEffect(() => {
        setLocal(value);
    }, [value]);

    const apply = () => onChange(local);

    const reset = () =>
        onChange({
            search: '',
            minPrice: undefined,
            maxPrice: undefined,
            minRating: undefined,
        });

    return (
        <section className="bg-white border rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3 shadow-sm">
            <input
                value={local.search}
                onChange={(e) => setLocal((s) => ({ ...s, search: e.target.value }))}
                placeholder="Tìm kiếm khóa học..."
                className="border rounded-lg px-3 py-2 md:col-span-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <input
                type="number"
                value={local.minPrice ?? ''}
                onChange={(e) => setLocal((s) => ({ ...s, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Giá thấp nhất"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <input
                type="number"
                value={local.maxPrice ?? ''}
                onChange={(e) => setLocal((s) => ({ ...s, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Giá cao nhất"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <select
                value={local.minRating ?? ''}
                onChange={(e) => setLocal((s) => ({ ...s, minRating: e.target.value ? Number(e.target.value) : undefined }))}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
                <option value="">Tất cả đánh giá</option>
                <option value="4">4+ sao</option>
                <option value="3">3+ sao</option>
                <option value="2">2+ sao</option>
            </select>

            <div className="md:col-span-5 flex items-center gap-2 justify-end pt-2 border-t mt-2">
                <button onClick={reset} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">Đặt lại</button>
                <button onClick={apply} className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Áp dụng</button>
            </div>
        </section>
    );
}
