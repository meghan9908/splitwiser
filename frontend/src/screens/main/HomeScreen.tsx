import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const handleLogout = async () => {
    dispatch(logoutUser());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>Dashboard</Text>
        <Button 
          mode="outlined"
          icon="logout" 
          onPress={handleLogout}
        >
          Log Out
        </Button>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text variant="titleLarge">Welcome, {user?.name || 'User'}</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Here's your expense overview
          </Text>
        </View>

        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text variant="titleMedium">Total Balance</Text>
            <Text variant="headlineLarge" style={styles.balanceAmount}>
              $0.00
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            <Card.Content>
              <Text variant="bodyMedium">No recent activity</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>My Groups</Text>
          <Card style={styles.groupsCard}>
            <Card.Content>
              <Text variant="bodyMedium">No groups yet</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  balanceCard: {
    marginBottom: 20,
    elevation: 2,
  },
  balanceAmount: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  activityCard: {
    marginBottom: 16,
  },
  groupsCard: {
    marginBottom: 16,
  },
});

export default HomeScreen;
