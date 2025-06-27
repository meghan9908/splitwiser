import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; currency: string; imageUrl?: string }) => void;
}

export default function CreateGroupModal({ visible, onClose, onSubmit }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Error', 'Group name must be at least 2 characters long');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        currency: currency,
      });
      handleClose();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCurrency('USD');
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Group</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={32} color="#2196F3" />
            </View>
          </View>

          <Text style={styles.subtitle}>
            Create a new group to start splitting expenses with your friends!
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Group Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Vacation Crew, Apartment Mates"
                value={name}
                onChangeText={setName}
                maxLength={50}
                returnKeyType="next"
                autoFocus
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.currencyContainer}>
                {currencies.map((curr) => (
                  <TouchableOpacity
                    key={curr.code}
                    style={[
                      styles.currencyOption,
                      currency === curr.code && styles.selectedCurrency,
                    ]}
                    onPress={() => setCurrency(curr.code)}
                  >
                    <Text style={[
                      styles.currencySymbol,
                      currency === curr.code && styles.selectedCurrencyText,
                    ]}>
                      {curr.symbol}
                    </Text>
                    <Text style={[
                      styles.currencyCode,
                      currency === curr.code && styles.selectedCurrencyText,
                    ]}>
                      {curr.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                (!name.trim() || loading) && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!name.trim() || loading}
            >
              {loading ? (
                <Text style={styles.createButtonText}>Creating...</Text>
              ) : (
                <Text style={styles.createButtonText}>Create Group</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color="#2196F3" />
            <Text style={styles.infoText}>
              You'll be able to add members and start tracking expenses after creating the group.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  descriptionInput: {
    height: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
  },
  selectedCurrency: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 4,
  },
  currencyCode: {
    fontSize: 14,
    color: '#666',
  },
  selectedCurrencyText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    backgroundColor: '#2196F3',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
