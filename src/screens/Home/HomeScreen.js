import React from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/auth/useAuth';

const HomeScreen = () => {
  const { user, logout, isLoading } = useAuth(); // isLoading here might refer to general auth loading, or login/signup
                                               // For a specific logout loading state, useAuth would need to provide it
                                               // or manage it locally in this component if preferred.

  const handleLogout = async () => {
    await logout();
    // AppNavigator will handle redirection based on isAuthenticated state change.
  };

  // The MainNavigator already has a logout button in the header.
  // This button is redundant if that header button is the primary logout mechanism.
  // Keeping it for now as an example of calling logout from within a screen.
  // Also, AppNavigator should prevent this screen from rendering if not authenticated.
  // The isLoading from useAuth primarily covers initial load, login, signup.

  if (isLoading && !user) { // Show loader if auth state is loading and no user yet (e.g. initial app load)
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
  }

  if (!user) { // Should ideally not happen if AppNavigator works correctly
      return (
          <View style={styles.container}>
              <Text>Error: No user data. You might be logged out.</Text>
              {/* Optionally, provide a button to try navigating to login or refresh */}
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Splitwiser!</Text>
      <Text style={styles.userInfo}>Logged in as: {user.name} ({user.email})</Text>
      {/*isLoading from useAuth() might be true during login/signup, not necessarily logout specific loading*/}
      {/*<Button title="Logout (Screen)" onPress={handleLogout} disabled={isLoading} />*/}
      {/* The header button is preferred. */}
      <Text style={styles.contentText}>This is your main dashboard.</Text>
      <Text style={styles.contentText}>Future features will appear here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#555',
  }
});

export default HomeScreen;
