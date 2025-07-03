import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../hooks/auth/useAuth';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { signup, isLoading, error: authError, isAuthenticated } = useAuth();

  useEffect(() => {
    if (authError) {
      const message = authError.message || (typeof authError === 'string' ? authError : 'Signup failed. Please try again.');
      setLocalError(message);
    } else {
      setLocalError('');
    }
  }, [authError]);

  // The API currently logs in the user directly after signup.
  // If signup is successful and user becomes authenticated, AppNavigator will handle redirection.
  // No explicit navigation here needed if isAuthenticated changes.
  // However, if the design was to return to Login, that would be different.
  // For now, assume signup leads to authenticated state.

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords don't match.");
      return;
    }
    setLocalError('');
    await signup(name, email, password);
    // If signup is successful, isAuthenticated will become true, and AppNavigator will switch.
    // If API design changes to not auto-login, then:
    // if (!authError && !isLoading && !isAuthenticated) { // Check !authError specifically for signup success without auto-login
    //   Alert.alert('Signup Successful', 'Please log in.');
    //   navigation.navigate('Login');
    // }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!isLoading}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Sign Up" onPress={handleSignup} />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
  switchText: {
    marginTop: 20,
    color: 'blue',
    fontSize: 16,
  },
});

export default SignupScreen;
