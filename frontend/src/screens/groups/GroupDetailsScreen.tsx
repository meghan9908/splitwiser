import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, FAB, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_CONFIG } from '../../config/config';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGroupExpenses } from '../../store/slices/expensesSlice';
import { fetchGroupDetails } from '../../store/slices/groupsSlice';
import { Expense, GroupsStackParamList } from '../../types';

type GroupDetailsScreenRouteProp = RouteProp<GroupsStackParamList, 'GroupDetails'>;
type GroupDetailsScreenNavigationProp = StackNavigationProp<GroupsStackParamList, 'GroupDetails'>;

const GroupDetailsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<GroupDetailsScreenNavigationProp>();
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const dispatch = useAppDispatch();
  
  const { groupId } = route.params;
  
  const { selectedGroup, isLoading: groupLoading } = useAppSelector((state: any) => state.groups);
  const { expenses, isLoading: expensesLoading } = useAppSelector((state: any) => state.expenses);
  const { user } = useAppSelector((state: any) => state.auth);

  // Get category icons map
  const categoryIconMap = useMemo(() => {
    const map: Record<string, string> = {};
    APP_CONFIG.EXPENSE_CATEGORIES.forEach(cat => {
      map[cat.id] = cat.icon;
    });
    return map;
  }, []);

  // Calculate balances - simple implementation, can be expanded
  const balanceSummary = useMemo(() => {
    if (!expenses || !selectedGroup?.members) return { totalOwed: 0, totalOwing: 0 };

    const currentUserId = user?._id || '';
    let totalOwed = 0;
    let totalOwing = 0;

    expenses.forEach((expense: Expense) => {
      // Add null checks for payers and splits arrays
      if (!expense.payers || !expense.splits) return;

      // Check if current user paid
      const userPaid = expense.payers.find((p: { userId: string; amount: number }) => p.userId === currentUserId);
      const paidAmount = userPaid?.amount || 0;
      
      // Check what user owes
      const userSplit = expense.splits.find((s: { userId: string; amount: number }) => s.userId === currentUserId);
      const owedAmount = userSplit?.amount || 0;

      if (paidAmount > owedAmount) {
        // Others owe the user
        totalOwed += (paidAmount - owedAmount);
      } else if (owedAmount > paidAmount) {
        // User owes others
        totalOwing += (owedAmount - paidAmount);
      }
    });

    return { totalOwed, totalOwing };
  }, [expenses, selectedGroup, user]);

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    
    // If invalid date, return "Invalid Date"
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    // Format date for display
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderExpenseItem = (expense: Expense) => {
    // Make sure expense has all required properties
    if (!expense || !expense._id) {
      return null;
    }
    
    const categoryIcon = expense.category ? (categoryIconMap[expense.category] || '🔧') : '🔧'; // Default to wrench if category not found
    const description = expense.description || 'Unnamed expense';
    const date = expense.date || '';
    const amount = typeof expense.amount === 'number' ? expense.amount.toFixed(2) : '0.00';
    const currency = expense.currency || selectedGroup?.currency || 'USD';
    
    // Get paid by information - simplified version
    let paidByText = 'Unknown';
    if (expense.payers && expense.payers.length > 0) {
      const payer = expense.payers[0]; // Just get the first payer for simplicity
      const payerId = payer.userId;
      
      // Try to find the member name from the group
      if (selectedGroup && selectedGroup.members) {
        const memberInfo = selectedGroup.members.find((m: any) => m.userId === payerId);
        if (memberInfo && memberInfo.name) {
          paidByText = `Paid by ${memberInfo.name}`;
        } else if (payerId === user?._id) {
          paidByText = 'Paid by you';
        } else {
          paidByText = 'Paid by member';
        }
      }
    }
    
    return (
      <List.Item
        key={expense._id}
        title={description}
        description={formatDate(date)}
        descriptionNumberOfLines={1}
        titleStyle={styles.expenseTitle}
        onPress={() => {}} // Add navigation to expense details in future
        right={() => (
          <Text variant="titleMedium" style={styles.expenseAmount}>
            {currency} {amount}
          </Text>
        )}
        left={() => (
          <View style={styles.expenseIconContainer}>
            <Text style={styles.expenseIcon}>{categoryIcon}</Text>
          </View>
        )}
        style={styles.expenseItem}
      />
    );
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

        {/* Balance Summary Section - based on second image */}
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Summary</Text>
            
            <View style={styles.balanceRow}>
              <Text variant="bodyLarge">Total Owed</Text>
              <Text variant="bodyLarge" style={styles.positiveAmount}>
                {selectedGroup?.currency} {balanceSummary.totalOwed.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.balanceRow}>
              <Text variant="bodyLarge">Total Owing</Text>
              <Text variant="bodyLarge" style={styles.negativeAmount}>
                {selectedGroup?.currency} {balanceSummary.totalOwing.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.expensesSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Expenses</Text>
          
          {expensesLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.expenseLoader} />
          ) : expenses && expenses.length > 0 ? (
            <View style={styles.expensesList}>
              {Array.isArray(expenses) && 
                // Sort expenses by date (most recent first)
                [...expenses]
                  .sort((a: Expense, b: Expense) => {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                  })
                  .map((expense: Expense) => renderExpenseItem(expense))
              }
            </View>
          ) : (
            <Card style={styles.emptyCard}>
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
    borderRadius: 8,
  },
  balanceCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 8,
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
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    paddingLeft: 8,
  },
  expenseLoader: {
    marginVertical: 20,
  },
  expensesList: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 80, // Space for FAB
  },
  expenseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  expenseTitle: {
    fontWeight: '500',
    fontSize: 16,
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  expenseIcon: {
    fontSize: 18,
  },
  expenseAmount: {
    fontWeight: '500',
    alignSelf: 'center',
    color: '#000',
  },
  expensePaidBy: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyCard: {
    marginBottom: 80,
    borderRadius: 8,
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
    borderRadius: 28,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  positiveAmount: {
    color: 'green',
    fontWeight: '500',
  },
  negativeAmount: {
    color: 'red',
    fontWeight: '500',
  },
});

export default GroupDetailsScreen;
