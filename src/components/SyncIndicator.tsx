import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSync } from '../hooks/useSync';

interface SyncIndicatorProps {
  showDetails?: boolean;
}

/**
 * Component that displays sync status and allows manual sync trigger
 */
export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ showDetails = false }) => {
  const {
    isOnline,
    isSyncing,
    hasPendingChanges,
    pendingCount,
    lastSyncTime,
    syncError,
    triggerSync,
  } = useSync();

  const getStatusColor = () => {
    if (!isOnline) return '#f44336';
    if (syncError) return '#ff9800';
    if (hasPendingChanges) return '#ff9800';
    return '#4caf50'; // Green - synced
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (syncError) return 'Sync Error';
    if (hasPendingChanges) return `${pendingCount} pending`;
    return 'Synced';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {isSyncing && <ActivityIndicator size="small" color="#666" />}
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          {lastSyncTime && (
            <Text style={styles.detailText}>
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </Text>
          )}
          {syncError && (
            <Text style={styles.errorText}>{syncError}</Text>
          )}
          {isOnline && !isSyncing && (
            <TouchableOpacity onPress={triggerSync} style={styles.syncButton}>
              <Text style={styles.syncButtonText}>Sync Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  detailsContainer: {
    marginTop: 8,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
  },
  syncButton: {
    marginTop: 4,
    padding: 8,
    backgroundColor: '#2196f3',
    borderRadius: 4,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
