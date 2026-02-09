import { useState } from 'react';

export interface PaginationState {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  from: number;
  to: number;
}

export function usePagination(initialPerPage = 20) {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: initialPerPage,
    from: 0,
    to: 0,
  });

  const updatePagination = (data: Partial<PaginationState>) => {
    setPagination(prev => ({ ...prev, ...data }));
  };

  const resetPagination = () => {
    setPagination({
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: initialPerPage,
      from: 0,
      to: 0,
    });
  };

  return {
    pagination,
    updatePagination,
    resetPagination,
  };
}