import {useCallback} from 'react';
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useToggleTaskStatusMutation,
  useUpdateTaskMutation,
} from '../store/api/tasksApi';
import {CreateTaskInput} from '../types/task';
import {useNetworkStatus} from './useNetworkStatus';
import {useAppDispatch, useAppSelector} from './redux';
import {
  addTaskLocal,
  deleteTaskLocal,
  setTasks,
  toggleStatusLocal,
  updateTaskLocal,
} from '../store/taskSlice';

export const useTasks = () => {
  const {isOnline} = useNetworkStatus();
  const dispatch = useAppDispatch();
  const localTasks = useAppSelector(state => state.tasks.list);

  const {
    isLoading,
    isError,
    refetch,
  } = useGetTasksQuery(undefined, {
    skip: false,
  });

  const [createTaskRemote, {isLoading: isCreating}] = useCreateTaskMutation();
  const [updateTaskRemote, {isLoading: isUpdating}] = useUpdateTaskMutation();
  const [deleteTaskRemote, {isLoading: isDeleting}] = useDeleteTaskMutation();
  const [toggleStatusRemote, {isLoading: isToggling}] =
    useToggleTaskStatusMutation();

  const tasks = localTasks;

  const handleCreateTask = useCallback(
    async (taskData: CreateTaskInput) => {
      try {
        if (isOnline) {
          try {
            const createdTask = await createTaskRemote(taskData).unwrap();
            dispatch(setTasks([...localTasks, createdTask]));
          } catch (error: any) {
            console.error('useTasks: Failed to sync to Firebase:', error);
            console.error('useTasks: Firebase error details:', {
              message: error?.message,
              status: error?.status,
              data: error?.data,
            });
            dispatch(addTaskLocal(taskData));
          }
        } else {
          dispatch(addTaskLocal(taskData));
        }
      } catch (error) {
        console.error('useTasks: Failed to create task:', error);
        throw error;
      }
    },
    [isOnline, createTaskRemote, dispatch, localTasks],
  );

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<CreateTaskInput>) => {
      try {
        dispatch(updateTaskLocal({id, updates}));
        if (isOnline) {
          try {
            console.log('useTasks: handleUpdateTask - syncing to Firebase');
            await updateTaskRemote({id, updates}).unwrap();
            console.log('useTasks: Task update synced to Firebase');
          } catch (error: any) {
            console.error(
              'useTasks: Failed to sync update to Firebase:',
              error,
            );
          }
        }
      } catch (error) {
        console.error('useTasks: Failed to update task:', error);
        throw error;
      }
    },
    [isOnline, updateTaskRemote, dispatch],
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        console.log('useTasks: handleDeleteTask called for ID:', id);
        dispatch(deleteTaskLocal(id));
        if (isOnline) {
          try {
            await deleteTaskRemote(id).unwrap();
          } catch (error: any) {
            console.error('useTasks: Delete error details:', {
              message: error?.message,
              status: error?.status,
              data: error?.data,
            });
          }
        } else {
          console.log('useTasks: Offline mode - task deleted locally only');
        }
      } catch (error) {
        console.error('useTasks: Failed to delete task:', error);
        throw error;
      }
    },
    [isOnline, deleteTaskRemote, dispatch],
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        console.log('useTasks: handleToggleStatus called for ID:', id);
        dispatch(toggleStatusLocal(id));
        if (isOnline) {
          try {
            console.log('useTasks: handleToggleStatus - syncing to Firebase');
            const result = await toggleStatusRemote(id).unwrap();
            console.log(
              '✅ useTasks: Task status toggled in Firebase:',
              result,
            );
          } catch (error: any) {
            console.error('useTasks: Failed to toggle in Firebase:', error);
            console.error('useTasks: Toggle error details:', {
              message: error?.message,
              status: error?.status,
            });
            dispatch(toggleStatusLocal(id));
          }
        } else {
          console.log('useTasks: Offline mode - status toggled locally only');
        }
      } catch (error) {
        console.error('useTasks: Failed to toggle task status:', error);
        throw error;
      }
    },
    [isOnline, toggleStatusRemote, dispatch],
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
