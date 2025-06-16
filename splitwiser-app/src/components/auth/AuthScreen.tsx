import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// TODO: Replace with your logo asset
const logo = require('../../../assets/images/logo.png');

export default function AuthScreen({ onGoogleLogin }: { onGoogleLogin: () => void }) {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Welcome to Splitwiser</Text>
      <TouchableOpacity style={styles.googleButton} onPress={onGoogleLogin}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      {/* Add email/password login fields here if needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#222',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
