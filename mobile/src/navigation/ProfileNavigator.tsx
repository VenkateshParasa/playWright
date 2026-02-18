import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import ProfileOverviewScreen from '../screens/Profile/ProfileOverviewScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ProgressScreen from '../screens/Profile/ProgressScreen';
import AchievementsScreen from '../screens/Profile/AchievementsScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="ProfileOverview"
        component={ProfileOverviewScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'My Progress' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ title: 'Achievements' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
