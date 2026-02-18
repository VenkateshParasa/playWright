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

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show('Password reset link sent to your email', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {success
              ? 'Check your email for a password reset link'
              : "Enter your email and we'll send you a link to reset your password"}
          </Text>
        </View>

        {!success && (
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setError('');
              }}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="email"
            />

            <Button
              title="Send Reset Link"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
            />
          </View>
        )}

        <Button
          title={success ? 'Back to Login' : 'Cancel'}
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          fullWidth
          style={styles.backButton}
        />
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
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  backButton: {
    marginTop: 'auto',
  },
});

export default ForgotPasswordScreen;
