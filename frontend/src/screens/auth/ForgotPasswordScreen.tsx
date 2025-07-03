import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiService } from '../../services/apiService';
import { AuthStackParamList } from '../../types';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await apiService.requestPasswordReset(email);
      setResetSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text variant="headlineLarge" style={styles.title}>Reset Password</Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Enter your email address to receive a password reset link
            </Text>
          </View>

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          {resetSent ? (
            <View style={styles.successContainer}>
              <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                Password reset link sent!
              </Text>
              <Text style={styles.instructions}>
                Please check your email for instructions to reset your password.
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Login')}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Return to Login
              </Button>
            </View>
          ) : (
            <>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                mode="outlined"
              />

              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Send Reset Link
              </Button>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.backToLoginContainer}
              >
                <Text style={{ color: theme.colors.primary }}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
  input: {
    marginVertical: 10,
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 15,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  instructions: {
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default ForgotPasswordScreen;
