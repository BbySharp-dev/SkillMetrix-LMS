import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { appRouter } from '@/routes/AppRouter';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import './index.css';
import 'preline';

useAuthStore.getState().hydrateFromStorage();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
        <RouterProvider router={appRouter} />
        </QueryClientProvider>
    </React.StrictMode>
);