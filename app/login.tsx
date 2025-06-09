import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    setError('');
    const success = await login('demo@example.com', 'password');
    
    if (success) {
      router.replace('/(tabs)');
    } else {
      setError('An error occurred while logging in');
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleEmailSignIn = () => {
    router.push('/email-signin');
  };
  
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('../assets/images/login-background.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      
      <SafeAreaView style={styles.content}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.appTitle}>Splitwiser</ThemedText>
        </View>
        
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>Get started</ThemedText>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.loginButtonText}>Log in</ThemedText>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={handleSignUp}
          >
            <ThemedText style={styles.signupButtonText}>Sign up</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.emailButton}
            onPress={handleEmailSignIn}
          >
            <ThemedText style={styles.emailButtonText}>Sign in with an email</ThemedText>
          </TouchableOpacity>
        </View>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121712', // Dark background from Figma design
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appTitle: {
    fontFamily: 'ManropeBold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'ManropeBold',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#4FD12B', // Green button from Figma
    height: 56,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loginButtonText: {
    fontFamily: 'ManropeBold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: '#2E3829', // Dark button from Figma
    height: 56,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  signupButtonText: {
    fontFamily: 'ManropeBold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emailButton: {
    backgroundColor: '#2E3829', // Dark button from Figma
    height: 56,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emailButtonText: {
    fontFamily: 'ManropeBold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  error: {
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 10,
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
