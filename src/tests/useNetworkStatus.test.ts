import { renderHook } from '@testing-library/react-hooks';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');

describe('useNetworkStatus', () => {
  const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial network state', async () => {
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    } as any);

    mockNetInfo.addEventListener.mockReturnValue(() => {});

    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());

    await waitForNextUpdate();

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should detect offline state', async () => {
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    } as any);

    mockNetInfo.addEventListener.mockReturnValue(() => {});

    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());

    await waitForNextUpdate();

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('should subscribe to network changes', () => {
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    } as any);

    const unsubscribeMock = jest.fn();
    mockNetInfo.addEventListener.mockReturnValue(unsubscribeMock);

    const { unmount } = renderHook(() => useNetworkStatus());

    expect(mockNetInfo.addEventListener).toHaveBeenCalled();

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('should handle null connection state', async () => {
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: null,
      isInternetReachable: null,
      type: 'unknown',
    } as any);

    mockNetInfo.addEventListener.mockReturnValue(() => {});

    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());

    await waitForNextUpdate();

    expect(result.current.isConnected).toBe(null);
    expect(result.current.isOnline).toBe(false);
  });
});
