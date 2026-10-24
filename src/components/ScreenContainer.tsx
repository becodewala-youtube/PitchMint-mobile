import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  withHeaderOffset?: boolean;
  withTopGlow?: boolean;
}

/**
 * ScreenContainer provides consistent pure-black background,
 * subtle top violet glow (matching Arena Backdrop), and safe-area inset handling.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  withHeaderOffset = true,
  withTopGlow = true,
}) => {
  const insets = useSafeAreaInsets();

  const containerPaddingTop = withHeaderOffset
    ? Math.max(insets.top, spacing.md)
    : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }, style]}>
      {/* Arena subtle top violet radial glow */}
      {withTopGlow && (
        <View pointerEvents="none" style={styles.topGlow} />
      )}

      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: containerPaddingTop,
              paddingBottom: Math.max(insets.bottom, spacing.xl) + spacing.xxl + 10,
            },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.staticContent,
            {
              paddingTop: containerPaddingTop,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    left: '10%',
    right: '10%',
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
