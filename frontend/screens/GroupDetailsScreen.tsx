import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AddExpenseModal from '../components/AddExpenseModal';
import { useAuth } from '../contexts/AuthContext';

interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

interface Group {
  id: string;
  name: string;
  currency: string;
  joinCode: string;
  createdBy: string;
  createdAt: string;
  imageUrl?: string;
  members: GroupMember[];
}

interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
  type?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency?: string;
  paidBy?: string;
  splits: ExpenseSplit[];
  splitType: string;
  createdAt: string;
  groupId: string;
  createdBy: string;
  tags?: string[];
  receiptUrls?: string[];
}

interface GroupDetailsScreenProps {
  route: {
    params: {
      groupId: string;
    };
  };
  navigation: any;
}

export default function GroupDetailsScreen({ route, navigation }: GroupDetailsScreenProps) {
  const { groupId } = route.params;
  const { accessToken } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
    fetchExpenses();
  }, []);

  const fetchGroupDetails = async () => {
    if (!accessToken) return;

    try {
      const response = await axios.get(`/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.data) {
        const groupData = {
          ...response.data,
          id: response.data.id || response.data._id,
        };
        setGroup(groupData);
        navigation.setOptions({ title: groupData.name });
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          Alert.alert('Error', 'Group not found', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else if (error.response?.status === 401) {
          Alert.alert('Error', 'Please log in again');
        } else {
          Alert.alert('Error', 'Failed to load group details');
        }
      }
    }
  };

  const fetchExpenses = async () => {
    if (!accessToken) return;

    try {
      const response = await axios.get(`/groups/${groupId}/expenses`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('Fetched expenses:', response.data);

      if (response.data && response.data.expenses) {
        // Normalize the expenses data
        const normalizedExpenses = response.data.expenses.map((expense: any) => ({
          ...expense,
          id: expense.id || expense._id,
          splits: expense.splits || [],
          currency: expense.currency || group?.currency || 'USD',
        }));
        setExpenses(normalizedExpenses);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle direct array response
        const normalizedExpenses = response.data.map((expense: any) => ({
          ...expense,
          id: expense.id || expense._id,
          splits: expense.splits || [],
          currency: expense.currency || group?.currency || 'USD',
        }));
        setExpenses(normalizedExpenses);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 405) {
          // Expense API not implemented yet, use mock data for demo
          setExpenses([
            {
              id: '1',
              description: 'Dinner at restaurant',
              amount: 150.00,
              currency: group?.currency || 'USD',
              paidBy: 'You',
              splits: [
                { userId: 'user1', amount: 75 },
                { userId: 'user2', amount: 75 }
              ],
              splitType: 'equal',
              createdAt: new Date().toISOString(),
              groupId: groupId,
              createdBy: 'current-user',
            },
            {
              id: '2',
              description: 'Groceries',
              amount: 85.50,
              currency: group?.currency || 'USD',
              paidBy: 'John',
              splits: [
                { userId: 'user1', amount: 28.5 },
                { userId: 'user2', amount: 28.5 },
                { userId: 'user3', amount: 28.5 }
              ],
              splitType: 'equal',
              createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              groupId: groupId,
              createdBy: 'member-1',
            }
          ]);
        } else if (error.response?.status === 404) {
          // No expenses yet
          setExpenses([]);
        } else {
          console.error('Unexpected error fetching expenses:', error);
          setExpenses([]);
        }
      } else {
        setExpenses([]);
      }
      // Don't show error alert for expenses as they might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchGroupDetails(), fetchExpenses()]);
    setRefreshing(false);
  };

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const handleExpenseAdded = () => {
    // Refresh expenses after adding a new one
    fetchExpenses();
  };

  const handleSettleUp = () => {
    // TODO: Navigate to settle up screen
    Alert.alert('Settle Up', 'Navigate to settle up screen (TODO)');
  };

  const handleGroupSettings = () => {
    navigation.navigate('GroupSettings', { groupId, group });
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    const splitCount = item.splits ? item.splits.length : 0;
    
    return (
      <TouchableOpacity style={styles.expenseCard} activeOpacity={0.7}>
        <View style={styles.expenseIcon}>
          <Ionicons name="receipt-outline" size={24} color="#2196F3" />
        </View>
        
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <Text style={styles.expenseDate}>{date}</Text>
          <Text style={styles.expenseSplit}>
            Split among {splitCount} member{splitCount !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={styles.expenseAmount}>
          <Text style={styles.amountText}>
            {item.currency || group?.currency} {item.amount.toFixed(2)}
          </Text>
          <Text style={styles.paidByText}>Paid by {item.paidBy || 'Unknown'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupSummary = () => {
    if (!group) return null;

    const totalExpenses = expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    const memberCount = group.members.length;

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.groupAvatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {group.imageUrl || group.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.groupMainInfo}>
            <Text style={styles.groupNameLarge}>{group.name}</Text>
            <Text style={styles.groupMetaInfo}>
              {memberCount} member{memberCount !== 1 ? 's' : ''} • {group.currency}
            </Text>
            <Text style={styles.joinCodeText}>Join code: {group.joinCode}</Text>
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{group.currency} {totalExpenses.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total expenses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{expenses.length}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {group.currency} {memberCount > 0 ? (totalExpenses / memberCount).toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.statLabel}>Per person</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddExpense}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.actionButtonText}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.settleButton]} onPress={handleSettleUp}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.actionButtonText, styles.settleButtonText]}>Settle Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyExpenses = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Expenses Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first expense to start tracking group spending!
      </Text>
      <TouchableOpacity style={styles.addFirstExpenseButton} onPress={handleAddExpense}>
        <Text style={styles.addFirstExpenseButtonText}>Add First Expense</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !group) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderGroupSummary()}

        <View style={styles.expensesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {expenses.length > 0 && (
              <TouchableOpacity onPress={() => {/* TODO: View all expenses */}}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {expenses.length === 0 ? (
            renderEmptyExpenses()
          ) : (
            <FlatList
              data={expenses.slice(0, 5)} // Show only recent 5
              renderItem={renderExpenseItem}
              keyExtractor={(item: Expense) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Header Right Button */}
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={handleGroupSettings}
      >
        <Ionicons name="settings-outline" size={24} color="#2196F3" />
      </TouchableOpacity>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add Expense Modal */}
      {group && (
        <AddExpenseModal
          visible={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
          group={group}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  groupAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarTextLarge: {
    fontSize: 28,
  },
  groupMainInfo: {
    flex: 1,
  },
  groupNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  groupMetaInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  joinCodeText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  settleButtonText: {
    color: '#4CAF50',
  },
  expensesSection: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  viewAllText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  expenseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  expenseSplit: {
    fontSize: 12,
    color: '#999',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paidByText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstExpenseButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstExpenseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
