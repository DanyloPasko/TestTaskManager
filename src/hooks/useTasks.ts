import { useCallback, useEffect } from 'react';
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
  setTasks,
} from '../store/taskSlice';

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

  const tasks = localTasks;

  useEffect(() => {
    if (isOnline && remoteTasks && remoteTasks.length > 0) {
      const mergedTasks = [...remoteTasks];
      dispatch(setTasks(mergedTasks));
    }
  }, [isOnline, remoteTasks.length, dispatch, remoteTasks]);

  const handleCreateTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        dispatch(addTaskLocal(taskData));
        if (isOnline) {
          try {
            await createTaskRemote(taskData).unwrap();
          } catch (error) {
            console.error('useTasks: Failed to sync to Firebase:', error);
          }
        }
      } catch (error) {
        console.error('useTasks: Failed to create task:', error);
      }
    },
    [isOnline, createTaskRemote, dispatch]
  );

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        dispatch(updateTaskLocal({ id, updates }));
        if (isOnline) {
          try {
            await updateTaskRemote({ id, updates }).unwrap();
          } catch (error) {
            console.error('useTasks: Failed to sync update to Firebase:', error);
          }
        }
      } catch (error) {
        console.error('useTasks: Failed to update task:', error);
      }
    },
    [isOnline, updateTaskRemote, dispatch]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        dispatch(deleteTaskLocal(id));
        if (isOnline) {
          try {
            await deleteTaskRemote(id).unwrap();
            console.log('useTasks: Task deleted from Firebase');
          } catch (error) {
            console.error('useTasks: Failed to delete from Firebase:', error);
          }
        }
      } catch (error) {
        console.error('useTasks: Failed to delete task:', error);
      }
    },
    [isOnline, deleteTaskRemote, dispatch]
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        dispatch(toggleStatusLocal(id));
        if (isOnline) {
          try {
            await toggleStatusRemote(id).unwrap();
          } catch (error) {
            console.error('useTasks: Failed to toggle in Firebase:', error);
            dispatch(toggleStatusLocal(id));
          }
        }
      } catch (error) {
        console.error('useTasks: Failed to toggle task status:', error);
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
