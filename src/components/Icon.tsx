import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme';
import { IconName, IconProps, IconRenderProps } from './icons/types';
import { renderNavigationIcon } from './icons/navigationIcons';
import { renderActionIcon } from './icons/actionIcons';
import { renderStatusIcon } from './icons/statusIcons';
import { renderMediaIcon } from './icons/mediaIcons';

export { IconName, IconProps };

/**
 * Lightweight, zero-dependency native vector icon component.
 * Reproduces the Arena Lucide-icon visual language cleanly with native primitives.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = colors.text.primary,
  style,
}) => {
  const s = size;
  const stroke = 1.8;
  const renderProps: IconRenderProps = { s, stroke, color, style };

  const rendered =
    renderNavigationIcon(name, renderProps) ??
    renderActionIcon(name, renderProps) ??
    renderStatusIcon(name, renderProps) ??
    renderMediaIcon(name, renderProps);

  if (rendered) {
    return rendered;
  }

  return (
    <View
      style={[
        {
          width: s,
          height: s,
          backgroundColor: '#374151',
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
};
