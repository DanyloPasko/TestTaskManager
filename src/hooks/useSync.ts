import { useEffect, useCallback, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import syncService from '../services/sync.service';
import { useAppSelector } from './redux';

/**
 * Hook for managing offline/online synchronization
 * Automatically syncs when coming back online
 */
export const useSync = () => {
  const { isOnline } = useNetworkStatus();
  const pendingSync = useAppSelector(state => state.tasks.pendingSync);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const hasPendingChanges = pendingSync.length > 0;

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline');
      return;
    }

    if (isSyncing) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncService.fullSync();
      setLastSyncTime(new Date());
    } catch (error: any) {
      console.error('Sync failed:', error);
      setSyncError(error.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && hasPendingChanges && !isSyncing) {
      console.log('Network available, syncing pending changes...');
      triggerSync();
    }
  }, [isOnline, hasPendingChanges, isSyncing, triggerSync]);

  // Initial sync when component mounts (if online)
  useEffect(() => {
    if (isOnline && !isSyncing) {
      triggerSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isOnline,
    isSyncing,
    hasPendingChanges,
    pendingCount: pendingSync.length,
    lastSyncTime,
    syncError,
    triggerSync,
  };
};
