import taskReducer, {
  addTask,
  deleteTask,
  toggleStatus,
  updateTask,
} from '../store/taskSlice.ts';
import {Task} from '../types/Task';

interface TaskState {
  list: Task[];
}

describe('taskSlice reducers', () => {
  const initialState: TaskState = { list: [] }; // Явно типизируем initialState

  it('should handle initial state', () => {
    expect(taskReducer(undefined, { type: 'unknown' })).toEqual({ list: [] });
  });

  it('should add a task with generated id', () => {
    const newTaskData: Omit<Task, 'id'> = { title: 'Test task', status: 'pending', priority: 'low' };
    const state = taskReducer(initialState, addTask(newTaskData));
    expect(state.list.length).toBe(1);
    expect(state.list[0].title).toBe('Test task');
    expect(state.list[0].status).toBe('pending');
    expect(state.list[0].priority).toBe('low');
    expect(state.list[0].id).toBeDefined();
  });

  it('should delete a task by id', () => {
    // Явно типизируем stateWithTask как TaskState
    const stateWithTask: TaskState = {
      list: [{ id: '1', title: 'Task 1', status: 'pending', priority: 'medium' }],
    };
    const state = taskReducer(stateWithTask, deleteTask('1'));
    expect(state.list.length).toBe(0);
  });

  it('should toggle task status from pending to completed', () => {
    const stateWithTask: TaskState = {
      list: [{ id: '1', title: 'Task 1', status: 'pending', priority: 'medium' }],
    };
    const state = taskReducer(stateWithTask, toggleStatus('1'));
    expect(state.list[0].status).toBe('completed');
  });

  it('should toggle task status from completed to pending', () => {
    const stateWithTask: TaskState = {
      list: [{ id: '1', title: 'Task 1', status: 'completed', priority: 'medium' }],
    };
    const state = taskReducer(stateWithTask, toggleStatus('1'));
    expect(state.list[0].status).toBe('pending');
  });

  it('should update a task by id', () => {
    const stateWithTask: TaskState = {
      list: [{ id: '1', title: 'Task 1', status: 'pending', priority: 'low' }],
    };
    const updatedTask: Task = { id: '1', title: 'Updated task', status: 'completed', priority: 'high' };
    const state = taskReducer(stateWithTask, updateTask(updatedTask));
    expect(state.list[0]).toEqual(updatedTask);
  });

  it('should not update if task id not found', () => {
    const stateWithTask: TaskState = {
      list: [{ id: '1', title: 'Task 1', status: 'pending', priority: 'low' }],
    };
    const updatedTask: Task = { id: '2', title: 'Updated task', status: 'completed', priority: 'high' };
    const state = taskReducer(stateWithTask, updateTask(updatedTask));
    expect(state.list.length).toBe(1);
    expect(state.list[0].title).toBe('Task 1');
  });
});
