import { BackButton } from '@/components/BackButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const inputBackground = useThemeColor('background');
  const textColor = useThemeColor('text');
  const tintColor = useThemeColor('tint');

  const handleLogin = async () => {
    if (!email) return setError('Email is required');
    if (!password) return setError('Password is required');
    
    setError('');
    const success = await login(email, password);
    
    if (success) {
      router.replace('/(tabs)');
    } else {
      setError('Invalid email or password');
    }
  };
  return (
    <ThemedView style={styles.container}>
      <BackButton />
      <Image 
        source={require('@/assets/images/icon.png')} 
        style={styles.logo}
        contentFit="contain"
      />
      <ThemedText type="title" style={styles.title}>Log In</ThemedText>
      
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBackground, color: textColor }
        ]}
        placeholder="Email"
        placeholderTextColor="#9BA1A6"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBackground, color: textColor }
        ]}
        placeholder="Password"
        placeholderTextColor="#9BA1A6"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: tintColor }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Log In</ThemedText>
        )}
      </TouchableOpacity>
      
      <ThemedView style={styles.footer}>
        <ThemedText>Don't have an account? </ThemedText>
        <Link href="/signup" asChild>
          <TouchableOpacity>
            <ThemedText style={{ color: tintColor }}>Sign Up</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
});
