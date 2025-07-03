import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext'; // Adjusted path
import { useAuth } from '../../src/context/AuthContext'; // Or use the hook

// Note: The logout button is now typically part of the layout (e.g., app/(main)/_layout.js header)
// So, it might be redundant here, or you might want a different UI for logout within the screen.
const HomeScreen = () => {
  // const { user, logout } = useContext(AuthContext); // Or use the hook
  const { user } = useAuth(); // Using the hook, logout is in layout

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Splitwiser!</Text>
      {user && <Text style={styles.userInfo}>Logged in as: {user.name} ({user.email})</Text>}
      {/* <Button title="Logout" onPress={logout} /> */}
      {/* Content for the home screen will be added later */}
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
