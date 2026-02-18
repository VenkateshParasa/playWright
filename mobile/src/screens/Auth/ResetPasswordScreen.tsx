import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../constants/theme';
import { Button, Input } from '../../components/common';
import { authService } from '../../services';
import { AuthStackParamList } from '../../types';
import Toast from 'react-native-root-toast';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { token } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show('Password reset successful', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      navigation.navigate('Login');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show(error.message || 'Failed to reset password', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter your new password
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            secureTextEntry
            icon="lock"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
            secureTextEntry
            icon="lock-check"
          />

          <Button
            title="Reset Password"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 24,
  },
});

export default ResetPasswordScreen;
