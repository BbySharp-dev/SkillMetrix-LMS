import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Home, 
    Search, 
    Bell, 
    ChevronDown, 
    LayoutDashboard, 
    Settings, 
    LogOut 
} from 'lucide-react'; 

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { authApi } from '@/features/auth/api/authApi';
import { Button } from '@/components/ui';
import { cn, getAvatarInitials, getDashboardRoute } from '@/lib/utils';


const getLastName = (fullName?: string): string => {
    if (!fullName) return '';
    return fullName.trim().split(' ').pop() || '';
};

export default function DashboardHeader() {
    const navigate = useNavigate();
    
    const user = useAuthStore((s) => s.user);
    const refreshToken = useAuthStore((s) => s.refreshToken);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        try {
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        } finally {
            clearAuth();
            setShowProfileMenu(false);
            navigate('/login');
        }
    };

    if (!user) return null;

    return (
        <header className="h-16 border-b border-gray-100 bg-white sticky top-0 z-40 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 group mr-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                        <span className="text-white text-xs font-black">SX</span>
                    </div>
                </Link>
                
                <div className="h-4 w-px bg-gray-200 hidden md:block" />
                
                <nav className="hidden md:flex items-center gap-1 ml-2">
                    <Button variant="ghost" size="sm" asChild className="text-gray-500 font-bold hover:text-indigo-600 rounded-lg">
                        <Link to="/">
                            <Home className="w-4 h-4 mr-2" />
                            Trang chủ
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-gray-500 font-bold hover:text-indigo-600 rounded-lg">
                        <Link to="/courses">
                            <Search className="w-4 h-4 mr-2" />
                            Khám phá
                        </Link>
                    </Button>
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600 rounded-full w-9 h-9">
                    <Bell className="w-5 h-5" />
                </Button>

                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 p-1 pr-2 rounded-full border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
                    >
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs shadow-inner">
                            {getAvatarInitials(user.fullName)}
                        </div>
                        <span className="text-sm font-bold text-gray-700 hidden sm:block">
                            {getLastName(user.fullName)}
                        </span>
                        <span className={cn("transition-transform", showProfileMenu && "rotate-180")}>
                            <ChevronDown className="w-4 h-4" />
                        </span>
                    </button>

                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                                <Link
                                    to={getDashboardRoute(user.role)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Bảng điều khiển
                                </Link>
                                
                                {user.role === 'Admin' && (
                                    <Link 
                                        to="/admin/settings" 
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors" 
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Cài đặt
                                    </Link>
                                )}
                                
                                <div className="h-px bg-gray-50 my-1" />
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}