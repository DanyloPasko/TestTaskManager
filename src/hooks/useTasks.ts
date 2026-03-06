import {useCallback, useEffect} from 'react';
import {v4 as uuid} from 'uuid';
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useToggleTaskStatusMutation,
  useUpdateTaskMutation,
} from '../store/api/tasksApi';
import {CreateTaskInput, SyncStatus, Task} from '../types/task';
import {useNetworkStatus} from './useNetworkStatus';
import {useAppDispatch, useAppSelector} from './redux';
import {
  addTaskLocal,
  deleteTaskLocal,
  toggleStatusLocal,
  updateTaskLocal,
  markAsSynced,
  markSyncError,
  setTasks,
} from '../store/taskSlice';

export const useTasks = () => {
  const {isOnline} = useNetworkStatus();
  const dispatch = useAppDispatch();
  const localTasks = useAppSelector(state => state.tasks.list);

  const {
    data: remoteTasks,
    isLoading,
    isError,
    refetch,
  } = useGetTasksQuery(undefined, {
    skip: !isOnline,
  });

  const [createTaskRemote, {isLoading: isCreating}] = useCreateTaskMutation();
  const [updateTaskRemote, {isLoading: isUpdating}] = useUpdateTaskMutation();
  const [deleteTaskRemote, {isLoading: isDeleting}] = useDeleteTaskMutation();
  const [toggleStatusRemote, {isLoading: isToggling}] =
    useToggleTaskStatusMutation();

  const tasks = localTasks;

  // hydrate local store from remote when online
  useEffect(() => {
    if (!isOnline || !remoteTasks) {
      return;
    }
    if (!localTasks.length) {
      // initial load from server
      dispatch(setTasks(remoteTasks));
    }
  }, [isOnline, remoteTasks, localTasks.length, dispatch]);

  const handleCreateTask = useCallback(
    async (taskData: CreateTaskInput) => {
      const now = new Date().toISOString();
      const localId = uuid();

      const newTask: Task = {
        ...taskData,
        id: localId,
        createdAt: now,
        updatedAt: now,
        syncStatus: SyncStatus.Pending,
      };

      try {
        dispatch(addTaskLocal(newTask));

        if (isOnline) {
          try {
            const createdTask = await createTaskRemote(taskData).unwrap();
            dispatch(markAsSynced({oldId: localId, newId: createdTask.id}));
          } catch (error) {
            dispatch(markSyncError(localId));
          }
        }
      } catch (error) {
        throw error;
      }
    },
    [isOnline, createTaskRemote, dispatch],
  );

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<CreateTaskInput>) => {
      try {
        dispatch(updateTaskLocal({id, updates}));
        if (isOnline) {
          try {
            await updateTaskRemote({id, updates}).unwrap();
          } catch (error) {}
        }
      } catch (error) {
        throw error;
      }
    },
    [isOnline, updateTaskRemote, dispatch],
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        dispatch(deleteTaskLocal(id));
        if (isOnline) {
          try {
            await deleteTaskRemote(id).unwrap();
          } catch (error) {}
        }
      } catch (error) {
        throw error;
      }
    },
    [isOnline, deleteTaskRemote, dispatch],
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        dispatch(toggleStatusLocal(id));
        if (isOnline) {
          try {
            await toggleStatusRemote(id).unwrap();
          } catch (error) {
            dispatch(toggleStatusLocal(id));
          }
        }
      } catch (error) {
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
