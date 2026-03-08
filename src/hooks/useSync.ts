import {useEffect, useCallback, useState, useRef} from 'react';
import {useNetworkStatus} from './useNetworkStatus';
import syncService from '../services/sync.service';
import {useAppSelector} from './redux';

export const useSync = () => {
  const {isOnline} = useNetworkStatus();
  const pendingSync = useAppSelector(state => state.tasks.pendingSync);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const hasPendingChanges = pendingSync.length > 0;
  const wasOnlineRef = useRef<boolean>(isOnline);

  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline');
      return;
    }
    if (isSyncing) {return;}
    setIsSyncing(true);
    setSyncError(null);
    try {
      await syncService.fullSync();
      setLastSyncTime(new Date());
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Sync failed';
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

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
