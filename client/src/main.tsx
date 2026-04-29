import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { appRouter } from '@/routes/AppRouter';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import './index.css';

// Hydrate từ localStorage sau khi React mount — tránh hydration mismatch
function AuthHydrator() {
    const hydrate = useAuthStore((s) => s.hydrateFromStorage);
    useEffect(() => { hydrate(); }, [hydrate]);
    return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthHydrator />
        <QueryProvider>
            <RouterProvider router={appRouter} />
            <Toaster
                position="top-right"
                richColors
                expand={false}
                toastOptions={{
                    className: 'rounded-xl border-none shadow-xl font-bold text-sm py-4 px-5',
                }}
                closeButton
            />
        </QueryProvider>
    </React.StrictMode>
);