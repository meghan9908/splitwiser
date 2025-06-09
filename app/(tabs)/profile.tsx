import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedText type="title" style={styles.title}>Profile</ThemedText>
      
      <ThemedView style={styles.profileHeader}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.profileImage}
        />
        <ThemedText type="subtitle" style={styles.userName}>
          {user?.name || user?.email || 'User'}
        </ThemedText>
        <ThemedText>{user?.email || ''}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Account Settings</ThemedText>
        <ThemedText style={styles.settingItem}>Edit Profile</ThemedText>
        <ThemedText style={styles.settingItem}>Notifications</ThemedText>
        <ThemedText style={styles.settingItem}>Payment Methods</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">General</ThemedText>
        <ThemedText style={styles.settingItem}>Help & Support</ThemedText>
        <ThemedText style={styles.settingItem}>About</ThemedText>
        <ThemedText style={styles.settingItem}>Privacy Policy</ThemedText>
      </ThemedView>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  logoutButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
