import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { Category, Priority, Status, Task } from '../types/task';
import {
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  setSearchText,
  setPage,
  setPageSize,
  setTotal,
  setSortBy,
  setSortOrder,
  resetFilters,
} from '../store/filterSlice';

const DEFAULT_SORT: {by: 'createdAt' | 'deadline' | 'priority' | 'status'; order: 'asc' | 'desc'} = {
  by: 'createdAt',
  order: 'desc',
};

export const useFilters = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.filters.filters);
  const pagination = useAppSelector(state => state.filters.pagination);
  const sort = useAppSelector(state => state.filters.sort ?? DEFAULT_SORT);
  const allTasks = useAppSelector(state => state.tasks.list);

  const getFilteredTasks = useCallback((): Task[] => {
    let filtered = [...allTasks];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    if (filters.searchText && filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    // sorting
    const compare = (a: Task, b: Task): number => {
      switch (sort.by) {
        case 'priority': {
          const order: Record<Priority, number> = {
            [Priority.High]: 3,
            [Priority.Medium]: 2,
            [Priority.Low]: 1,
          };
          return order[a.priority] - order[b.priority];
        }
        case 'status': {
          const order: Record<Status, number> = {
            [Status.Pending]: 1,
            [Status.Completed]: 2,
          };
          return order[a.status] - order[b.status];
        }
        case 'deadline': {
          const aDeadline = a.deadline ? Date.parse(a.deadline) : Infinity;
          const bDeadline = b.deadline ? Date.parse(b.deadline) : Infinity;
          return aDeadline - bDeadline;
        }
        case 'createdAt':
        default: {
          const aCreated = Date.parse(a.createdAt);
          const bCreated = Date.parse(b.createdAt);
          return aCreated - bCreated;
        }
      }
    };

    filtered.sort((a, b) =>
      sort.order === 'asc' ? compare(a, b) : compare(b, a),
    );

    return filtered;
  }, [allTasks, filters, sort]);

  const getPaginatedTasks = useCallback((): Task[] => {
    const filtered = getFilteredTasks();
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filtered.slice(startIndex, endIndex);
  }, [getFilteredTasks, pagination.page, pagination.pageSize]);

  const handleStatusFilterChange = useCallback(
    (status: Status | 'all') => {
      dispatch(setStatusFilter(status));
    },
    [dispatch],
  );

  const handlePriorityFilterChange = useCallback(
    (priority: Priority | 'all') => {
      dispatch(setPriorityFilter(priority));
    },
    [dispatch],
  );

  const handleCategoryFilterChange = useCallback(
    (category: Category | 'all') => {
      dispatch(setCategoryFilter(category));
    },
    [dispatch],
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

  const handleSortByChange = useCallback(
    (by: 'createdAt' | 'deadline' | 'priority' | 'status') => {
      dispatch(setSortBy(by));
    },
    [dispatch],
  );

  const handleSortOrderChange = useCallback(
    (order: 'asc' | 'desc') => {
      dispatch(setSortOrder(order));
    },
    [dispatch],
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
    sort,
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
    onSortByChange: handleSortByChange,
    onSortOrderChange: handleSortOrderChange,
    onResetFilters: handleResetFilters,
  };
};
