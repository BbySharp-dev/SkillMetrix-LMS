import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, Bell, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const getInitials = (fullName: string): string => {
    if (!fullName) return '';
    
    return fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase();
};

const getDashboardRoute = (role?: string): string => {
    switch (role) {
        case 'Admin': return '/admin';
        case 'Instructor': return '/instructor';
        default: return '/dashboard';
    }
};

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const navLinks = [
        { name: 'Khóa học', path: '/courses' },
        ...(user ? [{ name: 'Học tập của tôi', path: '/dashboard/my-enrollments' }] : []),
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const keyword = searchQuery.trim();
        
        if (keyword) {
            navigate(`/courses?search=${encodeURIComponent(keyword)}`);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('smx_refresh_token');
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        } finally {

            clearAuth();
            setShowProfileMenu(false);
            navigate('/login');
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
                
                <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <BookOpen size={24} className="text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-black tracking-tight hidden sm:block">
                        Skill<span className="text-primary">Metrix</span>
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "text-sm font-bold transition-colors hover:text-primary",
                                location.pathname.startsWith(link.path) ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative group">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Tìm kiếm khóa học bạn muốn học..."
                        className="pl-11 h-11 rounded-2xl group-focus-within:ring-2 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <div className="flex items-center gap-4 shrink-0">
                    {!user ? (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" asChild className="font-bold text-foreground">
                                <Link to="/login">Đăng nhập</Link>
                            </Button>
                            <Button asChild className="font-bold px-6 rounded-xl">
                                <Link to="/register">Đăng ký</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full w-9 h-9">
                                <Bell size={20} />
                            </Button>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2 p-1 rounded-full border border-border hover:border-primary/20 hover:bg-primary/5 transition-all"
                                >
                                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                        {getInitials(user.fullName)}
                                    </div>
                                    <span className={cn("text-gray-400 transition-transform", showProfileMenu && "rotate-180")}>
                                        <ChevronDown size={16} />
                                    </span>
                                </button>

                                {showProfileMenu && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setShowProfileMenu(false)}
                                        />
                                        
                                        <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                                <p className="text-sm font-black text-gray-900">{user.fullName}</p>
                                                <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                                            </div>
                                            
                                            <Link
                                                to={getDashboardRoute(user.role)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <LayoutDashboard size={18} />
                                                Bảng điều khiển
                                            </Link>
                                            
                                            <div className="h-px bg-gray-50 my-1" />
                                            
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut size={18} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}