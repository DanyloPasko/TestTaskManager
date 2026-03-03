import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

/**
 * Hook to monitor network connectivity status
 * @returns Current network status with connection state
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(state => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...networkStatus,
    isOnline: networkStatus.isConnected === true && networkStatus.isInternetReachable !== false,
    isOffline: networkStatus.isConnected === false,
  };
};
