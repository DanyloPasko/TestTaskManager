import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, Priority, Status } from '../types/task';

type StatusFilter = Status | 'all';
type PriorityFilter = Priority | 'all';
type CategoryFilter = Category | 'all';

interface FiltersState {
  filters: {
    status: StatusFilter;
    priority: PriorityFilter;
    category: CategoryFilter;
    searchText: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  sort: {
    by: 'createdAt' | 'deadline' | 'priority' | 'status';
    order: 'asc' | 'desc';
  };
}

const initialState: FiltersState = {
  filters: {
    status: 'all',
    priority: 'all',
    category: 'all',
    searchText: '',
  },
  pagination: {
    page: 1,
    pageSize: 4,
    total: 0,
  },
  sort: {
    by: 'createdAt',
    order: 'desc',
  },
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<StatusFilter>) => {
      state.filters.status = action.payload;
      state.pagination.page = 1;
    },

    setPriorityFilter: (state, action: PayloadAction<PriorityFilter>) => {
      state.filters.priority = action.payload;
      state.pagination.page = 1;
    },

    setCategoryFilter: (state, action: PayloadAction<CategoryFilter>) => {
      state.filters.category = action.payload;
      state.pagination.page = 1;
    },

    setSearchText: (state, action: PayloadAction<string>) => {
      state.filters.searchText = action.payload;
      state.pagination.page = 1;
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },

    setTotal: (state, action: PayloadAction<number>) => {
      state.pagination.total = action.payload;
    },

    setSortBy: (
      state,
      action: PayloadAction<FiltersState['sort']['by']>,
    ) => {
      state.sort.by = action.payload;
      state.pagination.page = 1;
    },

    setSortOrder: (
      state,
      action: PayloadAction<FiltersState['sort']['order']>,
    ) => {
      state.sort.order = action.payload;
    },

    resetFilters: (state) => {
      state.filters = {
        status: 'all',
        priority: 'all',
        category: 'all',
        searchText: '',
      };
      state.pagination.page = 1;
    },
  },
});

export const {
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
} = filterSlice.actions;

export default filterSlice.reducer;
