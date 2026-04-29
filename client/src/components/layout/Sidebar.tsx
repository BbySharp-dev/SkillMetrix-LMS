import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import {
    LayoutDashboard,
    GraduationCap,
    CreditCard,
    BookOpen,
    ShieldCheck,
    Settings,
    ChevronRight,
} from 'lucide-react';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    end?: boolean;
}

function NavItem({ to, icon, children, end }: NavItemProps) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group",
                isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
        >
            <div className="flex items-center gap-3">
                <span className="transition-transform group-hover:scale-110">{icon}</span>
                <span>{children}</span>
            </div>
            <span className={cn("opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary")}>
                <ChevronRight size={16} />
            </span>
        </NavLink>
    );
}

export default function Sidebar() {
    const user = useAuthStore((s) => s.user);
    const isStudent = user?.role === 'Student';
    const isInstructor = user?.role === 'Instructor';
    const isAdmin = user?.role === 'Admin';

    return (
        <aside className="w-72 border-r border-border bg-background p-6 hidden lg:block overflow-y-auto">
            <div className="space-y-8">
                <div>
                    <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Tổng quan</h3>
                    <nav className="space-y-1.5">
                        <NavItem to="/dashboard" end icon={<LayoutDashboard size={20} />}>
                            Bảng điều khiển
                        </NavItem>
                        <NavItem to="/dashboard/my-enrollments" icon={<GraduationCap size={20} />}>
                            Khóa học của tôi
                        </NavItem>
                        <NavItem to="/dashboard/my-transactions" icon={<CreditCard size={20} />}>
                            Lịch sử thanh toán
                        </NavItem>
                    </nav>
                </div>

                {/* Management Section - Hidden for pure Students */}
                {!isStudent && (
                    <div>
                        <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Quản lý</h3>
                        <nav className="space-y-1.5">
                            {(isInstructor || isAdmin) && (
                                <NavItem to="/dashboard/instructor" icon={<BookOpen size={20} />}>
                                    Giảng viên
                                </NavItem>
                            )}
                            {isAdmin && (
                                <NavItem to="/dashboard/admin" icon={<ShieldCheck size={20} />}>
                                    Quản trị viên
                                </NavItem>
                            )}
                        </nav>
                    </div>
                )}

                <div className="pt-8 border-t border-border">
                    <nav className="space-y-1.5">
                        <NavItem to="/dashboard/settings" icon={<Settings size={20} />}>
                            Cài đặt
                        </NavItem>
                    </nav>
                </div>
            </div>

            {/* Support Box */}
            <div className="mt-12 p-5 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                <h4 className="text-sm font-bold text-foreground mb-1 relative z-10">Cần hỗ trợ?</h4>
                <p className="text-xs text-muted-foreground mb-4 relative z-10 leading-relaxed">Đội ngũ của chúng tôi luôn sẵn sàng giúp đỡ bạn.</p>
                <button className="text-xs font-black text-primary hover:underline relative z-10">Liên hệ ngay</button>
            </div>
        </aside>
    );
}
