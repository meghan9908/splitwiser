import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function NotificationsScreen() {
  // Placeholder for notification settings
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Push Notifications</Text>
        <Switch value={true} disabled />
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Email Updates</Text>
        <Switch value={false} disabled />
      </View>
      <Text style={styles.placeholderText}>
        Notification settings coming soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholderText: {
    marginTop: 32,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});
