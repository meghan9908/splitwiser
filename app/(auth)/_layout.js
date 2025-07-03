import React, { useContext } from 'react';
import { AuthContext } from '../../src/context/AuthContext'; // Adjust path
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function AuthLayout() {
  const { accessToken, isLoading, user } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (accessToken && user) {
    // User is logged in, redirect them away from auth screens to the main app.
    return <Redirect href="/(main)/home" />;
  }

  // User is not logged in, render the auth stack.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
