import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task, CreateTaskInput, Status } from '../../types/task';
import firestoreService from '../../services/firestore.service';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

// RTK Query API for Firebase operations
export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      async queryFn() {
        try {
          const tasks = await firestoreService.getTasks();
          return { data: tasks };
        } catch (error: unknown) {
          return {
            error: { status: 'CUSTOM_ERROR', error: toErrorMessage(error) },
          };
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

    getTaskById: builder.query<Task | null, string>({
      async queryFn(id) {
        try {
          const task = await firestoreService.getTaskById(id);
          return { data: task };
        } catch (error: unknown) {
          return {
            error: { status: 'CUSTOM_ERROR', error: toErrorMessage(error) },
          };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),

    createTask: builder.mutation<Task, CreateTaskInput>({
      async queryFn(taskData) {
        try {
          const task = await firestoreService.createTask(taskData);
          return { data: task };
        } catch (error: unknown) {
          return {
            error: { status: 'CUSTOM_ERROR', error: toErrorMessage(error) },
          };
        }
      },
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    updateTask: builder.mutation<{ success: boolean }, { id: string; updates: Partial<CreateTaskInput> }>({
      async queryFn({ id, updates }) {
        try {
          await firestoreService.updateTask(id, updates);
          return { data: { success: true } };
        } catch (error: unknown) {
          return {
            error: { status: 'CUSTOM_ERROR', error: toErrorMessage(error) },
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    deleteTask: builder.mutation<{ success: boolean }, string>({
      async queryFn(id) {
        try {
          await firestoreService.deleteTask(id);
          return { data: { success: true } };
        } catch (error: unknown) {
          return {
            error: { status: 'CUSTOM_ERROR', error: toErrorMessage(error) },
          };
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    toggleTaskStatus: builder.mutation<{ success: boolean }, string>({
      async queryFn(id) {
        try {
          const task = await firestoreService.getTaskById(id);
          if (task) {
            const newStatus =
              task.status === Status.Completed ? Status.Pending : Status.Completed;
            await firestoreService.updateTask(id, { status: newStatus });
          }
          return { data: { success: true } };
        } catch (error: unknown) {
          return {
            error: { status: 'CUSTOM_ERROR', error: toErrorMessage(error) },
          };
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
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskStatusMutation,
} = tasksApi;
