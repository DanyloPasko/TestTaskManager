import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { Task } from '../types/task';
import {
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  setSearchText,
  setPage,
  setPageSize,
  setTotal,
  resetFilters,
} from '../store/filterSlice';

/**
 * Custom hook for managing task filters and pagination
 */
export const useFilters = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.filters.filters);
  const pagination = useAppSelector(state => state.filters.pagination);
  const allTasks = useAppSelector(state => state.tasks.list);

  // Filter tasks based on current filters
  const getFilteredTasks = useCallback((): Task[] => {
    let filtered = [...allTasks];

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Search text filter
    if (filters.searchText && filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allTasks, filters]);

  // Get paginated tasks
  const getPaginatedTasks = useCallback((): Task[] => {
    const filtered = getFilteredTasks();
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filtered.slice(startIndex, endIndex);
  }, [getFilteredTasks, pagination.page, pagination.pageSize]);

  const handleStatusFilterChange = useCallback(
    (status: 'pending' | 'completed' | 'all') => {
      dispatch(setStatusFilter(status));
    },
    [dispatch]
  );

  const handlePriorityFilterChange = useCallback(
    (priority: 'low' | 'medium' | 'high' | 'all') => {
      dispatch(setPriorityFilter(priority));
    },
    [dispatch]
  );

  const handleCategoryFilterChange = useCallback(
    (category: string) => {
      dispatch(setCategoryFilter(category));
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(setSearchText(text));
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      dispatch(setPageSize(pageSize));
    },
    [dispatch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const filteredTasks = getFilteredTasks();

  useEffect(() => {
    if (filteredTasks.length !== pagination.total) {
      dispatch(setTotal(filteredTasks.length));
    }
  }, [filteredTasks.length, dispatch, pagination.total]);

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return {
    filters,
    pagination,
    filteredTasks,
    paginatedTasks: getPaginatedTasks(),
    totalPages,
    onStatusFilterChange: handleStatusFilterChange,
    onPriorityFilterChange: handlePriorityFilterChange,
    onCategoryFilterChange: handleCategoryFilterChange,
    onSearchChange: handleSearchChange,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onResetFilters: handleResetFilters,
  };
};
