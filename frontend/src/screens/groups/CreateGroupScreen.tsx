import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_CONFIG } from '../../config/config';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createGroup } from '../../store/slices/groupsSlice';
import { GroupsStackParamList } from '../../types';

type CreateGroupScreenNavigationProp = StackNavigationProp<GroupsStackParamList, 'CreateGroup'>;

const CreateGroupScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<CreateGroupScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { isLoading } = useAppSelector(state => state.groups);

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(APP_CONFIG.DEFAULT_CURRENCY);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }

    try {
      await dispatch(createGroup({ name, currency })).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create group:', error);
      setError('Failed to create group. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView}>
          <Text variant="headlineSmall" style={styles.header}>Create New Group</Text>

          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <TextInput
            label="Group Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            placeholder="e.g. Roommates, Trip to Paris, etc."
          />

          <TextInput
            label="Currency"
            value={currency}
            onChangeText={setCurrency}
            style={styles.input}
            mode="outlined"
            disabled={true}
            right={<TextInput.Icon icon="currency-usd" />}
          />

          <Text variant="bodySmall" style={styles.helperText}>
            Currency can't be changed after creating the group.
          </Text>

          <Button
            mode="contained"
            onPress={handleCreateGroup}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Create Group
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
    marginVertical: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  helperText: {
    marginTop: -8,
    marginBottom: 16,
    opacity: 0.7,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
});

export default CreateGroupScreen;
