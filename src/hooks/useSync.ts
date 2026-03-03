import {useEffect, useCallback, useState, useRef} from 'react';
import {useNetworkStatus} from './useNetworkStatus';
import syncService from '../services/sync.service';
import {useAppSelector} from './redux';

/**
 * Hook for managing offline/online synchronization
 * - Manual sync
 * - Auto sync only when coming back online
 */
export const useSync = () => {
  const {isOnline} = useNetworkStatus();
  const pendingSync = useAppSelector(state => state.tasks.pendingSync);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const hasPendingChanges = pendingSync.length > 0;

  // Ref для отслеживания предыдущего состояния сети
  const wasOnlineRef = useRef<boolean>(isOnline);

  /**
   * Manual sync trigger
   */
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
      setSyncError(error?.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  /**
   * Auto sync ONLY when going from offline -> online
   */
  useEffect(() => {
    const wasOnline = wasOnlineRef.current;

    if (!wasOnline && isOnline) {
      triggerSync();
    }

    wasOnlineRef.current = isOnline;
  }, [isOnline, triggerSync]);

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
