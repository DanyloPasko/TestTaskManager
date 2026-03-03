import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types/task';
import { v4 as uuid } from 'uuid';

interface TaskState {
  list: Task[];
  pendingSync: string[]; // IDs of tasks pending sync
  lastSyncTime: string | null;
}

const initialState: TaskState = {
  list: [],
  pendingSync: [],
  lastSyncTime: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Local task operations (for offline mode)
    addTaskLocal: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...action.payload,
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      };
      state.list.push(newTask);
      state.pendingSync.push(newTask.id);
    },

    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((t) => t.id !== action.payload);
      state.pendingSync = state.pendingSync.filter((id) => id !== action.payload);
    },

    toggleStatusLocal: (state, action: PayloadAction<string>) => {
      const task = state.list.find((t) => t.id === action.payload);
      if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        task.updatedAt = new Date().toISOString();
        task.syncStatus = 'pending';
        if (!state.pendingSync.includes(task.id)) {
          state.pendingSync.push(task.id);
        }
      }
    },

    updateTaskLocal: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const task = state.list.find((t) => t.id === action.payload.id);
      if (task) {
        Object.assign(task, action.payload.updates, {
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
        });
        if (!state.pendingSync.includes(task.id)) {
          state.pendingSync.push(task.id);
        }
      }
    },

    // Sync operations
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.list = action.payload;
      state.lastSyncTime = new Date().toISOString();
    },

    markAsSynced: (state, action: PayloadAction<string>) => {
      const task = state.list.find((t) => t.id === action.payload);
      if (task) {
        task.syncStatus = 'synced';
      }
      state.pendingSync = state.pendingSync.filter((id) => id !== action.payload);
    },

    markAllAsSynced: (state) => {
      state.list.forEach((task) => {
        task.syncStatus = 'synced';
      });
      state.pendingSync = [];
      state.lastSyncTime = new Date().toISOString();
    },

    markSyncError: (state, action: PayloadAction<string>) => {
      const task = state.list.find((t) => t.id === action.payload);
      if (task) {
        task.syncStatus = 'error';
      }
    },
  },
});

export const {
  addTaskLocal,
  deleteTaskLocal,
  toggleStatusLocal,
  updateTaskLocal,
  setTasks,
  markAsSynced,
  markAllAsSynced,
  markSyncError,
} = taskSlice.actions;

export default taskSlice.reducer;
