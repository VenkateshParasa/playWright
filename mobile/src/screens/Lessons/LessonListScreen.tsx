import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { Card } from '../../components/common';

const LessonListScreen = () => {
  const theme = useTheme();

  const lessons = [
    { id: '1', title: 'Introduction to Playwright', category: 'Playwright', difficulty: 'beginner' },
    { id: '2', title: 'Selenium WebDriver Basics', category: 'Selenium', difficulty: 'beginner' },
    { id: '3', title: 'Advanced Locators', category: 'Testing', difficulty: 'intermediate' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={lessons}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card title={item.title} subtitle={item.category} onPress={() => {}}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Difficulty: {item.difficulty}
            </Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
});

export default LessonListScreen;
