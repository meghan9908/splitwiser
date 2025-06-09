import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, useFonts } from "@expo-google-fonts/manrope";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { AuthProvider } from "../context/AuthContext";
import { useProtectedRoute } from "../context/ProtectedRoute";

function RootLayoutNav() {
  // Use the route guard to protect routes
  useProtectedRoute();

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#121712" }
      }} />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
