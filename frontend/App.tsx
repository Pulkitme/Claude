/**
 * OURS App - Main Entry Point
 * React Native app with Expo
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { theme } from './src/config/theme';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
