import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types/Task';
import { v4 as uuid } from 'uuid';

interface TaskState {
  list: Task[];
}

const initialState: TaskState = {
  list: [],
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Omit<Task, 'id'>>) => {
      state.list.push({ ...action.payload, id: uuid() });
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((t) => t.id !== action.payload);
    },
    toggleStatus: (state, action: PayloadAction<string>) => {
      const task = state.list.find((t) => t.id === action.payload);
      if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
      }
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.list.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {state.list[index] = action.payload;}
    },
  },
});

export const { addTask, deleteTask, toggleStatus, updateTask } = taskSlice.actions;
export default taskSlice.reducer;
