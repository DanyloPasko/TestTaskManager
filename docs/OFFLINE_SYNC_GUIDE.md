# Offline/Online Synchronization Guide

## Overview

The TaskManager app supports full offline functionality with automatic synchronization when network connection is restored.

## Architecture

```
┌──────────────────┐
│   Components     │
│  (UI Layer)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│   useTasks()     │◄──────┤ useNetworkStatus │
│   Custom Hook    │       │  (NetInfo)       │
└────────┬─────────┘       └──────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────────┐
│  RTK   │ │ Local State │
│ Query  │ │ (taskSlice) │
└───┬────┘ └──────┬──────┘
    │             │
    │        ┌────┴──────┐
    │        │   Sync    │
    │        │  Service  │
    │        └────┬──────┘
    │             │
    ▼             ▼
┌──────────────────────┐
│   Firebase Firestore │
└──────────────────────┘
```

## How It Works

### Online Mode
1. All operations go directly to Firebase via RTK Query
2. RTK Query caches results
3. Real-time updates from Firestore
4. Instant sync across devices

### Offline Mode
1. Operations saved to local Redux state
2. Tasks marked with `syncStatus: 'pending'`
3. Data persisted to AsyncStorage
4. Full app functionality maintained

### Back Online
1. Network status detected via NetInfo
2. Automatic sync triggered
3. Pending changes pushed to Firebase
4. Latest data pulled from Firebase
5. Local state updated

## Key Components

### 1. useNetworkStatus Hook
Monitors network connectivity:
```typescript
const { isOnline, isOffline } = useNetworkStatus();
```

### 2. useSync Hook
Manages synchronization:
```typescript
const {
  isOnline,
  isSyncing,
  hasPendingChanges,
  triggerSync,
} = useSync();
```

### 3. useTasks Hook (Enhanced)
Handles online/offline operations:
```typescript
const { tasks, createTask, isOnline } = useTasks();

// Works in both modes!
await createTask({
  title: 'New Task',
  status: 'pending',
  priority: 'high',
});
```

### 4. SyncIndicator Component
Visual feedback for sync status:
```tsx
<SyncIndicator showDetails />
```

## Sync Statuses

Tasks have a `syncStatus` field:
- `'synced'` - Successfully synced with Firebase
- `'pending'` - Waiting to sync (offline changes)
- `'error'` - Sync failed (retry needed)

## Usage Examples

### Basic Usage
```typescript
import { useTasks } from '../hooks/useTasks';

function MyComponent() {
  const { tasks, createTask, isOnline } = useTasks();

  // This works online AND offline!
  const handleAddTask = async () => {
    await createTask({
      title: 'Buy groceries',
      status: 'pending',
      priority: 'medium',
    });
  };

  return (
    <View>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </View>
  );
}
```

### With Sync Indicator
```typescript
import { SyncIndicator } from '../components/SyncIndicator';
import { useTasks } from '../hooks/useTasks';

function TaskListScreen() {
  const { tasks } = useTasks();

  return (
    <View>
      <SyncIndicator showDetails />
      <FlatList data={tasks} ... />
    </View>
  );
}
```

### Manual Sync
```typescript
import { useSync } from '../hooks/useSync';

function SettingsScreen() {
  const { triggerSync, isSyncing, lastSyncTime } = useSync();

  return (
    <View>
      <Button
        title="Sync Now"
        onPress={triggerSync}
        disabled={isSyncing}
      />
      {lastSyncTime && (
        <Text>Last sync: {lastSyncTime.toLocaleString()}</Text>
      )}
    </View>
  );
}
```

## Data Flow

### Creating a Task

**Online:**
```
User creates task
    ↓
useTasks.createTask()
    ↓
RTK Query mutation
    ↓
Firebase Firestore
    ↓
Task added to remote DB
    ↓
RTK Query cache updated
    ↓
UI updates
```

**Offline:**
```
User creates task
    ↓
useTasks.createTask()
    ↓
dispatch(addTaskLocal())
    ↓
Redux state updated
    ↓
AsyncStorage persisted
    ↓
UI updates
    ↓
[Network restored]
    ↓
Auto sync triggered
    ↓
Synced to Firebase
```

## Conflict Resolution

Currently uses **last-write-wins** strategy:
- Offline changes overwrite server data on sync
- No merge conflicts
- Simple and predictable

Future enhancements could include:
- Timestamp-based conflict resolution
- User-prompted conflict resolution
- Operational transformation

## Persistence

Data is persisted using:
- **redux-persist** - Saves Redux state to AsyncStorage
- **AsyncStorage** - React Native's local storage
- **Firebase Firestore** - Cloud database

Configuration in `store.ts`:
```typescript
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['tasks'], // Persist tasks
  blacklist: ['tasksApi'], // Don't persist RTK Query cache
};
```

## Error Handling

### Network Errors
- Automatically fall back to local operations
- Tasks marked as pending
- Auto-retry on reconnection

### Sync Errors
- Tasks marked with `syncStatus: 'error'`
- User notified via SyncIndicator
- Manual retry available

### Firebase Errors
- Caught and logged
- Local operations continue
- Graceful degradation

## Testing Offline Mode

### On Device
1. Enable airplane mode
2. Create/edit tasks
3. Disable airplane mode
4. Watch automatic sync

### In Development
```typescript
// Simulate offline mode
NetInfo.configure({
  reachabilityUrl: 'http://localhost:9999', // Unreachable
});

// Reset
NetInfo.configure({
  reachabilityUrl: 'https://clients3.google.com/generate_204',
});
```

## Performance Considerations

### Battery Life
- Sync only when needed (change-based)
- Debounced sync operations
- Background sync when app inactive

### Data Usage
- Efficient delta syncing
- Compressed payloads (via Firebase)
- Selective field updates

### Storage
- AsyncStorage limit: ~6MB (varies by device)
- Automatic cleanup of old data
- Pagination for large datasets (Step 6)

## Best Practices

1. **Always use `useTasks()` hook** - Handles online/offline automatically
2. **Show sync status** - Keep users informed with SyncIndicator
3. **Test offline scenarios** - Critical user experience
4. **Handle errors gracefully** - Provide retry options
5. **Optimize sync frequency** - Balance freshness vs performance

## Monitoring

Log sync operations:
```typescript
// In syncService
console.log('Syncing tasks...', { pendingCount });
console.log('Sync completed', { syncedCount });
console.error('Sync failed', { error });
```

Monitor in Redux DevTools:
- Watch `tasks.pendingSync` array
- Track `tasks.lastSyncTime`
- Observe state transitions

## Troubleshooting

### Sync not triggering
- Check network status: `useNetworkStatus()`
- Verify `pendingSync` array has items
- Check console for errors

### Data not persisting
- Verify AsyncStorage permissions
- Check redux-persist config
- Clear cache and rebuild

### Conflicts after sync
- Currently uses last-write-wins
- Check task timestamps
- Verify sync order

## Future Improvements

Planned enhancements:
- Batch sync for efficiency
- Progressive sync for large datasets
- Conflict resolution UI
- Sync analytics
- Background sync (when app closed)

## API Reference

### useNetworkStatus()
```typescript
interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
  isOnline: boolean;
  isOffline: boolean;
}
```

### useSync()
```typescript
interface SyncHook {
  isOnline: boolean;
  isSyncing: boolean;
  hasPendingChanges: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  syncError: string | null;
  triggerSync: () => Promise<void>;
}
```

### syncService
```typescript
class SyncService {
  syncPendingTasks(): Promise<void>;
  pullFromFirebase(): Promise<void>;
  fullSync(): Promise<void>;
  addToSyncQueue(taskId: string): void;
  getIsSyncing(): boolean;
}
```

## Next Steps

- Step 4: Add categories for tasks
- Step 5: Implement task filtering
- Step 6: Add pagination
