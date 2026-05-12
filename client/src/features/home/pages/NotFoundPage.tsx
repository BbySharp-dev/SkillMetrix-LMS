import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-700">
            <div className="relative mb-8">
                <h1 className="text-[180px] font-black text-indigo-50/50 leading-none select-none">404</h1>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200 rotate-12 mb-4">
                        <Search className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Trang không tồn tại</h2>
                </div>
            </div>
            
            <p className="text-gray-500 max-w-md text-lg mb-10 leading-relaxed font-medium">
                Có vẻ như đường dẫn bạn đang truy cập không tồn tại hoặc đã bị gỡ bỏ. Hãy kiểm tra lại địa chỉ hoặc quay về trang chủ.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-2xl px-8 font-black shadow-indigo-100 shadow-xl">
                    <Link to="/" className="flex items-center gap-2">
                        <Home className="size-5" />
                        VỀ TRANG CHỦ
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl px-8 font-black border-gray-100 hover:bg-gray-50">
                    <Link to="/courses" className="flex items-center gap-2">
                        <Search className="size-5" />
                        KHÁM PHÁ KHÓA HỌC
                    </Link>
                </Button>
            </div>

            <button
                onClick={() => window.history.back()}
                className="mt-12 flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors font-bold text-sm"
            >
                <ArrowLeft className="size-4" />
                Quay lại trang trước
            </button>
        </div>
    );
}
