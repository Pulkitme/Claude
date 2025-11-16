/**
 * App Theme Configuration
 * Defines colors, fonts, and styles for the app
 */

import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const colors = {
  // Primary brand colors (warm, romantic tones)
  primary: '#FF6B9D',
  primaryDark: '#E55589',
  primaryLight: '#FFB3CD',

  // Secondary colors
  secondary: '#9C6EFF',
  secondaryLight: '#C5A8FF',

  // Accent colors
  accent: '#FF9F1C',
  love: '#FF4D6D',

  // Neutral colors
  background: '#FFF9FC',
  surface: '#FFFFFF',
  surfaceVariant: '#FFE5EC',

  // Text colors
  text: '#2D2D2D',
  textSecondary: '#666666',
  textLight: '#999999',

  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // UI colors
  border: '#E0E0E0',
  divider: '#F5F5F5',
  disabled: '#BDBDBD',

  // Gradients (for special UI elements)
  gradientStart: '#FF6B9D',
  gradientEnd: '#9C6EFF',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    onSurface: colors.text,
    outline: colors.border,
  },
  roundness: 12,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    color: colors.text,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    color: colors.text,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    color: colors.text,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: colors.text,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.text,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.primary,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
