import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { Card } from '../../components/common';
import { useAppSelector } from '../../hooks';

const DashboardScreen = () => {
  const theme = useTheme();
  const { user } = useAppSelector(state => state.auth);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Welcome back, {user?.firstName}!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Continue your learning journey
          </Text>
        </View>

        <Card title="Today's Progress" icon="chart-line" elevated>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>3</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Lessons
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>15</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Flashcards
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>2</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Quizzes
              </Text>
            </View>
          </View>
        </Card>

        <Card title="Current Streak" icon="fire" elevated>
          <Text style={[styles.streakText, { color: theme.colors.text }]}>
            7 days in a row!
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DashboardScreen;
