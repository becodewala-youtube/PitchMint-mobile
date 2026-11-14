import React from 'react';
import { View, Text } from 'react-native';
import { IconName, IconRenderProps } from './types';
import { iconStyles } from './iconStyles';

export const renderNavigationIcon = (
  name: IconName,
  { s, stroke, color, style }: IconRenderProps
): React.ReactElement | null => {
  switch (name) {
    case 'home':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.52,
              height: s * 0.52,
              borderTopWidth: stroke,
              borderLeftWidth: stroke,
              borderColor: color,
              transform: [{ rotate: '45deg' }],
              marginTop: s * 0.1,
            }}
          />
          <View
            style={{
              width: s * 0.62,
              height: s * 0.44,
              borderBottomWidth: stroke,
              borderLeftWidth: stroke,
              borderRightWidth: stroke,
              borderColor: color,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
              marginTop: -s * 0.16,
            }}
          />
        </View>
      );

    case 'ideas':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.65,
              height: s * 0.8,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: 3,
              padding: 2,
              justifyContent: 'space-around',
            }}
          >
            <View style={{ height: stroke, width: '60%', backgroundColor: color, borderRadius: 1 }} />
            <View style={{ height: stroke, width: '80%', backgroundColor: color, borderRadius: 1 }} />
            <View style={{ height: stroke, width: '45%', backgroundColor: color, borderRadius: 1 }} />
          </View>
        </View>
      );

    case 'plus':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              position: 'absolute',
              width: s * 0.65,
              height: stroke + 0.6,
              backgroundColor: color,
              borderRadius: 1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              height: s * 0.65,
              width: stroke + 0.6,
              backgroundColor: color,
              borderRadius: 1,
            }}
          />
        </View>
      );

    case 'activity':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.78,
              height: s * 0.78,
              borderRadius: (s * 0.78) / 2,
              borderWidth: stroke,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: s * 0.16,
                width: stroke,
                height: s * 0.22,
                backgroundColor: color,
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: s * 0.16,
                width: s * 0.22,
                height: stroke,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      );

    case 'profile':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.38,
              height: s * 0.38,
              borderRadius: (s * 0.38) / 2,
              borderWidth: stroke,
              borderColor: color,
              marginBottom: 2,
            }}
          />
          <View
            style={{
              width: s * 0.72,
              height: s * 0.32,
              borderTopLeftRadius: s * 0.36,
              borderTopRightRadius: s * 0.36,
              borderTopWidth: stroke,
              borderLeftWidth: stroke,
              borderRightWidth: stroke,
              borderColor: color,
            }}
          />
        </View>
      );

    case 'chevronRight':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.35,
              height: s * 0.35,
              borderTopWidth: stroke + 0.4,
              borderRightWidth: stroke + 0.4,
              borderColor: color,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );

    case 'chevronLeft':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.35,
              height: s * 0.35,
              borderBottomWidth: stroke + 0.4,
              borderLeftWidth: stroke + 0.4,
              borderColor: color,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );

    case 'chevronDown':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.35,
              height: s * 0.35,
              borderBottomWidth: stroke + 0.4,
              borderRightWidth: stroke + 0.4,
              borderColor: color,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );

    case 'arrowRight':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              position: 'absolute',
              width: s * 0.55,
              height: stroke,
              backgroundColor: color,
              borderRadius: 1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: s * 0.18,
              width: s * 0.32,
              height: s * 0.32,
              borderTopWidth: stroke + 0.2,
              borderRightWidth: stroke + 0.2,
              borderColor: color,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );

    default:
      return null;
  }
};
