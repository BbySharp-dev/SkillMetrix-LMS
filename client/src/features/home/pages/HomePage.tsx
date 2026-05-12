import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Globe, Users } from 'lucide-react';
import { useCourses } from '@/features/courses/hooks/useCourses';
import CourseCard from '@/features/courses/components/CourseCard';
import { Skeleton } from '@/components/ui';
import { Button } from '@/components/ui';

const CourseCardSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    </div>
);

export default function HomePage() {
    const { data: featuredData, isLoading } = useCourses({ pageSize: 4 });

    return (
        <div className="animate-in fade-in duration-1000">
            {/* Hero Section */}
            <section className="relative h-150 flex items-center overflow-hidden bg-[#1c1d1f]">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                        alt="Hero"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/80 to-transparent" />
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                                Khởi đầu tương lai <br />
                                <span className="text-indigo-400">tại SkillMetrix</span>
                            </h1>
                            <p className="text-xl text-gray-300 font-medium leading-relaxed">
                                Tham gia cùng hơn 100,000 học viên và bắt đầu hành trình chinh phục kiến thức mới ngay hôm nay.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="h-14 px-10 rounded-none font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20" asChild>
                                <Link to="/courses">KHÁM PHÁ NGAY</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 rounded-none font-black border-white text-white hover:bg-white hover:text-black transition-all">
                                TRỞ THÀNH GIẢNG VIÊN
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Khóa học mới nhất</h2>
                        <p className="text-lg text-gray-500 max-w-2xl font-medium">Khám phá các khóa học vừa được cập nhật trên hệ thống.</p>
                    </div>
                    <Button variant="outline" asChild className="rounded-none h-12 px-8 font-black border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
                        <Link to="/courses" className="flex items-center gap-2">Xem tất cả <ArrowRight className="size-4" /></Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
                    ) : (
                        featuredData?.data?.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    )}
                </div>
            </section>

            {/* Platform Features - Static Branding elements */}
            <section className="bg-slate-50 py-24 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4 text-center p-8 bg-white shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mx-auto">
                                <ShieldCheck className="size-5" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Học trọn đời</h3>
                            <p className="text-gray-500 font-medium">Truy cập khóa học của bạn bất cứ lúc nào, bất cứ nơi đâu trên mọi thiết bị.</p>
                        </div>
                        <div className="space-y-4 text-center p-8 bg-white shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mx-auto">
                                <Globe className="size-5" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Cộng đồng lớn</h3>
                            <p className="text-gray-500 font-medium">Tham gia cộng đồng học viên đông đảo, cùng nhau thảo luận và tiến bộ.</p>
                        </div>
                        <div className="space-y-4 text-center p-8 bg-white shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mx-auto">
                                <Users className="size-5" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Giảng viên uy tín</h3>
                            <p className="text-gray-500 font-medium">Học hỏi từ những chuyên gia hàng đầu trong lĩnh vực của họ.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
