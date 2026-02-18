import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from '../types';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import LessonDetailScreen from '../screens/Lessons/LessonDetailScreen';
import QuizDetailScreen from '../screens/Quiz/QuizDetailScreen';
import ExerciseDetailScreen from '../screens/Exercises/ExerciseDetailScreen';

const Stack = createStackNavigator<HomeStackParamList>();

const HomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{ title: 'Lesson Details' }}
      />
      <Stack.Screen
        name="QuizDetail"
        component={QuizDetailScreen}
        options={{ title: 'Quiz Details' }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: 'Exercise Details' }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
