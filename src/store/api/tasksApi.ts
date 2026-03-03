import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task } from '../../types/task';
import firestoreService from '../../services/firestore.service';

// RTK Query API for Firebase operations
export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    // Get all tasks
    getTasks: builder.query<Task[], void>({
      async queryFn() {
        try {
          const tasks = await firestoreService.getTasks();
          return { data: tasks };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    // Get single task by ID
    getTaskById: builder.query<Task | null, string>({
      async queryFn(id) {
        try {
          const task = await firestoreService.getTaskById(id);
          return { data: task };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),

    // Create new task
    createTask: builder.mutation<Task, Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>({
      async queryFn(taskData) {
        try {
          const task = await firestoreService.createTask(taskData);
          return { data: task };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    // Update task
    updateTask: builder.mutation<void, { id: string; updates: Partial<Task> }>({
      async queryFn({ id, updates }) {
        try {
          await firestoreService.updateTask(id, updates);
          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    // Delete task
    deleteTask: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await firestoreService.deleteTask(id);
          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    // Toggle task status
    toggleTaskStatus: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          const task = await firestoreService.getTaskById(id);
          if (task) {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            await firestoreService.updateTask(id, { status: newStatus });
          }
          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskStatusMutation,
} = tasksApi;
