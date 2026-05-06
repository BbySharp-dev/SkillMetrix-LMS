import { NavLink, Link, Outlet } from 'react-router-dom';
import { 
    LayoutDashboard, 
    BookOpen, 
    Users, 
    BarChart3, 
    Settings,
    ChevronRight,
    Bell,
    Search
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { cn, getAvatarInitials } from '@/lib/utils';

const SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/instructor', end: true },
    { icon: BookOpen, label: 'Khóa học của tôi', path: '/instructor/courses' },
    { icon: Users, label: 'Học viên', path: '/instructor/students' },
    { icon: BarChart3, label: 'Báo cáo doanh thu', path: '/instructor/revenue' },
    { icon: Settings, label: 'Cài đặt', path: '/instructor/settings' },
];

export default function InstructorLayout() {
    const user = useAuthStore((s) => s.user);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-gray-100">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-xl">S</span>
                        </div>
                        <span className="font-black text-xl tracking-tight text-gray-900">SkillMetrix</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {SIDEBAR_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-sm",
                                isActive 
                                    ? "bg-indigo-50 text-indigo-600" 
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn(
                                        "size-5", 
                                        isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                                    )} />
                                    <span>{item.label}</span>
                                    {isActive && <ChevronRight className="size-4 ml-auto" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                            {getAvatarInitials(user?.fullName || '')}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.fullName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giảng viên</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl w-96 border border-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <Search className="size-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm khóa học, học viên..." 
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
                            <Bell className="size-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <Link 
                            to="/" 
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            Xem trang chủ
                        </Link>
                    </div>
                </header>

                {/* Page Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}