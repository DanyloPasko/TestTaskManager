import firestoreService from './firestore.service';
import {store} from '../store/store';
import {markAsSynced, markSyncError, setTasks} from '../store/taskSlice';

/**
 * Service for synchronizing local tasks with Firebase
 */
class SyncService {
  private isSyncing = false;
  private syncQueue: string[] = [];

  /**
   * Sync all pending tasks to Firebase
   */
  async syncPendingTasks(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;

    try {
      const state = store.getState();
      const { list: tasks, pendingSync } = state.tasks;

      if (pendingSync.length === 0) {
        console.log('No tasks to sync');
        return;
      }

      console.log(`Syncing ${pendingSync.length} tasks...`);

      // Process each pending task
      for (const taskId of pendingSync) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
          continue;
        }

        try {
          // Check if task exists in Firestore
          const existingTask = await firestoreService.getTaskById(taskId);

          if (existingTask) {
            // Update existing task
            await firestoreService.updateTask(taskId, task);
          } else {
            // Create new task (if it was created offline)
            await firestoreService.createTask({
              ...task,
              id: taskId,
            } as any);
          }

          // Mark as synced in local state
          store.dispatch(markAsSynced(taskId));
          console.log(`Task ${taskId} synced successfully`);
        } catch (error) {
          console.error(`Failed to sync task ${taskId}:`, error);
          store.dispatch(markSyncError(taskId));
        }
      }

      console.log('Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Pull latest tasks from Firebase and update local state
   */
  async pullFromFirebase(): Promise<void> {
    try {
      console.log('Pulling tasks from Firebase...');
      const tasks = await firestoreService.getTasks();
      store.dispatch(setTasks(tasks));
      console.log(`Pulled ${tasks.length} tasks from Firebase`);
    } catch (error) {
      console.error('Failed to pull from Firebase:', error);
      throw error;
    }
  }

  /**
   * Full sync: pull from Firebase and push pending changes
   */
  async fullSync(): Promise<void> {
    try {
      console.log('Starting full sync...');

      // First, pull latest from Firebase
      await this.pullFromFirebase();

      // Then, push any pending local changes
      await this.syncPendingTasks();

      console.log('Full sync completed');
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Add task to sync queue
   */
  addToSyncQueue(taskId: string): void {
    if (!this.syncQueue.includes(taskId)) {
      this.syncQueue.push(taskId);
    }
  }

  /**
   * Check if currently syncing
   */
  getIsSyncing(): boolean {
    return this.isSyncing;
  }
}

export default new SyncService();
