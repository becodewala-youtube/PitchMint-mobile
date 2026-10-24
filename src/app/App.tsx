import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppProviders } from './AppProviders';
import { RootNavigator } from '../navigation/RootNavigator';
import { navigationDarkTheme, colors } from '../theme';

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
