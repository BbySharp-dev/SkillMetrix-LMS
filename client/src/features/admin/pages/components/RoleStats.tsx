import { Briefcase, GraduationCap, Crown, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui';
import type { UserRole } from '../../api/adminApi';

const roleConfig: Record<UserRole, { label: string; icon: typeof GraduationCap; color: string; bg: string }> = {
    Admin: { label: 'Quản trị viên', icon: Crown, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    Moderator: { label: 'Kiểm duyệt viên', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
    Instructor: { label: 'Giảng viên', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    Student: { label: 'Học viên', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
};

const allRoles: UserRole[] = ['Student', 'Instructor', 'Moderator', 'Admin'];

interface RoleStatsProps {
    roleCounts: Record<string, number>;
    roleFilter: string;
    onRoleClick: (role: string) => void;
}

export function RoleStats({ roleCounts, roleFilter, onRoleClick }: RoleStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allRoles.map(role => {
                const cfg = roleConfig[role];
                const Icon = cfg.icon;
                return (
                    <Card
                        key={role}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                            roleFilter === role 
                                ? 'ring-2 ring-indigo-400 border-indigo-300' 
                                : 'border-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => onRoleClick(roleFilter === role ? 'All' : role)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cfg.bg}`}>
                                <Icon className={`size-4 ${cfg.color}`} />
                            </div>
                            <div>
                                <div className={`text-xl font-black ${cfg.color}`}>{roleCounts[role] ?? 0}</div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cfg.label}</div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

export { roleConfig, allRoles };
