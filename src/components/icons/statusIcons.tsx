import React from 'react';
import { View, Text } from 'react-native';
import { IconName, IconRenderProps } from './types';
import { iconStyles } from './iconStyles';

export const renderStatusIcon = (
  name: IconName,
  { s, stroke, color, style }: IconRenderProps
): React.ReactElement | null => {
  switch (name) {
    case 'award':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.55,
              height: s * 0.55,
              borderRadius: (s * 0.55) / 2,
              borderWidth: stroke,
              borderColor: color,
            }}
          />
          <View
            style={{
              width: stroke,
              height: s * 0.25,
              backgroundColor: color,
              marginTop: -1,
            }}
          />
        </View>
      );

    case 'crown':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.72,
              height: s * 0.48,
              borderWidth: stroke,
              borderColor: color,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
              paddingHorizontal: 2,
            }}
          >
            <View style={{ width: stroke + 1, height: stroke + 1, borderRadius: 2, backgroundColor: color }} />
            <View style={{ width: stroke + 1, height: stroke + 1, borderRadius: 2, backgroundColor: color }} />
            <View style={{ width: stroke + 1, height: stroke + 1, borderRadius: 2, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'zap':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.35,
              height: s * 0.5,
              borderLeftWidth: stroke + 0.5,
              borderBottomWidth: stroke + 0.5,
              borderColor: color,
              transform: [{ skewX: '-20deg' }],
            }}
          />
        </View>
      );

    case 'check':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.52,
              height: s * 0.28,
              borderLeftWidth: stroke + 0.6,
              borderBottomWidth: stroke + 0.6,
              borderColor: color,
              transform: [{ rotate: '-45deg' }],
              marginTop: -s * 0.08,
            }}
          />
        </View>
      );

    case 'close':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              position: 'absolute',
              width: s * 0.65,
              height: stroke + 0.4,
              backgroundColor: color,
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: s * 0.65,
              height: stroke + 0.4,
              backgroundColor: color,
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </View>
      );

    case 'alertCircle':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.75,
              height: s * 0.75,
              borderRadius: (s * 0.75) / 2,
              borderWidth: stroke,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: stroke,
                height: s * 0.25,
                backgroundColor: color,
                borderRadius: 1,
                marginBottom: 2,
              }}
            />
            <View
              style={{
                width: stroke + 0.5,
                height: stroke + 0.5,
                borderRadius: 1,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      );

    case 'bell':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.55,
              height: s * 0.55,
              borderTopLeftRadius: s * 0.28,
              borderTopRightRadius: s * 0.28,
              borderWidth: stroke,
              borderColor: color,
            }}
          />
          <View style={{ width: s * 0.7, height: stroke, backgroundColor: color, marginTop: 1 }} />
        </View>
      );

    case 'star':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <Text style={{ fontSize: s, color, lineHeight: s + 2, textAlign: 'center' }}>
            ★
          </Text>
        </View>
      );

    case 'lock':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.46,
              height: s * 0.35,
              borderTopLeftRadius: s * 0.23,
              borderTopRightRadius: s * 0.23,
              borderWidth: stroke,
              borderColor: color,
              borderBottomWidth: 0,
              marginBottom: -1,
            }}
          />
          <View
            style={{
              width: s * 0.68,
              height: s * 0.46,
              borderRadius: 3,
              borderWidth: stroke,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 2.5,
                height: 4,
                backgroundColor: color,
                borderRadius: 1,
              }}
            />
          </View>
        </View>
      );

    default:
      return null;
  }
};
