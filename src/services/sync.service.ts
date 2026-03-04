import firestoreService from './firestore.service';
import {store} from '../store/store';
import {markAsSynced, markSyncError, setTasks} from '../store/taskSlice';
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

const pushPendingTasks = async () => {
  const state = store.getState();
  const pendingIds = [...state.tasks.pendingSync];

  for (const id of pendingIds) {
    const currentState = store.getState();
    const task = currentState.tasks.list.find(t => t.id === id);
    if (!task) {continue;}

    try {
      const dto = mapTaskToDto(task);

      if (task.syncStatus === 'pending') {
        const created = await firestoreService.createTask(dto);

        store.dispatch(
          markAsSynced({
            oldId: task.id,
            newId: created.id,
          }),
        );
      }
    } catch {
      store.dispatch(markSyncError(task.id));
    }
  }
};

const pullAndMerge = async () => {
  const remoteTasks = await firestoreService.getTasks();
  const state = store.getState();

  const localPending = state.tasks.list.filter(
    t => t.syncStatus === 'pending' || t.syncStatus === 'error',
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
