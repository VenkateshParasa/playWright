import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { logout } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileOverviewScreen = () => {
  const theme = useTheme();
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => dispatch(logout())}
        >
          <Icon name="logout" size={24} color={theme.colors.error} />
          <Text style={[styles.menuText, { color: theme.colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuText: { fontSize: 16, marginLeft: 16 },
});

export default ProfileOverviewScreen;
