import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  name?: string;
  email?: string;
}

interface Group {
  id: string;
  name: string;
  currency: string;
  members: GroupMember[];
}

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  onExpenseAdded: () => void;
}

interface SplitOption {
  type: 'equal' | 'exact' | 'percentage';
  label: string;
  icon: string;
}

const splitOptions: SplitOption[] = [
  { type: 'equal', label: 'Split equally', icon: 'people-outline' },
  { type: 'exact', label: 'Exact amounts', icon: 'calculator-outline' },
  { type: 'percentage', label: 'By percentage', icon: 'pie-chart-outline' },
];

export default function AddExpenseModal({ visible, onClose, group, onExpenseAdded }: AddExpenseModalProps) {
  const { accessToken, user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPayer, setSelectedPayer] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage'>('equal');
  const [loading, setLoading] = useState(false);
  const [showPayerSelector, setShowPayerSelector] = useState(false);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [showSplitOptions, setShowSplitOptions] = useState(false);
  const [memberDetails, setMemberDetails] = useState<{[userId: string]: {name: string, email: string}}>({});

  // Create members list from current user and group members
  const getGroupMembers = () => {
    const members = [];
    
    // Add current user first
    if (user) {
      const currentUserId = user.id || user._id || 'current-user';
      members.push({
        userId: currentUserId,
        name: memberDetails[currentUserId]?.name || user.name || 'You',
        email: memberDetails[currentUserId]?.email || user.email || '',
        isCurrentUser: true,
      });
    }
    
    // Add other group members (exclude current user if already in group.members)
    group.members.forEach((member) => {
      const memberUserId = member.userId;
      const isCurrentUser = user && (memberUserId === user.id || memberUserId === user._id);
      
      if (!isCurrentUser) {
        members.push({
          userId: memberUserId,
          name: memberDetails[memberUserId]?.name || `Member ${memberUserId.slice(-4)}`,
          email: memberDetails[memberUserId]?.email || `member@example.com`,
          isCurrentUser: false,
        });
      }
    });
    
    return members;
  };

  const groupMembers = getGroupMembers();
  const currentUserId = user?.id || user?._id || 'current-user';

  // Fetch member details when modal opens
  useEffect(() => {
    if (visible && accessToken) {
      fetchMemberDetails();
    }
  }, [visible, accessToken, group.id]);

  const fetchMemberDetails = async () => {
    try {
      const response = await axios.get(`/groups/${group.id}/members`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.members) {
        const details: {[userId: string]: {name: string, email: string}} = {};
        response.data.members.forEach((member: any) => {
          if (member.user) {
            details[member.userId] = {
              name: member.user.name || `Member ${member.userId.slice(-4)}`,
              email: member.user.email || 'member@example.com',
            };
          }
        });
        setMemberDetails(details);
      }
    } catch (error) {
      console.log('Could not fetch member details:', error);
      // Continue with basic member info if API not available
    }
  };

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setDescription('');
      setAmount('');
      setSelectedPayer(currentUserId);
      setSelectedMembers(new Set([currentUserId]));
      setSplitType('equal');
      setShowPayerSelector(false);
      setShowMemberSelector(false);
      setShowSplitOptions(false);
    }
  }, [visible, currentUserId]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedPayer) {
      Alert.alert('Error', 'Please select who paid');
      return;
    }

    if (selectedMembers.size === 0) {
      Alert.alert('Error', 'Please select who to split with');
      return;
    }

    setLoading(true);

    try {
      // Create splits array according to API format
      const splits = Array.from(selectedMembers).map(userId => ({
        userId,
        amount: numAmount / selectedMembers.size, // Equal split for now
        type: 'equal'
      }));

      const expenseData = {
        description: description.trim(),
        amount: numAmount,
        splits,
        splitType,
        tags: [], // Empty for now, can be enhanced later
        receiptUrls: [], // Empty for now, can be enhanced later
        // Note: paidBy might be handled differently by the API
        // For now, we'll let the API assume the creator paid
      };

      console.log('Creating expense:', expenseData);

      const response = await axios.post(`/groups/${group.id}/expenses`, expenseData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Expense created:', response.data);

      Alert.alert('Success', 'Expense added successfully!', [
        { text: 'OK', onPress: () => {
          onExpenseAdded();
          onClose();
        }}
      ]);
    } catch (error) {
      console.error('Error adding expense:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 405) {
          Alert.alert('Demo Mode', 'Expense API not available yet. This is a UI demo.', [
            { text: 'OK', onPress: () => {
              onExpenseAdded();
              onClose();
            }}
          ]);
        } else if (error.response?.data?.detail) {
          Alert.alert('Error', error.response.data.detail);
        } else {
          Alert.alert('Error', `Failed to add expense: ${error.message}`);
        }
      } else {
        Alert.alert('Error', 'Failed to add expense. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      if (newSelected.size > 1) { // Don't allow deselecting all members
        newSelected.delete(userId);
      }
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const getSelectedPayerName = () => {
    const payer = groupMembers.find(m => m.userId === selectedPayer);
    return payer?.name || 'Select payer';
  };

  const getSelectedMembersText = () => {
    if (selectedMembers.size === groupMembers.length) {
      return 'Everyone';
    }
    if (selectedMembers.size === 1) {
      const member = groupMembers.find(m => selectedMembers.has(m.userId));
      return member?.name || '1 person';
    }
    return `${selectedMembers.size} people`;
  };

  const getSplitOptionIcon = () => {
    const option = splitOptions.find(opt => opt.type === splitType);
    return option?.icon || 'people-outline';
  };

  const getSplitOptionLabel = () => {
    const option = splitOptions.find(opt => opt.type === splitType);
    return option?.label || 'Split equally';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.headerButton, !description.trim() || !amount || loading ? styles.disabledButton : null]}
            disabled={!description.trim() || !amount || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <Text style={[styles.saveText, !description.trim() || !amount ? styles.disabledText : null]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount Section */}
          <View style={styles.amountSection}>
            <View style={styles.currencyContainer}>
              <Text style={styles.currencyText}>{group.currency}</Text>
            </View>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              autoFocus={true}
            />
          </View>

          {/* Description */}
          <View style={styles.inputSection}>
            <View style={styles.inputRow}>
              <Ionicons name="receipt-outline" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="What was this expense for?"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Paid by */}
          <TouchableOpacity 
            style={styles.inputSection} 
            onPress={() => setShowPayerSelector(!showPayerSelector)}
          >
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={24} color="#666" style={styles.inputIcon} />
              <View style={styles.selectableInputContent}>
                <Text style={styles.inputLabel}>Paid by</Text>
                <Text style={styles.inputValue}>{getSelectedPayerName()}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Payer Selector */}
          {showPayerSelector && (
            <View style={styles.selectorContainer}>
              {groupMembers.map((member) => (
                <TouchableOpacity
                  key={member.userId}
                  style={styles.memberOption}
                  onPress={() => {
                    setSelectedPayer(member.userId);
                    setShowPayerSelector(false);
                  }}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  {selectedPayer === member.userId && (
                    <Ionicons name="checkmark" size={20} color="#2196F3" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Split with */}
          <TouchableOpacity 
            style={styles.inputSection} 
            onPress={() => setShowMemberSelector(!showMemberSelector)}
          >
            <View style={styles.inputRow}>
              <Ionicons name="people-outline" size={24} color="#666" style={styles.inputIcon} />
              <View style={styles.selectableInputContent}>
                <Text style={styles.inputLabel}>Split with</Text>
                <Text style={styles.inputValue}>{getSelectedMembersText()}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Member Selector */}
          {showMemberSelector && (
            <View style={styles.selectorContainer}>
              {groupMembers.map((member) => (
                <TouchableOpacity
                  key={member.userId}
                  style={styles.memberOption}
                  onPress={() => toggleMemberSelection(member.userId)}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  <View style={styles.checkbox}>
                    {selectedMembers.has(member.userId) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Split method */}
          <TouchableOpacity 
            style={styles.inputSection} 
            onPress={() => setShowSplitOptions(!showSplitOptions)}
          >
            <View style={styles.inputRow}>
              <Ionicons name={getSplitOptionIcon()} size={24} color="#666" style={styles.inputIcon} />
              <View style={styles.selectableInputContent}>
                <Text style={styles.inputLabel}>Split method</Text>
                <Text style={styles.inputValue}>{getSplitOptionLabel()}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Split Options */}
          {showSplitOptions && (
            <View style={styles.selectorContainer}>
              {splitOptions.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={styles.splitOption}
                  onPress={() => {
                    setSplitType(option.type);
                    setShowSplitOptions(false);
                  }}
                >
                  <Ionicons name={option.icon} size={24} color="#666" style={styles.optionIcon} />
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {splitType === option.type && (
                    <Ionicons name="checkmark" size={20} color="#2196F3" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Split Preview */}
          {selectedMembers.size > 0 && amount && parseFloat(amount) > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Split preview</Text>
              {Array.from(selectedMembers).map((userId) => {
                const member = groupMembers.find(m => m.userId === userId);
                const splitAmount = parseFloat(amount) / selectedMembers.size;
                return (
                  <View key={userId} style={styles.previewItem}>
                    <Text style={styles.previewMemberName}>{member?.name}</Text>
                    <Text style={styles.previewAmount}>
                      {group.currency} {splitAmount.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#ccc',
  },
  content: {
    flex: 1,
  },
  amountSection: {
    backgroundColor: 'white',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currencyContainer: {
    marginBottom: 8,
  },
  currencyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '300',
    color: '#1a1a1a',
    textAlign: 'center',
    minWidth: 200,
  },
  inputSection: {
    backgroundColor: 'white',
    marginTop: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectableInputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  inputValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  selectorContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#666',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  previewSection: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  previewMemberName: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  previewAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
});
