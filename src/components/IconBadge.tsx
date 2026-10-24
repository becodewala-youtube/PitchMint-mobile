import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, Tone, borderRadius } from '../theme';
import { Icon, IconName } from './Icon';

interface IconBadgeProps {
  name: IconName;
  tone?: Tone;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Dedicated IconBadge matching the Arena prototype:
 * Renders a rounded-xl box with a tone background and border,
 * housing the icon in the corresponding tone color.
 */
export const IconBadge: React.FC<IconBadgeProps> = ({
  name,
  tone = 'violet',
  size = 40,
  style,
}) => {
  const t = colors.tones[tone] ?? colors.tones.violet;
  const iconSize = Math.round(size * 0.48);

  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          backgroundColor: t.bg,
          borderColor: t.border,
          borderRadius: size >= 40 ? borderRadius.lg : borderRadius.md,
        },
        style,
      ]}
    >
      <Icon name={name} size={iconSize} color={t.text} />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
