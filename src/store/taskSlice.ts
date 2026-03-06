import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  Task,
  CreateTaskInput,
  Status,
  SyncStatus,
} from '../types/task';

interface TaskState {
  list: Task[];
  pendingSync: string[];
  pendingDeletes: string[];
  lastSyncTime: string | null;
}

const initialState: TaskState = {
  list: [],
  pendingSync: [],
  pendingDeletes: [],
  lastSyncTime: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTaskLocal: (state, action: PayloadAction<Task>) => {
      state.list.push(action.payload);
      if (action.payload.syncStatus === SyncStatus.Pending) {
        state.pendingSync.push(action.payload.id);
      }
    },

    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(t => t.id !== action.payload);
      state.pendingSync = state.pendingSync.filter(id => id !== action.payload);
      if (!state.pendingDeletes.includes(action.payload)) {
        state.pendingDeletes.push(action.payload);
      }
    },

    toggleStatusLocal: (state, action: PayloadAction<string>) => {
      const task = state.list.find(t => t.id === action.payload);
      if (!task) {
        return;
      }

      task.status =
        task.status === Status.Pending ? Status.Completed : Status.Pending;
      task.updatedAt = new Date().toISOString();
      task.syncStatus = SyncStatus.Pending;

      if (!state.pendingSync.includes(task.id)) {
        state.pendingSync.push(task.id);
      }
    },

    updateTaskLocal: (
      state,
      action: PayloadAction<{id: string; updates: Partial<CreateTaskInput>}>,
    ) => {
      const task = state.list.find(t => t.id === action.payload.id);
      if (!task) {
        return;
      }

      Object.assign(task, action.payload.updates, {
        updatedAt: new Date().toISOString(),
        syncStatus: SyncStatus.Pending,
      });

      if (!state.pendingSync.includes(task.id)) {
        state.pendingSync.push(task.id);
      }
    },

    markAsSynced: (
      state,
      action: PayloadAction<{oldId: string; newId: string}>,
    ) => {
      const task = state.list.find(t => t.id === action.payload.oldId);
      if (!task) {
        return;
      }

      task.id = action.payload.newId;
      task.syncStatus = SyncStatus.Synced;

      state.pendingSync = state.pendingSync.filter(
        id => id !== action.payload.oldId,
      );
    },

    markSyncError: (state, action: PayloadAction<string>) => {
      const task = state.list.find(t => t.id === action.payload);
      if (!task) {
        return;
      }

      task.syncStatus = SyncStatus.Error;

      if (!state.pendingSync.includes(task.id)) {
        state.pendingSync.push(task.id);
      }
    },

    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.list = action.payload;
      state.pendingSync = [];
      state.pendingDeletes = [];
      state.lastSyncTime = new Date().toISOString();
    },
  },
});

export const {
  addTaskLocal,
  deleteTaskLocal,
  toggleStatusLocal,
  updateTaskLocal,
  markAsSynced,
  markSyncError,
  setTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
