import { Outlet } from 'react-router-dom';
import Header from '@/features/auth/components/Header';
import Sidebar from '@/features/auth/components/Sidebar';

export default function DashboardLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 container mx-auto px-4 py-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}