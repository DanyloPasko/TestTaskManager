# RTK Query Implementation Guide

## Overview

RTK Query is integrated into the TaskManager app to provide efficient data fetching, caching, and synchronization with Firebase Firestore.

## Architecture

```
┌─────────────────┐
│   Components    │
│  (React Native) │
└────────┬────────┘
         │ uses hooks
         ▼
┌─────────────────┐
│   useTasks()    │
│  Custom Hook    │
└────────┬────────┘
         │ calls
         ▼
┌─────────────────┐
│   tasksApi      │
│  RTK Query API  │
└────────┬────────┘
         │ calls
         ▼
┌─────────────────┐
│ firestoreService│
│  Firebase SDK   │
└────────┬────────┘
         │
         ▼
    Firebase Cloud
```

## Key Features

### 1. Automatic Caching
RTK Query automatically caches fetched data and reuses it across components.

### 2. Automatic Refetching
- Refetches on window focus
- Refetches on network reconnection
- Manual refetch available

### 3. Optimistic Updates
UI updates immediately, syncs with backend in background.

### 4. Request Deduplication
Multiple components requesting same data → single network request.

## Files Structure

```
src/
├── store/
│   ├── api/
│   │   └── tasksApi.ts        # RTK Query API definition
│   ├── store.ts                # Redux store with RTK Query
│   └── taskSlice.ts            # Local state for offline mode
├── hooks/
│   └── useTasks.ts             # Custom hook wrapping RTK Query
├── services/
│   └── firestore.service.ts    # Firebase operations
└── examples/
    └── RTKQueryExample.tsx     # Usage example
```

## Usage

### Basic Usage

```typescript
import { useTasks } from '../hooks/useTasks';

function MyComponent() {
  const { tasks, isLoading, createTask, deleteTask } = useTasks();

  if (isLoading) return <Loading />;

  return (
    <View>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </View>
  );
}
```

### Creating a Task

```typescript
const { createTask } = useTasks();

const handleCreate = async () => {
  await createTask({
    title: 'New Task',
    description: 'Task description',
    status: 'pending',
    priority: 'high',
  });
};
```

### Updating a Task

```typescript
const { updateTask } = useTasks();

const handleUpdate = async (id: string) => {
  await updateTask(id, {
    title: 'Updated Title',
    priority: 'low',
  });
};
```

### Deleting a Task

```typescript
const { deleteTask } = useTasks();

const handleDelete = async (id: string) => {
  await deleteTask(id);
};
```

### Toggle Task Status

```typescript
const { toggleStatus } = useTasks();

const handleToggle = async (id: string) => {
  await toggleStatus(id);
};
```

### Manual Refetch

```typescript
const { refetch } = useTasks();

const handleRefresh = () => {
  refetch();
};
```

## Advanced Usage

### Direct API Hooks

For more control, use API hooks directly:

```typescript
import {
  useGetTasksQuery,
  useCreateTaskMutation,
} from '../store/api/tasksApi';

function AdvancedComponent() {
  const { data: tasks, isLoading, error } = useGetTasksQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  // ... component logic
}
```

### Polling

Automatically refetch at intervals:

```typescript
const { data } = useGetTasksQuery(undefined, {
  pollingInterval: 30000, // Refetch every 30 seconds
});
```

### Skip Query

Conditionally skip query execution:

```typescript
const { data } = useGetTasksQuery(undefined, {
  skip: !isOnline, // Skip when offline
});
```

## Cache Tags

RTK Query uses tags for cache invalidation:

- `Task` - Individual task
- `Task:LIST` - List of all tasks

When a mutation occurs, related queries are automatically refetched.

## Error Handling

```typescript
const { tasks, isError, error } = useTasks();

if (isError) {
  console.error('Error:', error);
  // Show error UI
}
```

## Loading States

```typescript
const {
  isLoading,      // Initial load
  isCreating,     // Creating task
  isUpdating,     // Updating task
  isDeleting,     // Deleting task
  isToggling,     // Toggling status
} = useTasks();
```

## Best Practices

1. **Use `useTasks()` hook** - Simplifies component code
2. **Handle loading states** - Show spinners/skeletons
3. **Handle errors** - Display user-friendly messages
4. **Avoid refetching in loops** - RTK Query handles this automatically
5. **Use optimistic updates** - For better UX (covered in offline sync)

## Integration with Offline Mode

RTK Query works alongside `taskSlice` for offline support:

- **Online**: RTK Query fetches from Firebase
- **Offline**: Local Redux state serves data
- **On reconnect**: Pending changes sync to Firebase

See `OFFLINE_SYNC_GUIDE.md` for details (created in next step).

## Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useTasks } from '../hooks/useTasks';

test('fetches tasks', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useTasks());

  await waitForNextUpdate();

  expect(result.current.tasks).toHaveLength(5);
});
```

## Debugging

Enable Redux DevTools to inspect:
- Cached data
- Query states
- Mutations
- Cache invalidations

## Performance

RTK Query optimizes performance by:
- ✅ Deduplicating requests
- ✅ Caching results
- ✅ Selective re-renders
- ✅ Background refetching
- ✅ Normalized cache (when configured)

## Next Steps

- Step 3: Implement offline/online synchronization
- Step 4: Add categories support
- Step 5: Implement filtering
