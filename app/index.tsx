import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const tintColor = useThemeColor('tint');
  const buttonBgLight = '#4CAF50'; // Green color for the login button
  const bgColor = useThemeColor('background');

  return (
    <ThemedView style={styles.container}>
      {/* Hero Image Circle */}
      <View style={styles.heroContainer}>
        <Image 
          source={require('@/assets/images/icon.png')}
          style={styles.heroImage}
          contentFit="contain"
        />
      </View>

      <ThemedText type="title" style={styles.title}>Splitwiser</ThemedText>
      
      <ThemedText style={styles.subtitle}>Get started</ThemedText>

      <ThemedView style={styles.buttonContainer}>
        <Link href="/login" asChild>
          <TouchableOpacity style={[styles.button, { backgroundColor: buttonBgLight }]}>
            <ThemedText style={styles.buttonText}>Log in</ThemedText>
          </TouchableOpacity>
        </Link>
        
        <Link href="/signup" asChild>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' }]}>
            <ThemedText style={styles.buttonText}>Sign up</ThemedText>
          </TouchableOpacity>
        </Link>
        
        <Link href="/email-signin" asChild>
          <TouchableOpacity style={[styles.outlineButton, { borderColor: tintColor }]}>
            <ThemedText style={{ color: tintColor }}>Sign in with an email</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#111'
  },
  heroContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#68a193', // Light teal color for the hero circle
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  heroImage: {
    width: '80%',
    height: '80%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  subtitle: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    width: '100%',
    padding: 15,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
