import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task, CreateTaskInput } from '../../types/task';
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
          console.log('📡 RTK Query: getTasks called');
          const tasks = await firestoreService.getTasks();
          console.log('📡 RTK Query: getTasks success, got', tasks.length, 'tasks');
          return { data: tasks };
        } catch (error: any) {
          console.error('📡 RTK Query: getTasks error:', error?.message || error);
          // Return empty array on error (when offline or Firebase error)
          // This prevents the query from being in error state
          return { data: [] };
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
    createTask: builder.mutation<Task, CreateTaskInput>({
      async queryFn(taskData) {
        try {
          console.log('📡 RTK Query: createTask called with:', taskData);
          const task = await firestoreService.createTask(taskData);
          console.log('📡 RTK Query: createTask success:', task);
          return { data: task };
        } catch (error: any) {
          console.error('📡 RTK Query: createTask error:', error);
          return { error: { status: 'CUSTOM_ERROR', error: error.message || 'Unknown error' } };
        }
      },
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    // Update task
    updateTask: builder.mutation<{ success: boolean }, { id: string; updates: Partial<CreateTaskInput> }>({
      async queryFn({ id, updates }) {
        try {
          console.log('📡 RTK Query: updateTask called with:', { id, updates });
          await firestoreService.updateTask(id, updates);
          console.log('📡 RTK Query: updateTask success for ID:', id);
          return { data: { success: true } };
        } catch (error: any) {
          console.error('📡 RTK Query: updateTask error:', error);
          return { error: { status: 'CUSTOM_ERROR', error: error?.message || 'Unknown error' } };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    // Delete task
    deleteTask: builder.mutation<{ success: boolean }, string>({
      async queryFn(id) {
        try {
          console.log('📡 RTK Query: deleteTask called with ID:', id);
          await firestoreService.deleteTask(id);
          console.log('📡 RTK Query: deleteTask success for ID:', id);
          return { data: { success: true } };
        } catch (error: any) {
          console.error('📡 RTK Query: deleteTask error:', error);
          console.error('📡 RTK Query: deleteTask error message:', error?.message);
          return { error: { status: 'CUSTOM_ERROR', error: error?.message || 'Unknown error' } };
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    // Toggle task status
    toggleTaskStatus: builder.mutation<{ success: boolean }, string>({
      async queryFn(id) {
        try {
          console.log('📡 RTK Query: toggleTaskStatus called with ID:', id);
          const task = await firestoreService.getTaskById(id);
          if (task) {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            await firestoreService.updateTask(id, { status: newStatus });
            console.log('📡 RTK Query: toggleTaskStatus success for ID:', id);
          }
          return { data: { success: true } };
        } catch (error: any) {
          console.error('📡 RTK Query: toggleTaskStatus error:', error);
          return { error: { status: 'CUSTOM_ERROR', error: error?.message || 'Unknown error' } };
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
