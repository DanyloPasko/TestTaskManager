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
    skip: false,
  });

  const [createTaskRemote, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTaskRemote, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTaskRemote, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [toggleStatusRemote, { isLoading: isToggling }] = useToggleTaskStatusMutation();

  // Use local tasks when offline, remote tasks when online
  const tasks = isOnline ? remoteTasks : localTasks;

  console.log('📚 useTasks: isOnline:', isOnline, 'tasks count:', tasks.length, 'isLoading:', isLoading);

  const handleCreateTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        console.log('📝 useTasks: Creating task, isOnline:', isOnline);
        if (isOnline) {
          await createTaskRemote(taskData).unwrap();
          console.log('✅ useTasks: Task created in Firebase');
        } else {
          // Create locally when offline
          dispatch(addTaskLocal(taskData));
          console.log('✅ useTasks: Task created locally (offline)');
        }
      } catch (error) {
        console.error('❌ useTasks: Failed to create task:', error);
        // Fallback to local creation on error
        dispatch(addTaskLocal(taskData));
      }
    },
    [isOnline, createTaskRemote, dispatch]
  );

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        console.log('📝 useTasks: Updating task', id, 'isOnline:', isOnline);
        if (isOnline) {
          await updateTaskRemote({ id, updates }).unwrap();
          console.log('✅ useTasks: Task updated in Firebase');
        } else {
          // Update locally when offline
          dispatch(updateTaskLocal({ id, updates }));
          console.log('✅ useTasks: Task updated locally (offline)');
        }
      } catch (error) {
        console.error('❌ useTasks: Failed to update task:', error);
        // Fallback to local update on error
        dispatch(updateTaskLocal({ id, updates }));
      }
    },
    [isOnline, updateTaskRemote, dispatch]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        console.log('📝 useTasks: Deleting task', id, 'isOnline:', isOnline);
        if (isOnline) {
          await deleteTaskRemote(id).unwrap();
          console.log('✅ useTasks: Task deleted from Firebase');
        } else {
          // Delete locally when offline
          dispatch(deleteTaskLocal(id));
          console.log('✅ useTasks: Task deleted locally (offline)');
        }
      } catch (error) {
        console.error('❌ useTasks: Failed to delete task:', error);
        // Fallback to local delete on error
        dispatch(deleteTaskLocal(id));
      }
    },
    [isOnline, deleteTaskRemote, dispatch]
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        console.log('📝 useTasks: Toggling status for task', id, 'isOnline:', isOnline);
        if (isOnline) {
          await toggleStatusRemote(id).unwrap();
          console.log('✅ useTasks: Task status toggled in Firebase');
        } else {
          // Toggle locally when offline
          dispatch(toggleStatusLocal(id));
          console.log('✅ useTasks: Task status toggled locally (offline)');
        }
      } catch (error) {
        console.error('❌ useTasks: Failed to toggle task status:', error);
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
