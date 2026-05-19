import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    GraduationCap,
    CreditCard,
    BookOpen,
    ShieldCheck,
    Settings,
    ChevronRight,
    Library,
    PlusCircle,
    type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

type NavItemConfig = {
    label: string;
    to: string;
    icon: LucideIcon;
    end?: boolean;
};

type NavSectionConfig = {
    title: string;
    items: NavItemConfig[];
};

const USER_NAV_SECTIONS: NavSectionConfig[] = [
    {
        title: 'Tổng quan',
        items: [
            { label: 'Bảng điều khiển', to: '/dashboard', icon: LayoutDashboard, end: true },
            { label: 'Khóa học của tôi', to: '/dashboard/my-enrollments', icon: GraduationCap },
            { label: 'Lịch sử thanh toán', to: '/dashboard/my-transactions', icon: CreditCard },
        ],
    },
];

const ADMIN_NAV_SECTIONS: NavSectionConfig[] = [
    {
        title: 'Quản trị',
        items: [
            { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, end: true },
            { label: 'Người dùng', to: '/admin/users', icon: ShieldCheck, end: true },
            { label: 'Quản lý khóa học', to: '/admin/courses', icon: Library, end: true },
            { label: 'Duyệt khóa học', to: '/admin/approvals', icon: BookOpen, end: true },
        ],
    },
    {
        title: 'Quản lý khóa học',
        items: [
            { label: 'Khóa học của tôi', to: '/admin/my-courses', icon: BookOpen, end: true },
            { label: 'Tạo khóa học', to: '/admin/courses/new', icon: PlusCircle, end: true },
        ],
    },
    {
        title: 'Cá nhân',
        items: [
            { label: 'Khóa học đã ghi danh', to: '/admin/my-enrollments', icon: GraduationCap },
            { label: 'Lịch sử thanh toán', to: '/admin/my-transactions', icon: CreditCard },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { label: 'Cài đặt', to: '/admin/settings', icon: Settings },
        ],
    },
];

const INSTRUCTOR_NAV_SECTIONS: NavSectionConfig[] = [
    {
        title: 'Quản lý',
        items: [
            { label: 'Tổng quan', to: '/instructor', icon: LayoutDashboard, end: true },
            { label: 'Khóa học', to: '/instructor/courses', icon: BookOpen },
            { label: 'Tạo khóa học', to: '/instructor/courses/new', icon: PlusCircle },
        ],
    },
    {
        title: 'Cá nhân',
        items: [
            { label: 'Khóa học đã ghi danh', to: '/instructor/my-enrollments', icon: GraduationCap },
            { label: 'Lịch sử thanh toán', to: '/instructor/my-transactions', icon: CreditCard },
        ],
    },
];

const MODERATOR_NAV_SECTIONS: NavSectionConfig[] = [
    {
        title: 'Kiểm duyệt',
        items: [
            { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, end: true },
            { label: 'Duyệt khóa học', to: '/admin/approvals', icon: BookOpen, end: true },
            { label: 'Quản lý khóa học', to: '/admin/courses', icon: Library, end: true },
        ],
    },
    {
        title: 'Cá nhân',
        items: [
            { label: 'Khóa học đã ghi danh', to: '/admin/my-enrollments', icon: GraduationCap },
            { label: 'Lịch sử thanh toán', to: '/admin/my-transactions', icon: CreditCard },
        ],
    },
];

interface NavItemProps {
    to: string;
    icon: LucideIcon;
    children: React.ReactNode;
    end?: boolean;
}

function NavItem({ to, icon: Icon, children, end }: NavItemProps) {
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
                <span className="transition-transform group-hover:scale-110">
                    <Icon size={20} />
                </span>
                <span>{children}</span>
            </div>
            

            <span className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 inherit-color">
                <ChevronRight size={16} />
            </span>
        </NavLink>
    );
}

export default function Sidebar() {
    const userRole = useAuthStore((s) => s.user?.role);

    const isAdmin = userRole === 'Admin';
    const isModerator = userRole === 'Moderator';
    const isInstructor = userRole === 'Instructor';

    const activeNavSections = isAdmin
        ? ADMIN_NAV_SECTIONS
        : isModerator
            ? MODERATOR_NAV_SECTIONS
            : isInstructor
                ? INSTRUCTOR_NAV_SECTIONS
                : USER_NAV_SECTIONS;

    return (
        <aside className="w-72 border-r border-border bg-background p-6 hidden lg:block overflow-y-auto">
            <div className="space-y-8">
                {activeNavSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                            {section.title}
                        </h3>
                        <nav className="space-y-1.5">
                            {section.items.map((item) => (
                                <NavItem 
                                    key={item.to} 
                                    to={item.to} 
                                    icon={item.icon} 
                                    end={item.end}
                                >
                                    {item.label}
                                </NavItem>
                            ))}
                        </nav>
                    </div>
                ))}
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