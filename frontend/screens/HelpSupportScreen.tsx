import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HelpSupportScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.text}>
        Welcome to Splitwiser Help & Support!
        {"\n\n"}
        For any issues, questions, or feedback, please contact our support team at support@splitwiser.com.
        {"\n\n"}
        Frequently Asked Questions:
        {"\n"}
        - How do I reset my password?
        - How do I update my profile?
        - How do I delete my account?
        {"\n\n"}
        For more information, visit our website or check the in-app documentation.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});
