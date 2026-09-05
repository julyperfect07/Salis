"use client";

import { useEffect } from "react";

export function usePaginationCorrection(
  page: number,
  totalPages: number | undefined,
  setPage: React.Dispatch<React.SetStateAction<number>>,
) {
  useEffect(() => {
    const lastPage = Math.max(totalPages ?? 1, 1);
    if (totalPages !== undefined && page > lastPage) {
      setPage(lastPage);
    }
  }, [page, setPage, totalPages]);
}
