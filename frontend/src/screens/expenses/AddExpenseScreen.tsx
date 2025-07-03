import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_CONFIG } from '../../config/config';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createExpense } from '../../store/slices/expensesSlice';
import { GroupsStackParamList } from '../../types';

type AddExpenseScreenRouteProp = RouteProp<GroupsStackParamList, 'AddExpense'>;
type AddExpenseScreenNavigationProp = StackNavigationProp<GroupsStackParamList, 'AddExpense'>;

const AddExpenseScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<AddExpenseScreenNavigationProp>();
  const route = useRoute<AddExpenseScreenRouteProp>();
  const dispatch = useAppDispatch();
  
  const { groupId } = route.params;
  
  const group = useAppSelector(state => 
    state.groups.groups.find(g => g._id === groupId)
  );
  
  const { isLoading } = useAppSelector(state => state.expenses);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  const [error, setError] = useState<string | null>(null);

  const categories = APP_CONFIG.EXPENSE_CATEGORIES;

  // This is a simplified version - in a real app, you'd have more complex UI for payers and splits
  const handleCreateExpense = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // In a real app, you'd get the actual users from the group
    // This is just a placeholder implementation for now
    const numericAmount = parseFloat(amount);
    
    try {
      // Assuming the current user is the only payer in this simplified version
      const payerId = "current_user_id"; // This would come from auth context in real app
      
      // Create equal splits for all members (simplified)
      const members = group?.members || [];
      const splitAmount = numericAmount / Math.max(members.length, 1);
      
      const expenseData = {
        description,
        amount: numericAmount,
        category,
        date,
        payers: [{ userId: payerId, amount: numericAmount }],
        splits: members.map(member => ({
          userId: member.userId,
          amount: splitMethod === 'equal' ? splitAmount : 0 // In real app, custom splits would be handled
        }))
      };

      await dispatch(createExpense({ groupId, expenseData })).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create expense:', error);
      setError('Failed to create expense. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView}>
          <Text variant="headlineSmall" style={styles.header}>Add New Expense</Text>

          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            placeholder="e.g. Dinner, Movie tickets, etc."
          />

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            mode="outlined"
            placeholder="0.00"
            left={<TextInput.Affix text={group?.currency || 'USD'} />}
          />

          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Category</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    selected={category === cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={styles.categoryChip}
                    showSelectedOverlay
                    icon={() => <Text>{cat.icon}</Text>}
                  >
                    {cat.name}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Split Method</Text>
            
            <SegmentedButtons
              value={splitMethod}
              onValueChange={(value) => setSplitMethod(value as 'equal' | 'custom')}
              buttons={[
                { value: 'equal', label: 'Split Equally' },
                { value: 'custom', label: 'Custom Split' },
              ]}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleCreateExpense}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Save Expense
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '500',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  categoryChip: {
    margin: 4,
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 8,
  },
});

export default AddExpenseScreen;
