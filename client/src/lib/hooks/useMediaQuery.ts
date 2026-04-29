import { useSyncExternalStore, useCallback } from "react";

export function useMediaQuery(query: string): boolean {
  // Hàm đăng ký lắng nghe sự kiện
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener("change", callback);
      return () => matchMedia.removeEventListener("change", callback);
    },
    [query]
  );

  // Hàm lấy giá trị hiện tại
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  // Hàm giá trị mặc định khi render trên Server (SSR)
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}