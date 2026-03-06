import firestoreService from './firestore.service';
import {store} from '../store/store';
import {markAsSynced, markSyncError, setTasks} from '../store/taskSlice';
import {CreateTaskInput, SyncStatus, Task} from '../types/task';

let isSyncing = false;

const mapTaskToDto = (task: Task): CreateTaskInput => ({
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  category: task.category,
  deadline: task.deadline ?? undefined,
  imageUri: task.imageUri,
});

const pushPendingTasks = async () => {
  const state = store.getState();
  const pendingIds = [...state.tasks.pendingSync];
  const pendingDeletes = [...state.tasks.pendingDeletes];

  // handle creates/updates
  for (const id of pendingIds) {
    const currentState = store.getState();
    const task = currentState.tasks.list.find(t => t.id === id);
    if (!task) {
      continue;
    }

    try {
      const dto = mapTaskToDto(task);
      const remote = await firestoreService.getTaskById(task.id);

      if (!remote) {
        const created = await firestoreService.createTask(dto);

        store.dispatch(
          markAsSynced({
            oldId: task.id,
            newId: created.id,
          }),
        );
      } else if (
        task.syncStatus === SyncStatus.Pending ||
        task.syncStatus === SyncStatus.Error
      ) {
        await firestoreService.updateTask(task.id, dto);
        store.dispatch(
          markAsSynced({
            oldId: task.id,
            newId: task.id,
          }),
        );
      }
    } catch {
      store.dispatch(markSyncError(task.id));
    }
  }

  // handle deletes
  for (const id of pendingDeletes) {
    try {
      await firestoreService.deleteTask(id);
    } catch {
      // keep in pendingDeletes; will retry on next sync
    }
  }
};

const pullAndMerge = async () => {
  const remoteTasks = await firestoreService.getTasks();
  const state = store.getState();

  const localPending = state.tasks.list.filter(
    t =>
      t.syncStatus === SyncStatus.Pending || t.syncStatus === SyncStatus.Error,
  );

  const merged: Task[] = [
    ...remoteTasks.filter(r => !localPending.find(l => l.id === r.id)),
    ...localPending,
  ];

  store.dispatch(setTasks(merged));
};

const fullSync = async (): Promise<void> => {
  if (isSyncing) {return;}
  isSyncing = true;

  try {
    await pushPendingTasks();
    await pullAndMerge();
  } finally {
    isSyncing = false;
  }
};

export default {
  fullSync,
};
