import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskFilter, PaginationState } from '../types/category';

interface FilterState {
  filters: TaskFilter;
  pagination: PaginationState;
}

const initialState: FilterState = {
  filters: {
    status: 'all',
    priority: 'all',
    category: 'all',
    searchText: '',
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<'pending' | 'completed' | 'all'>) => {
      state.filters.status = action.payload;
      state.pagination.page = 1; // Reset to first page
    },

    setPriorityFilter: (state, action: PayloadAction<'low' | 'medium' | 'high' | 'all'>) => {
      state.filters.priority = action.payload;
      state.pagination.page = 1;
    },

    setCategoryFilter: (state, action: PayloadAction<string>) => {
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
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
