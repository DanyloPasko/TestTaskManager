import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSync } from '../hooks/useSync';
import { Palette, useTheme } from '../theme/designSystem';

interface SyncIndicatorProps {
  showDetails?: boolean;
}

/**
 * Component that displays sync status and allows manual sync trigger
 */
export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ showDetails = false }) => {
  const { palette } = useTheme();
  const styles = useStyles(palette);
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
    if (!isOnline) {return '#f44336';}
    if (syncError) {return '#ff9800';}
    if (hasPendingChanges) {return '#ff9800';}
    return '#4caf50'; // Green - synced
  };

  const getStatusText = () => {
    if (!isOnline) {return 'Offline';}
    if (isSyncing) {return 'Syncing...';}
    if (syncError) {return 'Sync Error';}
    if (hasPendingChanges) {return `${pendingCount} pending`;}
    return 'Synced';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {isSyncing && <ActivityIndicator size="small" color={palette.primary} />}
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

const useStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      padding: 8,
      backgroundColor: palette.secondary,
      borderBottomColor: palette.text + '20',
      borderBottomWidth: 1,
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
      color: palette.text,
      flex: 1,
      fontWeight: '500',
    },
    detailsContainer: {
      marginTop: 8,
      gap: 4,
      paddingTop: 8,
      borderTopColor: palette.text + '10',
      borderTopWidth: 1,
    },
    detailText: {
      fontSize: 12,
      color: palette.text + 'aa',
    },
    errorText: {
      fontSize: 12,
      color: '#f44336',
    },
    syncButton: {
      marginTop: 4,
      padding: 8,
      backgroundColor: palette.primary,
      borderRadius: 4,
      alignItems: 'center',
    },
    syncButtonText: {
      color: palette.text === '#fff' ? '#121212' : '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });
