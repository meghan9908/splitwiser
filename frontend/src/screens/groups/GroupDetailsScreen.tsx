import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, FAB, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGroupExpenses } from '../../store/slices/expensesSlice';
import { fetchGroupDetails } from '../../store/slices/groupsSlice';
import { GroupsStackParamList } from '../../types';

type GroupDetailsScreenRouteProp = RouteProp<GroupsStackParamList, 'GroupDetails'>;
type GroupDetailsScreenNavigationProp = StackNavigationProp<GroupsStackParamList, 'GroupDetails'>;

const GroupDetailsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<GroupDetailsScreenNavigationProp>();
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const dispatch = useAppDispatch();
  
  const { groupId } = route.params;
  
  const { selectedGroup, isLoading: groupLoading } = useAppSelector(state => state.groups);
  const { expenses, isLoading: expensesLoading } = useAppSelector(state => state.expenses);

  useEffect(() => {
    // Fetch group details and expenses when the screen loads
    dispatch(fetchGroupDetails(groupId));
    dispatch(fetchGroupExpenses(groupId));
  }, [dispatch, groupId]);

  const handleAddExpense = () => {
    navigation.navigate('AddExpense', { groupId });
  };

  const handleGroupSettings = () => {
    navigation.navigate('GroupSettings', { groupId });
  };

  if (groupLoading && !selectedGroup) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.groupInfoCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.groupName}>{selectedGroup?.name}</Text>
            
            <View style={styles.groupInfoRow}>
              <Text variant="bodyMedium">
                {selectedGroup?.members?.length || 0} members · {selectedGroup?.currency || 'USD'}
              </Text>
              <TouchableOpacity onPress={handleGroupSettings}>
                <Text style={{ color: theme.colors.primary }}>Settings</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.expensesSection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Expenses</Text>
          </View>
          
          {expensesLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.expenseLoader} />
          ) : expenses.length > 0 ? (
            <Card style={styles.expensesCard}>
              <Card.Content>
                <List.Section>
                  {expenses.map((expense) => (
                    <List.Item
                      key={expense._id}
                      title={expense.description}
                      description={new Date(expense.date).toLocaleDateString()}
                      right={() => (
                        <Text variant="titleMedium" style={styles.expenseAmount}>
                          {expense.currency} {expense.amount.toFixed(2)}
                        </Text>
                      )}
                      left={() => (
                        <List.Icon
                          icon="receipt"
                          color={theme.colors.primary}
                        />
                      )}
                    />
                  ))}
                </List.Section>
              </Card.Content>
            </Card>
          ) : (
            <Card style={styles.expensesCard}>
              <Card.Content style={styles.emptyExpensesContent}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No expenses yet
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleAddExpense}
                  style={styles.addFirstExpenseButton}
                >
                  Add First Expense
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddExpense}
        color="white"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  groupInfoCard: {
    margin: 16,
    elevation: 2,
  },
  groupName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  groupInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expensesSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  expenseLoader: {
    marginVertical: 20,
  },
  expensesCard: {
    marginBottom: 80, // Space for FAB
  },
  expenseAmount: {
    fontWeight: '500',
  },
  emptyExpensesContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  addFirstExpenseButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default GroupDetailsScreen;
