import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView, StyleSheet } from 'react-native';

export default function FriendsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedText type="title" style={styles.title}>Friends</ThemedText>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">No Friends Yet</ThemedText>
        <ThemedText>
          Your friends will appear here once you add them.
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Add Friends</ThemedText>
        <ThemedText>
          Add your first friend by clicking the + button below.
        </ThemedText>
      </ThemedView>
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
});
