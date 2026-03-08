import taskReducer, {
  addTaskLocal,
  deleteTaskLocal,
  toggleStatusLocal,
  updateTaskLocal,
} from '../store/taskSlice';
import {Task} from '../types/task';

interface TaskState {
  list: Task[];
  pendingSync: string[];
  lastSyncTime: string | null;
}

describe('taskSlice reducers', () => {
  const initialState: TaskState = {
    list: [],
    pendingSync: [],
    lastSyncTime: null,
  };

  describe('addTaskLocal', () => {
    it('should add a task with generated id, timestamps, and pending sync status', () => {
      const newTaskData = {
        title: 'Test task',
        status: 'pending' as const,
        priority: 'low' as const,
      };
      const state = taskReducer(initialState, addTaskLocal(newTaskData));

      expect(state.list.length).toBe(1);
      expect(state.list[0].title).toBe('Test task');
      expect(state.list[0].status).toBe('pending');
      expect(state.list[0].priority).toBe('low');
      expect(state.list[0].id).toBeDefined();
      expect(state.list[0].createdAt).toBeDefined();
      expect(state.list[0].updatedAt).toBeDefined();
      expect(state.list[0].syncStatus).toBe('pending');
      expect(state.pendingSync).toContain(state.list[0].id);
    });

    it('should add multiple tasks and track all in pendingSync', () => {
      let state = taskReducer(initialState, addTaskLocal({ title: 'Task 1', status: 'pending', priority: 'low' }));
      state = taskReducer(state, addTaskLocal({ title: 'Task 2', status: 'pending', priority: 'medium' }));

      expect(state.list.length).toBe(2);
      expect(state.pendingSync.length).toBe(2);
    });
  });

  describe('deleteTaskLocal', () => {
    it('should delete a task by id and remove from pendingSync', () => {
      const stateWithTask: TaskState = {
        list: [{
          id: '1',
          title: 'Task 1',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        pendingSync: ['1'],
        lastSyncTime: null,
      };

      const state = taskReducer(stateWithTask, deleteTaskLocal('1'));
      expect(state.list.length).toBe(0);
      expect(state.pendingSync.length).toBe(0);
    });

    it('should not affect other tasks when deleting', () => {
      const stateWithTasks: TaskState = {
        list: [
          { id: '1', title: 'Task 1', status: 'pending', priority: 'low', createdAt: '', updatedAt: '' },
          { id: '2', title: 'Task 2', status: 'pending', priority: 'high', createdAt: '', updatedAt: '' },
        ],
        pendingSync: ['1', '2'],
        lastSyncTime: null,
      };

      const state = taskReducer(stateWithTasks, deleteTaskLocal('1'));
      expect(state.list.length).toBe(1);
      expect(state.list[0].id).toBe('2');
      expect(state.pendingSync).toEqual(['2']);
    });
  });

  describe('toggleStatusLocal', () => {
    it('should toggle task status from pending to completed', () => {
      const stateWithTask: TaskState = {
        list: [{
          id: '1',
          title: 'Task 1',
          status: 'pending',
          priority: 'medium',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }],
        pendingSync: [],
        lastSyncTime: null,
      };

      const state = taskReducer(stateWithTask, toggleStatusLocal('1'));
      expect(state.list[0].status).toBe('completed');
      expect(state.list[0].syncStatus).toBe('pending');
      expect(state.pendingSync).toContain('1');
    });

    it('should toggle task status from completed to pending', () => {
      const stateWithTask: TaskState = {
        list: [{
          id: '1',
          title: 'Task 1',
          status: 'completed',
          priority: 'medium',
          createdAt: '',
          updatedAt: '',
        }],
        pendingSync: [],
        lastSyncTime: null,
      };

      const state = taskReducer(stateWithTask, toggleStatusLocal('1'));
      expect(state.list[0].status).toBe('pending');
    });

    it('should update updatedAt timestamp when toggling', () => {
      const oldTimestamp = '2024-01-01T00:00:00.000Z';
      const stateWithTask: TaskState = {
        list: [{
          id: '1',
          title: 'Task 1',
          status: 'pending',
          priority: 'medium',
          createdAt: oldTimestamp,
          updatedAt: oldTimestamp,
        }],
        pendingSync: [],
        lastSyncTime: null,
      };

      const state = taskReducer(stateWithTask, toggleStatusLocal('1'));
      expect(state.list[0].updatedAt).not.toBe(oldTimestamp);
    });
  });

  describe('updateTaskLocal', () => {
    it('should update task fields', () => {
      const stateWithTask: TaskState = {
        list: [{
          id: '1',
          title: 'Task 1',
          status: 'pending',
          priority: 'low',
          createdAt: '',
          updatedAt: '',
        }],
        pendingSync: [],
        lastSyncTime: null,
      };

      const state = taskReducer(stateWithTask, updateTaskLocal({
        id: '1',
        updates: { title: 'Updated task', priority: 'high' },
      }));

      expect(state.list[0].title).toBe('Updated task');
      expect(state.list[0].priority).toBe('high');
      expect(state.list[0].syncStatus).toBe('pending');
      expect(state.pendingSync).toContain('1');
    });

    it('should not add duplicate to pendingSync', () => {
      const stateWithTask: TaskState = {
        list: [{
          id: '1',
          title: 'Task 1',
          status: 'pending',
          priority: 'low',
          createdAt: '',
          updatedAt: '',
          syncStatus: 'pending',
        }],
        pendingSync: ['1'],
        lastSyncTime: null,
      };

      const state = taskReducer(stateWithTask, updateTaskLocal({
        id: '1',
        updates: { title: 'Updated again' },
      }));

      expect(state.pendingSync).toEqual(['1']);
    });
  });

  describe('edge cases', () => {
    it('should handle unknown action type', () => {
      expect(taskReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should not crash when toggling non-existent task', () => {
      const state = taskReducer(initialState, toggleStatusLocal('non-existent'));
      expect(state.list.length).toBe(0);
    });

    it('should not crash when updating non-existent task', () => {
      const state = taskReducer(initialState, updateTaskLocal({
        id: 'non-existent',
        updates: { title: 'Test' },
      }));
      expect(state.list.length).toBe(0);
    });
  });
});
