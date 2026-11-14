import React from 'react';
import { View, Text } from 'react-native';
import { IconName, IconRenderProps } from './types';
import { iconStyles } from './iconStyles';

export const renderMediaIcon = (
  name: IconName,
  { s, stroke, color, style }: IconRenderProps
): React.ReactElement | null => {
  switch (name) {
    case 'fileText':
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

    case 'panelsTopLeft':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.75,
              height: s * 0.75,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: 3,
              flexDirection: 'row',
            }}
          >
            <View style={{ width: '45%', borderRightWidth: stroke, borderColor: color }} />
            <View style={{ flex: 1 }}>
              <View style={{ height: '45%', borderBottomWidth: stroke, borderColor: color }} />
            </View>
          </View>
        </View>
      );

    case 'users':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: s * 0.45,
                height: s * 0.45,
                borderRadius: (s * 0.45) / 2,
                borderWidth: stroke,
                borderColor: color,
              }}
            />
            <View
              style={{
                width: s * 0.35,
                height: s * 0.35,
                borderRadius: (s * 0.35) / 2,
                borderWidth: stroke,
                borderColor: color,
                marginLeft: -3,
                opacity: 0.7,
              }}
            />
          </View>
        </View>
      );

    case 'messageSquare':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.72,
              height: s * 0.62,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: 3,
            }}
          />
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: 4,
              borderTopColor: color,
              borderRightWidth: 4,
              borderRightColor: 'transparent',
              alignSelf: 'flex-start',
              marginLeft: s * 0.2,
              marginTop: -1,
            }}
          />
        </View>
      );

    case 'mail':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.72,
              height: s * 0.52,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: 2,
            }}
          />
        </View>
      );

    case 'shield':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.6,
              height: s * 0.65,
              borderWidth: stroke,
              borderColor: color,
              borderBottomLeftRadius: s * 0.3,
              borderBottomRightRadius: s * 0.3,
            }}
          />
        </View>
      );

    case 'help':
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
            <View style={{ width: stroke + 1, height: stroke + 1, borderRadius: 2, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'logOut':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.6,
              height: s * 0.65,
              borderTopWidth: stroke,
              borderBottomWidth: stroke,
              borderLeftWidth: stroke,
              borderColor: color,
              borderRadius: 2,
            }}
          />
        </View>
      );

    case 'eye':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.75,
              height: s * 0.42,
              borderRadius: s * 0.3,
              borderWidth: stroke,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: s * 0.22,
                height: s * 0.22,
                borderRadius: s * 0.11,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      );

    case 'eyeOff':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.75,
              height: s * 0.42,
              borderRadius: s * 0.3,
              borderWidth: stroke,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: s * 0.2,
                height: s * 0.2,
                borderRadius: s * 0.1,
                backgroundColor: color,
              }}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              width: s * 0.85,
              height: stroke,
              backgroundColor: color,
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </View>
      );

    case 'user':
      return (
        <View style={[iconStyles.center, { width: s, height: s }, style]}>
          <View
            style={{
              width: s * 0.36,
              height: s * 0.36,
              borderRadius: s * 0.18,
              borderWidth: stroke,
              borderColor: color,
              marginBottom: 2,
            }}
          />
          <View
            style={{
              width: s * 0.65,
              height: s * 0.3,
              borderTopLeftRadius: s * 0.25,
              borderTopRightRadius: s * 0.25,
              borderWidth: stroke,
              borderColor: color,
              borderBottomWidth: 0,
            }}
          />
        </View>
      );

    default:
      return null;
  }
};
