import { useCallback } from 'react';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskStatusMutation,
} from '../store/api/tasksApi';
import { Task } from '../types/task';

/**
 * Custom hook for managing tasks with RTK Query
 * Provides unified interface for task operations
 */
export const useTasks = () => {
  const { data: tasks = [], isLoading, isError, refetch } = useGetTasksQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleTaskStatusMutation();

  const handleCreateTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        await createTask(taskData).unwrap();
      } catch (error) {
        console.error('Failed to create task:', error);
        throw error;
      }
    },
    [createTask]
  );

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        await updateTask({ id, updates }).unwrap();
      } catch (error) {
        console.error('Failed to update task:', error);
        throw error;
      }
    },
    [updateTask]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        await deleteTask(id).unwrap();
      } catch (error) {
        console.error('Failed to delete task:', error);
        throw error;
      }
    },
    [deleteTask]
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        await toggleStatus(id).unwrap();
      } catch (error) {
        console.error('Failed to toggle task status:', error);
        throw error;
      }
    },
    [toggleStatus]
  );

  return {
    tasks,
    isLoading,
    isError,
    refetch,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    toggleStatus: handleToggleStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
  };
};
