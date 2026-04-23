import { createRoot } from "react-dom/client";
import React from "react";
import { RouterProvider } from "react-router-dom";
import { appRouter } from "./router/AppRouter";
import "./style.css";
import { useAuthStore } from "./stores/authStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

useAuthStore.getState().hydrateFromStorage();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={appRouter} />
    </QueryClientProvider>
  </React.StrictMode>,
);
