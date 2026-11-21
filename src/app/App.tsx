import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { AppProviders } from './AppProviders';
import { RootNavigator } from '../navigation/RootNavigator';
import { navigationDarkTheme } from '../theme';

// Maintain native splash screen until secure storage & onboarding state settle
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Main application component.
 * Integrates:
 * - AppProviders (SafeArea + Error Boundary)
 * - NavigationContainer (PitchMint dark theme)
 * - RootNavigator (Bottom tabs + Validate modal stack)
 * - StatusBar (light icons for dark theme)
 */
export function App() {
  return (
    <AppProviders>
      <NavigationContainer theme={navigationDarkTheme}>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </AppProviders>
  );
}

export default App;
