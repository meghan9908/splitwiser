import { BackButton } from '@/components/BackButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function EmailSignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup, isLoading } = useAuth();

  const inputBackground = useThemeColor('background');
  const textColor = useThemeColor('text');
  const tintColor = useThemeColor('tint');

  const handleSubmit = async () => {
    if (!email) return setError('Email is required');
    if (!password) return setError('Password is required');
    
    setError('');
    let success;
    
    if (isSignUp) {
      success = await signup(email, password);
    } else {
      success = await login(email, password);
    }
    
    if (success) {
      router.replace('/(tabs)');
    } else {
      setError(isSignUp ? 'Failed to create account' : 'Invalid email or password');
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
      <ThemedText type="title" style={styles.title}>Sign in with Email</ThemedText>
      
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
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>
            {isSignUp ? 'Sign Up' : 'Log In'}
          </ThemedText>
        )}
      </TouchableOpacity>
      
      <ThemedView style={styles.footer}>
        <ThemedText>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </ThemedText>
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <ThemedText style={{ color: tintColor, marginLeft: 5 }}>
            {isSignUp ? 'Log In' : 'Sign Up'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.backLink}>
        <Link href="/" asChild>
          <TouchableOpacity>
            <ThemedText style={{ color: tintColor }}>Back to Home</ThemedText>
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
  backLink: {
    marginTop: 30,
  }
});
