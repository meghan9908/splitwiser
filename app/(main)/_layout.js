import React, { useContext } from 'react';
import { AuthContext } from '../../src/context/AuthContext'; // Adjust path
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../src/context/AuthContext'; // Using the custom hook

export default function MainAppLayout() {
  const { accessToken, isLoading, user, logout } = useAuth(); // Use the hook

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!accessToken || !user) {
    // User is not logged in, redirect them to the login screen.
    return <Redirect href="/(auth)/login" />;
  }

  // User is logged in, render the main app stack.
  return (
    <Stack>
      <Stack.Screen
        name="home" // This will correspond to app/(main)/home.js
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <Button onPress={logout} title="Logout" color="#c00" />
          ),
        }}
      />
      {/* Add other main app screens here */}
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
