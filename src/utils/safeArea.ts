import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';

const DEFAULT_INSETS: EdgeInsets = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * Safe area insets hook with automatic fallback to zero insets.
 * Works seamlessly with jest-expo mocks and real app runtime without throwing.
 */
export const useAppSafeArea = (): EdgeInsets => {
  try {
    return useSafeAreaInsets();
  } catch {
    return DEFAULT_INSETS;
  }
};
