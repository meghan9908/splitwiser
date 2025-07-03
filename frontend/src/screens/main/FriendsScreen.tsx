import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, FAB, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const FriendsScreen: React.FC = () => {
  const theme = useTheme();

  // This is just placeholder data - in a real app, this would come from API/Redux
  const friends = [
    // Empty for now
  ];

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium" style={styles.emptyText}>
          You haven't added any friends yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubText}>
          Add friends to split expenses with them directly
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>Friends</Text>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.name}
              subtitle={`Balance: $${item.balance || 0}`}
              left={() => (
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={{ color: 'white' }}>{item.name?.[0]?.toUpperCase()}</Text>
                </View>
              )}
            />
          </Card>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {}}
        color="white"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    opacity: 0.7,
  }
});

export default FriendsScreen;
