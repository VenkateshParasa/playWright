import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { QuizStackParamList } from '../types';
import QuizListScreen from '../screens/Quiz/QuizListScreen';
import QuizDetailScreen from '../screens/Quiz/QuizDetailScreen';
import QuizTakingScreen from '../screens/Quiz/QuizTakingScreen';
import QuizResultScreen from '../screens/Quiz/QuizResultScreen';

const Stack = createStackNavigator<QuizStackParamList>();

const QuizNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="QuizList" component={QuizListScreen} options={{ title: 'Quizzes' }} />
      <Stack.Screen
        name="QuizDetail"
        component={QuizDetailScreen}
        options={{ title: 'Quiz Details' }}
      />
      <Stack.Screen
        name="QuizTaking"
        component={QuizTakingScreen}
        options={{ title: 'Quiz', headerShown: false }}
      />
      <Stack.Screen
        name="QuizResult"
        component={QuizResultScreen}
        options={{ title: 'Results', headerLeft: () => null }}
      />
    </Stack.Navigator>
  );
};

export default QuizNavigator;
