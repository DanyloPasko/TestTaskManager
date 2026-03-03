import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Task, CreateTaskInput} from '../types/task';
import {v4 as uuid} from 'uuid';

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
    addTaskLocal: (state, action: PayloadAction<CreateTaskInput>) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...action.payload,
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      };
      state.list.unshift(newTask);
      state.pendingSync.push(newTask.id);
    },
    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(t => t.id !== action.payload);
      state.pendingSync = state.pendingSync.filter(id => id !== action.payload);
    },
    updateTaskLocal: (
      state,
      action: PayloadAction<{id: string; updates: Partial<CreateTaskInput>}>,
    ) => {
      const task = state.list.find(t => t.id === action.payload.id);
      if (!task) {return;}
      Object.assign(task, action.payload.updates, {
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      });
      if (!state.pendingSync.includes(task.id)) {state.pendingSync.push(task.id);}
    },
    markAsSynced: (
      state,
      action: PayloadAction<{oldId: string; newId?: string}>,
    ) => {
      const {oldId, newId} = action.payload;
      const task = state.list.find(t => t.id === oldId);
      if (task) {
        task.syncStatus = 'synced';
        if (newId && newId !== oldId) {task.id = newId;}
      }
      state.pendingSync = state.pendingSync.filter(id => id !== oldId);
    },
    markSyncError: (state, action: PayloadAction<string>) => {
      const task = state.list.find(t => t.id === action.payload);
      if (task) {task.syncStatus = 'error';}
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      const pending = state.list.filter(t => t.syncStatus === 'pending');
      state.list = [
        ...action.payload.filter(t => !pending.find(p => p.id === t.id)),
        ...pending,
      ];
      state.pendingSync = pending.map(t => t.id);
      state.lastSyncTime = new Date().toISOString();
    },
  },
});

export const {
  addTaskLocal,
  deleteTaskLocal,
  updateTaskLocal,
  markAsSynced,
  markSyncError,
  setTasks,
} = taskSlice.actions;
export default taskSlice.reducer;
