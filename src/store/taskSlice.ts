import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Task, CreateTaskInput} from '../types/task';

interface TaskState {
  list: Task[];
  pendingSync: string[];
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
    addTaskLocal: (state, action: PayloadAction<Task>) => {
      state.list.push(action.payload);
      if (action.payload.syncStatus === 'pending') {
        state.pendingSync.push(action.payload.id);
      }
    },

    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(t => t.id !== action.payload);
      state.pendingSync = state.pendingSync.filter(id => id !== action.payload);
    },

    toggleStatusLocal: (state, action: PayloadAction<string>) => {
      const task = state.list.find(t => t.id === action.payload);
      if (!task) {
        return;
      }

      task.status = task.status === 'pending' ? 'completed' : 'pending';
      task.updatedAt = new Date().toISOString();
      task.syncStatus = 'pending';

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
        syncStatus: 'pending',
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
      task.syncStatus = 'synced';

      state.pendingSync = state.pendingSync.filter(
        id => id !== action.payload.oldId,
      );
    },

    markSyncError: (state, action: PayloadAction<string>) => {
      const task = state.list.find(t => t.id === action.payload);
      if (!task) {
        return;
      }

      task.syncStatus = 'error';

      if (!state.pendingSync.includes(task.id)) {
        state.pendingSync.push(task.id);
      }
    },

    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.list = action.payload;
      state.pendingSync = [];
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
