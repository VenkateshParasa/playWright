import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LessonStackParamList } from '../types';
import LessonListScreen from '../screens/Lessons/LessonListScreen';
import LessonDetailScreen from '../screens/Lessons/LessonDetailScreen';
import LessonPlayerScreen from '../screens/Lessons/LessonPlayerScreen';

const Stack = createStackNavigator<LessonStackParamList>();

const LessonNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="LessonList"
        component={LessonListScreen}
        options={{ title: 'Lessons' }}
      />
      <Stack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{ title: 'Lesson Details' }}
      />
      <Stack.Screen
        name="LessonPlayer"
        component={LessonPlayerScreen}
        options={{ title: 'Lesson', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default LessonNavigator;
