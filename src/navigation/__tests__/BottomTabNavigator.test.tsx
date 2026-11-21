import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigator } from '../BottomTabNavigator';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../features/home/screens/HomeScreen', () => ({
  HomeScreen: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="mock-home-screen">
        <Text>Mock Home</Text>
      </View>
    );
  },
}));

jest.mock('../../features/ideas/screens/IdeasScreen', () => ({
  IdeasScreen: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="mock-ideas-screen">
        <Text>Mock Ideas</Text>
      </View>
    );
  },
}));

jest.mock('../../features/toolkit/screens/ToolkitScreen', () => ({
  ToolkitScreen: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="mock-toolkit-screen">
        <Text>Mock Toolkit</Text>
      </View>
    );
  },
}));

jest.mock('../../features/activity/screens/ActivityScreen', () => ({
  ActivityScreen: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="mock-activity-screen">
        <Text>Mock Activity</Text>
      </View>
    );
  },
}));

jest.mock('../../features/profile/screens/ProfileScreen', () => ({
  ProfileScreen: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="mock-profile-screen">
        <Text>Mock Profile</Text>
      </View>
    );
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 44, bottom: 34, left: 0, right: 0 };
  return {
    useSafeAreaInsets: () => insets,
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(insets),
    SafeAreaInsetsContext: React.createContext(insets),
  };
});

describe('BottomTabNavigator Component', () => {
  it('renders all four primary tabs and center validate button matching Arena', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      );
    });

    const root = renderer.root;

    // Verify all four tab labels are present in the DOM
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity);

    expect(textNodes).toContain('Home');
    expect(textNodes).toContain('Ideas');
    expect(textNodes).toContain('Toolkit');
    expect(textNodes).toContain('Profile');

    // Verify Center Validate Button is rendered with proper accessibility label
    const centerBtn = root.findByProps({
      accessibilityLabel: 'Validate new startup idea',
    });
    expect(centerBtn).toBeTruthy();

    await act(async () => {
      renderer.unmount();
    });
  });
});
