import { useCallback } from 'react';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskStatusMutation,
} from '../store/api/tasksApi';
import { Task } from '../types/task';
import { useNetworkStatus } from './useNetworkStatus';
import { useAppDispatch, useAppSelector } from './redux';
import {
  addTaskLocal,
  updateTaskLocal,
  deleteTaskLocal,
  toggleStatusLocal,
} from '../store/taskSlice';

/**
 * Custom hook for managing tasks with RTK Query and offline support
 * Provides unified interface for task operations
 */
export const useTasks = () => {
  const { isOnline } = useNetworkStatus();
  const dispatch = useAppDispatch();
  const localTasks = useAppSelector(state => state.tasks.list);

  const { data: remoteTasks = [], isLoading, isError, refetch } = useGetTasksQuery(undefined, {
    skip: !isOnline, // Skip query when offline
  });

  const [createTaskRemote, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTaskRemote, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTaskRemote, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [toggleStatusRemote, { isLoading: isToggling }] = useToggleTaskStatusMutation();

  // Use local tasks when offline, remote tasks when online
  const tasks = isOnline ? remoteTasks : localTasks;

  const handleCreateTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        if (isOnline) {
          await createTaskRemote(taskData).unwrap();
        } else {
          // Create locally when offline
          dispatch(addTaskLocal(taskData));
        }
      } catch (error) {
        console.error('Failed to create task:', error);
        // Fallback to local creation on error
        dispatch(addTaskLocal(taskData));
      }
    },
    [isOnline, createTaskRemote, dispatch]
  );

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        if (isOnline) {
          await updateTaskRemote({ id, updates }).unwrap();
        } else {
          // Update locally when offline
          dispatch(updateTaskLocal({ id, updates }));
        }
      } catch (error) {
        console.error('Failed to update task:', error);
        // Fallback to local update on error
        dispatch(updateTaskLocal({ id, updates }));
      }
    },
    [isOnline, updateTaskRemote, dispatch]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        if (isOnline) {
          await deleteTaskRemote(id).unwrap();
        } else {
          // Delete locally when offline
          dispatch(deleteTaskLocal(id));
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        // Fallback to local delete on error
        dispatch(deleteTaskLocal(id));
      }
    },
    [isOnline, deleteTaskRemote, dispatch]
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        if (isOnline) {
          await toggleStatusRemote(id).unwrap();
        } else {
          // Toggle locally when offline
          dispatch(toggleStatusLocal(id));
        }
      } catch (error) {
        console.error('Failed to toggle task status:', error);
        // Fallback to local toggle on error
        dispatch(toggleStatusLocal(id));
      }
    },
    [isOnline, toggleStatusRemote, dispatch]
  );

  return {
    tasks,
    isLoading: isOnline ? isLoading : false,
    isError: isOnline ? isError : false,
    isOnline,
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
