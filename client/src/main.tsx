import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { appRouter } from '@/routes/AppRouter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryProvider>
            <RouterProvider router={appRouter} />
            <Toaster
                position="bottom-left"
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