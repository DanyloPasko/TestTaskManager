import { useCallback } from 'react';
import { Category } from '../types/category';
import { useNetworkStatus } from './useNetworkStatus';
import { useAppDispatch, useAppSelector } from './redux';
import {
  addCategoryLocal,
  updateCategoryLocal,
  deleteCategoryLocal,
} from '../store/categorySlice';

/**
 * Custom hook for managing categories with offline support
 */
export const useCategories = () => {
  const { isOnline } = useNetworkStatus();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(state => state.categories.list);

  const handleAddCategory = useCallback(
    async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        console.log('📝 useCategories: Adding category, isOnline:', isOnline);
        dispatch(addCategoryLocal(categoryData));
        console.log('✅ useCategories: Category added locally');
      } catch (error) {
        console.error('❌ useCategories: Failed to add category:', error);
        throw error;
      }
    },
    [isOnline, dispatch]
  );

  const handleUpdateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      try {
        console.log('📝 useCategories: Updating category', id, 'isOnline:', isOnline);
        dispatch(updateCategoryLocal({ id, updates }));
        console.log('✅ useCategories: Category updated locally');
      } catch (error) {
        console.error('❌ useCategories: Failed to update category:', error);
        throw error;
      }
    },
    [isOnline, dispatch]
  );

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      try {
        console.log('📝 useCategories: Deleting category', id, 'isOnline:', isOnline);
        dispatch(deleteCategoryLocal(id));
        console.log('✅ useCategories: Category deleted locally');
      } catch (error) {
        console.error('❌ useCategories: Failed to delete category:', error);
        throw error;
      }
    },
    [isOnline, dispatch]
  );

  return {
    categories,
    isOnline,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
  };
};
