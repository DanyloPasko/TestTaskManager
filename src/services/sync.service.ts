import firestoreService from './firestore.service';
import {store} from '../store/store';
import {
  markAsSynced,
  markSyncError,
  markAllAsSynced,
  setTasks,
} from '../store/taskSlice';
import {CreateTaskInput, Task} from '../types/task';

let isSyncing = false;

const mapTaskToDto = (task: Task): CreateTaskInput => ({
  title: task.title,
  status: task.status,
  category: task.category ?? '',
  priority: task.priority,
});

const syncPendingTasks = async (): Promise<void> => {
  if (isSyncing) {return;}

  isSyncing = true;

  try {
    const state = store.getState();
    const {list, pendingSync} = state.tasks;

    if (pendingSync.length === 0) {return;}

    const idsToSync = [...pendingSync];

    for (const taskId of idsToSync) {
      const task = list.find(t => t.id === taskId);
      if (!task) {continue;}

      try {
        const existingTask = await firestoreService.getTaskById(taskId);
        const dto = mapTaskToDto(task);

        if (existingTask) {
          await firestoreService.updateTask(taskId, dto);
        } else {
          await firestoreService.createTask(dto);
        }

        store.dispatch(markAsSynced(taskId));
      } catch {
        store.dispatch(markSyncError(taskId));
      }
    }

    store.dispatch(markAllAsSynced());
  } finally {
    isSyncing = false;
  }
};

const pullFromFirebase = async (): Promise<void> => {
  const tasks = await firestoreService.getTasks();
  store.dispatch(setTasks(tasks));
};

const fullSync = async (): Promise<void> => {
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
  syncPendingTasks,
  pullFromFirebase,
  fullSync,
};
