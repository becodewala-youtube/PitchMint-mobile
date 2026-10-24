import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { colors } from '../theme';

export type IconName =
  | 'home'
  | 'ideas'
  | 'plus'
  | 'activity'
  | 'profile'
  | 'wallet'
  | 'lightbulb'
  | 'fileText'
  | 'panelsTopLeft'
  | 'users'
  | 'messageSquare'
  | 'award'
  | 'crown'
  | 'zap'
  | 'search'
  | 'chevronRight'
  | 'chevronDown'
  | 'arrowRight'
  | 'check'
  | 'close'
  | 'sparkles'
  | 'mail'
  | 'bell'
  | 'shield'
  | 'help'
  | 'logOut'
  | 'pencil'
  | 'target'
  | 'trendingUp'
  | 'dollarSign'
  | 'filter'
  | 'layoutTemplate'
  | 'star'
  | 'lock'
  | 'eye'
  | 'eyeOff'
  | 'user';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

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

  switch (name) {
    case 'home':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
    case 'fileText':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'wallet':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'panelsTopLeft':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'award':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'search':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'chevronRight':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'chevronDown':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'check':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'sparkles':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'mail':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'bell':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'shield':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'pencil':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'lock':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'eye':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'arrowRight':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'filter':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
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
        <View style={[styles.center, { width: s, height: s }, style]}>
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

    case 'star':
      return (
        <View style={[styles.center, { width: s, height: s }, style]}>
          <Text style={{ fontSize: s, color, lineHeight: s + 2, textAlign: 'center' }}>
            ★
          </Text>
        </View>
      );

    default:
      return <View style={{ width: s, height: s }} />;
  }
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
