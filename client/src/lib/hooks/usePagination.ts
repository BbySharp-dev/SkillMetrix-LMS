import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function usePagination(defaultPage = 1, defaultPageSize = 12) {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawPage = Number(searchParams.get("page"));
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : defaultPage;

  const rawPageSize = Number(searchParams.get("pageSize"));
  const pageSize = !isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : defaultPageSize;

  const setPage = useCallback(
    (next: number) => {
      setSearchParams(
        (prev) => {
          if (next <= 1) {
            prev.delete("page");
          } else {
            prev.set("page", String(next));
          }
          return prev;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setPageSize = useCallback(
    (size: number) => {
      setSearchParams(
        (prev) => {
          prev.set("pageSize", String(size));
          prev.delete("page");
          return prev;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetPage = useCallback(() => {
    setSearchParams(
      (prev) => {
        prev.delete("page");
        return prev;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return { page, pageSize, setPage, setPageSize, resetPage } as const;
}
