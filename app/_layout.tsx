import {
  Manrope_400Regular,
  Manrope_700Bold
} from '@expo-google-fonts/manrope';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Manrope: Manrope_400Regular,
    ManropeBold: Manrope_700Bold,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack screenOptions={{ 
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
          },
          headerTintColor: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',
          animation: 'slide_from_right',
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Log In' }} />
          <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
          <Stack.Screen name="email-signin" options={{ title: 'Sign In with Email' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
