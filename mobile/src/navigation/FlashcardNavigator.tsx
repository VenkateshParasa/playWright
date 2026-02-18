import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FlashcardStackParamList } from '../types';
import FlashcardListScreen from '../screens/Flashcards/FlashcardListScreen';
import FlashcardReviewScreen from '../screens/Flashcards/FlashcardReviewScreen';
import FlashcardStatsScreen from '../screens/Flashcards/FlashcardStatsScreen';

const Stack = createStackNavigator<FlashcardStackParamList>();

const FlashcardNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="FlashcardList"
        component={FlashcardListScreen}
        options={{ title: 'Flashcards' }}
      />
      <Stack.Screen
        name="FlashcardReview"
        component={FlashcardReviewScreen}
        options={{ title: 'Review', headerShown: false }}
      />
      <Stack.Screen
        name="FlashcardStats"
        component={FlashcardStatsScreen}
        options={{ title: 'Statistics' }}
      />
    </Stack.Navigator>
  );
};

export default FlashcardNavigator;
