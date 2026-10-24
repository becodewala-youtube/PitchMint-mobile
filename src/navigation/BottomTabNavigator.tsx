import React from 'react';
import { StyleSheet, View, Pressable, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { IdeasScreen } from '../features/ideas/screens/IdeasScreen';
import { ActivityScreen } from '../features/activity/screens/ActivityScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { Icon } from '../components/Icon';
import { colors, spacing, typography, borderRadius } from '../theme';
import { MainTabParamList, RootStackNavigationProp } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const DummyValidateScreen: React.FC = () => (
  <View style={{ flex: 1, backgroundColor: colors.background.primary }} />
);

/**
 * Center 3D Validate Button matching Arena prototype:
 * - 54x54dp squircle with 18dp radius
 * - Signature 3D button styling (#5E17EB face with #3904A6 4px bottom edge)
 * - Elevated position floating above the tab bar line
 * - Violet glow shadow
 */
const CenterValidateButton: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={styles.centerButtonWrapper}>
      <Pressable
        onPress={() => {
          navigation.navigate('ValidateModal');
        }}
        style={({ pressed }) => [
          styles.centerButton,
          pressed && styles.centerButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Validate new startup idea"
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};

interface TabIconWithDotProps {
  name: 'home' | 'ideas' | 'activity' | 'profile';
  focused: boolean;
  label: string;
}

const TabItem: React.FC<TabIconWithDotProps> = ({ name, focused, label }) => {
  return (
    <View style={styles.tabItemContainer}>
      <Icon
        name={name}
        size={22}
        color={focused ? colors.brand.soft : colors.text.muted}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? '#FFFFFF' : colors.text.muted },
        ]}
      >
        {label}
      </Text>
      {/* Active dot indicator matching Arena */}
      <View
        style={[
          styles.activeDot,
          { opacity: focused ? 1 : 0 },
        ]}
      />
    </View>
  );
};

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? spacing.md : spacing.sm);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: 62 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: spacing.xs,
          elevation: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      {/* 1. Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem name="home" focused={focused} label="Home" />
          ),
        }}
      />

      {/* 2. Ideas Tab */}
      <Tab.Screen
        name="Ideas"
        component={IdeasScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem name="ideas" focused={focused} label="Ideas" />
          ),
        }}
      />

      {/* 3. Center Prominent Validate Action (Squircle 3D) */}
      <Tab.Screen
        name="ValidateTab"
        component={DummyValidateScreen}
        options={{
          tabBarButton: () => <CenterValidateButton />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            const parent = navigation.getParent<RootStackNavigationProp>();
            if (parent) {
              parent.navigate('ValidateModal');
            }
          },
        })}
      />

      {/* 4. Activity Tab (Replaces deferred Toolkit destination) */}
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem name="activity" focused={focused} label="Activity" />
          ),
        }}
      />

      {/* 5. Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem name="profile" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    gap: 3,
  },
  tabLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.medium,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand.primary,
    marginTop: 1,
  },
  centerButtonWrapper: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
    width: 66,
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: borderRadius.fab, // 18dp squircle
    backgroundColor: colors.brand.btn,
    borderBottomWidth: 4,
    borderBottomColor: colors.brand.btnEdge,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  centerButtonPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
    backgroundColor: '#4D10C7',
  },
});
