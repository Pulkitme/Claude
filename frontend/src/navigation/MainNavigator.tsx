/**
 * Main Navigator
 * Bottom tab navigation for main app features
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from '../types';
import { colors, typography } from '../config/theme';

// Import main screens
import HubScreen from '../screens/hub/HubScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import ListsScreen from '../screens/lists/ListsScreen';
import QuestionsScreen from '../screens/questions/QuestionsScreen';
import MoreScreen from '../screens/more/MoreScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Hub':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Lists':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Questions':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          ...typography.h3,
        },
        headerTintColor: colors.text,
      })}
    >
      <Tab.Screen
        name="Hub"
        component={HubScreen}
        options={{ title: 'Our Hub' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Tab.Screen
        name="Lists"
        component={ListsScreen}
        options={{ title: 'Lists' }}
      />
      <Tab.Screen
        name="Questions"
        component={QuestionsScreen}
        options={{ title: 'Daily Q&A' }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
