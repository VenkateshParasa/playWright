import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from '../types';
import HomeNavigator from './HomeNavigator';
import LessonNavigator from './LessonNavigator';
import FlashcardNavigator from './FlashcardNavigator';
import QuizNavigator from './QuizNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: theme.fonts.medium,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Lessons"
        component={LessonNavigator}
        options={{
          tabBarLabel: 'Lessons',
          tabBarIcon: ({ color, size }) => <Icon name="book-open" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Flashcards"
        component={FlashcardNavigator}
        options={{
          tabBarLabel: 'Flashcards',
          tabBarIcon: ({ color, size }) => <Icon name="cards" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizNavigator}
        options={{
          tabBarLabel: 'Quiz',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="account" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
