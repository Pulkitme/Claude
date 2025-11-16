/**
 * Auth Navigator
 * Authentication flow screens (Login, Register, Pairing)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from '../types';

// Import auth screens (to be created)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PairingScreen from '../screens/auth/PairingScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Pairing" component={PairingScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
