import React from 'react';
import { Text, Pressable } from 'react-native';
import { IconBadge, Icon, IconName } from '../../../components';
import { colors, Tone } from '../../../theme';
import { styles } from '../screens/ProfileScreen.styles';

export interface SettingRowProps {
  icon: IconName;
  label: string;
  value?: string;
  tone?: Tone;
  danger?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  value,
  tone = 'gray',
  danger = false,
  right,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowContainer,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <IconBadge name={icon} tone={danger ? 'red' : tone} size={34} />
      <Text
        style={[
          styles.rowLabel,
          { color: danger ? colors.tones.red.text : colors.text.primary },
        ]}
      >
        {label}
      </Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {right ?? (!danger && <Icon name="chevronRight" size={14} color={colors.text.muted} />)}
    </Pressable>
  );
};
