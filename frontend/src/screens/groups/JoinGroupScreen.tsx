import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { joinGroup } from '../../store/slices/groupsSlice';
import { GroupsStackParamList } from '../../types';

type JoinGroupScreenNavigationProp = StackNavigationProp<GroupsStackParamList, 'JoinGroup'>;

const JoinGroupScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<JoinGroupScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { isLoading, error: groupError } = useAppSelector(state => state.groups);

  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a join code');
      return;
    }

    try {
      setError(null); // Clear any previous errors
      await dispatch(joinGroup(joinCode)).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to join group:', error);
      
      // Handle different error formats
      let errorMessage = 'Invalid join code or you are already a member of this group.';
      
      if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof error.message === 'string' && error.message !== '[object Object]') {
          errorMessage = error.message;
        } else if ('details' in error && error.details) {
          try {
            // Try to parse the details if it's a stringified JSON
            const parsedDetails = typeof error.details === 'string' 
              ? JSON.parse(error.details) 
              : error.details;
            
            if (parsedDetails.detail) {
              errorMessage = Array.isArray(parsedDetails.detail) 
                ? parsedDetails.detail[0]?.msg || errorMessage
                : parsedDetails.detail;
            }
          } catch (e) {
            // If parsing fails, use the string representation
            errorMessage = String(error.details) || errorMessage;
          }
        }
      }
      
      setError(errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <Text variant="headlineSmall" style={styles.header}>Join Existing Group</Text>

            <Text variant="bodyMedium" style={styles.description}>
              Enter the join code shared by the group admin to become a member of their group.
            </Text>

            {(error || groupError) && (
              <HelperText type="error" visible={!!(error || groupError)}>
                {error || groupError}
              </HelperText>
            )}

            <TextInput
              label="Join Code"
              value={joinCode}
              onChangeText={setJoinCode}
              style={styles.input}
              mode="outlined"
              placeholder="Enter group join code"
              autoCapitalize="none"
            />

            <Button
              mode="contained"
              onPress={handleJoinGroup}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Join Group
            </Button>
          </View>
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
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginVertical: 20,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 20,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
});

export default JoinGroupScreen;
