import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ValidateModalScreen } from '../features/validate/screens/ValidateModalScreen';
import { IdeaDetailsScreen } from '../features/ideas/screens/IdeaDetailsScreen';
import { AuthNavigator } from './AuthNavigator';
import { AuthLoadingScreen } from '../features/auth/screens/AuthLoadingScreen';
import { WelcomeScreen, OnboardingScreen } from '../features/onboarding';
import { RootStackParamList } from './types';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { hasCompletedOnboarding, isLoadingOnboarding } = useOnboarding();

  const isInitializing = isBootstrapping || isLoadingOnboarding;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      {isInitializing ? (
        // Session bootstrap state - prevents flash of auth or unauth screens
        <Stack.Screen
          name="AuthLoading"
          component={AuthLoadingScreen}
          options={{ animation: 'none' }}
        />
      ) : isAuthenticated ? (
        // Authenticated Session: Tab navigation & validation modal
        <>
          <Stack.Screen
            name="MainTabs"
            component={BottomTabNavigator}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="ValidateModal"
            component={ValidateModalScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="IdeaDetails"
            component={IdeaDetailsScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
        </>
      ) : !hasCompletedOnboarding ? (
        // First Launch Unauthenticated: Welcome & Onboarding
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ animation: 'fade' }}
          />
        </>
      ) : (
        // Subsequent Launch Unauthenticated: Directly to Auth screens
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ animation: 'fade' }}
        />
      )}
    </Stack.Navigator>
  );
};
