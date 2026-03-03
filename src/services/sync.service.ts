import firestoreService from './firestore.service';
import {store} from '../store/store';
import {
  addTaskLocal,
  markAsSynced,
  markSyncError,
  setTasks,
} from '../store/taskSlice';
import {CreateTaskInput, Task} from '../types/task';

let isSyncing = false;

const mapTaskToDto = (task: Task): CreateTaskInput => ({
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  category: task.category ?? '',
  imageUri: task.imageUri,
});

export const createLocalTask = (taskData: CreateTaskInput) => {
  store.dispatch(addTaskLocal(taskData));
};

const syncPendingTasks = async (): Promise<void> => {
  if (isSyncing) {return;}
  isSyncing = true;
  try {
    const state = store.getState();
    const pendingIds = [...state.tasks.pendingSync];

    for (const taskId of pendingIds) {
      const task = state.tasks.list.find(t => t.id === taskId);
      if (!task) {continue;}

      try {
        const dto = mapTaskToDto(task);
        const created = await firestoreService.createTask(dto);
        store.dispatch(markAsSynced({oldId: task.id, newId: created.id}));
      } catch (error) {
        console.error('Failed to sync task', task.id, error);
        store.dispatch(markSyncError(task.id));
      }
    }
  } finally {
    isSyncing = false;
  }
};

const pullFromFirebase = async (): Promise<void> => {
  const remoteTasks = await firestoreService.getTasks();
  const state = store.getState();
  const pendingTasks = state.tasks.list.filter(t => t.syncStatus === 'pending');
  const mergedTasks = [
    ...remoteTasks.filter(t => !pendingTasks.find(p => p.id === t.id)),
    ...pendingTasks,
  ];
  store.dispatch(setTasks(mergedTasks));
};

export const fullSync = async (): Promise<void> => {
  if (isSyncing) {return;}
  isSyncing = true;
  try {
    await syncPendingTasks();
    await pullFromFirebase();
  } finally {
    isSyncing = false;
  }
};

export default {
  createLocalTask,
  syncPendingTasks,
  pullFromFirebase,
  fullSync,
};
