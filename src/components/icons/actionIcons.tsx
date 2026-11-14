import React from 'react';
import { View, Text } from 'react-native';
import { IconName, IconRenderProps } from './types';
import { iconStyles } from './iconStyles';

export const renderActionIcon = (
  name: IconName,
  { s, stroke, color, style }: IconRenderProps
): React.ReactElement | null => {
  switch (name) {
    case 'search':
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
              width: stroke + 0.5,
              height: s * 0.25,
              backgroundColor: color,
              transform: [{ rotate: '-45deg' }],
              marginTop: -2,
              marginLeft: s * 0.4,
            }}
          />
        </View>
      );

    case 'wallet':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.78,
              height: s * 0.6,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: 3,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: 2,
            }}
          >
            <View style={{ width: s * 0.18, height: s * 0.18, borderRadius: 2, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'lightbulb':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.6,
              height: s * 0.6,
              borderRadius: (s * 0.6) / 2,
              borderWidth: stroke,
              borderColor: color,
            }}
          />
          <View
            style={{
              width: s * 0.32,
              height: s * 0.2,
              borderBottomWidth: stroke,
              borderLeftWidth: stroke,
              borderRightWidth: stroke,
              borderColor: color,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
              marginTop: -2,
            }}
          />
        </View>
      );

    case 'sparkles':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.45,
              height: s * 0.45,
              backgroundColor: color,
              transform: [{ rotate: '45deg' }],
              borderRadius: 2,
            }}
          />
        </View>
      );

    case 'pencil':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.25,
              height: s * 0.6,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: 1,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );

    case 'target':
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
                width: s * 0.32,
                height: s * 0.32,
                borderRadius: (s * 0.32) / 2,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      );

    case 'trendingUp':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.65,
              height: s * 0.45,
              borderBottomWidth: stroke + 0.5,
              borderRightWidth: stroke + 0.5,
              borderColor: color,
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </View>
      );

    case 'dollarSign':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.4,
              height: s * 0.6,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: 4,
            }}
          />
        </View>
      );

    case 'filter':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.7,
              height: stroke,
              backgroundColor: color,
              borderRadius: 1,
              marginBottom: 2.5,
            }}
          />
          <View
            style={{
              width: s * 0.45,
              height: stroke,
              backgroundColor: color,
              borderRadius: 1,
              marginBottom: 2.5,
            }}
          />
          <View
            style={{
              width: s * 0.2,
              height: stroke,
              backgroundColor: color,
              borderRadius: 1,
            }}
          />
        </View>
      );

    case 'layoutTemplate':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.75,
              height: s * 0.75,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: 2,
            }}
          >
            <View style={{ height: '35%', borderBottomWidth: stroke, borderColor: color }} />
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ width: '45%', borderRightWidth: stroke, borderColor: color }} />
            </View>
          </View>
        </View>
      );

    default:
      return null;
  }
};
