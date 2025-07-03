import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/auth/useAuth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(''); // For form-specific errors

  const { login, isLoading, error: authError } = useAuth();

  useEffect(() => {
    if (authError) {
      // Assuming authError is an object with a message property or can be stringified
      const message = authError.message || (typeof authError === 'string' ? authError : 'Login failed. Please try again.');
      setLocalError(message);
    } else {
      setLocalError(''); // Clear local error if authError is cleared (e.g. on new attempt)
    }
  }, [authError]);


  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }
    setLocalError(''); // Clear previous local errors
    // AuthContext will set its own error if login fails.
    await login(email, password);
    // Navigation is handled by AppNavigator based on isAuthenticated state from useAuth
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {/* Display local errors (form validation) or auth errors */}
      {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
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
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={isLoading}>
        <Text style={styles.switchText}>Don't have an account? Sign Up</Text>
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

export default LoginScreen;
