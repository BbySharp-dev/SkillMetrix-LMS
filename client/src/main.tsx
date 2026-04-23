import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from './routes/AppRouter';
import { useAuthStore } from './stores/authStore';
import './index.css';

useAuthStore.getState().hydrateFromStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={appRouter} />
    </React.StrictMode>
);