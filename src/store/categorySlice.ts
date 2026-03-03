import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../types/category';
import { v4 as uuid } from 'uuid';

interface CategoryState {
  list: Category[];
  pendingSync: string[];
  lastSyncTime: string | null;
}

const initialState: CategoryState = {
  list: [],
  pendingSync: [],
  lastSyncTime: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategoryLocal: (state, action: PayloadAction<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => {
      if (!state.list) {
        state.list = [];
      }
      if (!state.pendingSync) {
        state.pendingSync = [];
      }
      const now = new Date().toISOString();
      const newCategory: Category = {
        ...action.payload,
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      };
      state.list.push(newCategory);
      state.pendingSync.push(newCategory.id);
    },

    updateCategoryLocal: (state, action: PayloadAction<{ id: string; updates: Partial<Category> }>) => {
      if (!state.list) {state.list = [];}
      if (!state.pendingSync) {state.pendingSync = [];}
      const category = state.list.find((c) => c.id === action.payload.id);
      if (category) {
        Object.assign(category, action.payload.updates, {
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
        });
        if (!state.pendingSync.includes(category.id)) {
          state.pendingSync.push(category.id);
        }
      }
    },

    deleteCategoryLocal: (state, action: PayloadAction<string>) => {
      if (!state.list) {state.list = [];}
      if (!state.pendingSync) {state.pendingSync = [];}
      state.list = state.list.filter((c) => c.id !== action.payload);
      state.pendingSync = state.pendingSync.filter((id) => id !== action.payload);
    },

    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.list = action.payload;
      state.lastSyncTime = new Date().toISOString();
    },

    markAsSynced: (state, action: PayloadAction<string>) => {
      const category = state.list.find((c) => c.id === action.payload);
      if (category) {
        category.syncStatus = 'synced';
      }
      state.pendingSync = state.pendingSync.filter((id) => id !== action.payload);
    },

    markSyncError: (state, action: PayloadAction<string>) => {
      const category = state.list.find((c) => c.id === action.payload);
      if (category) {
        category.syncStatus = 'error';
      }
    },
  },
});

export const {
  addCategoryLocal,
  updateCategoryLocal,
  deleteCategoryLocal,
  setCategories,
  markAsSynced,
  markSyncError,
} = categorySlice.actions;

export default categorySlice.reducer;
