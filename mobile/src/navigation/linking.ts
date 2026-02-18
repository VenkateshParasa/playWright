import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '../types';

const prefix = Linking.createURL('/');

export const linkingConfiguration: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'pwlearning://', 'https://pwlearning.com', 'https://app.pwlearning.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
        },
      },
      Main: {
        screens: {
          Home: {
            screens: {
              Dashboard: 'dashboard',
              LessonDetail: 'lessons/:lessonId',
              QuizDetail: 'quizzes/:quizId',
              ExerciseDetail: 'exercises/:exerciseId',
            },
          },
          Lessons: {
            screens: {
              LessonList: 'lessons',
              LessonDetail: 'lessons/:lessonId',
              LessonPlayer: 'lessons/:lessonId/play',
            },
          },
          Flashcards: {
            screens: {
              FlashcardList: 'flashcards',
              FlashcardReview: 'flashcards/review',
              FlashcardStats: 'flashcards/stats',
            },
          },
          Quiz: {
            screens: {
              QuizList: 'quizzes',
              QuizDetail: 'quizzes/:quizId',
              QuizTaking: 'quizzes/:quizId/take',
              QuizResult: 'quizzes/results/:attemptId',
            },
          },
          Profile: {
            screens: {
              ProfileOverview: 'profile',
              Settings: 'settings',
              Progress: 'progress',
              Achievements: 'achievements',
              EditProfile: 'profile/edit',
            },
          },
        },
      },
      Onboarding: 'onboarding',
    },
  },
};
