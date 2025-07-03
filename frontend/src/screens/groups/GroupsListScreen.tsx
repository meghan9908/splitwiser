import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Card, FAB, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGroups } from '../../store/slices/groupsSlice';
import { GroupsStackParamList } from '../../types';

type GroupsListScreenNavigationProp = StackNavigationProp<GroupsStackParamList, 'GroupsList'>;

const GroupsListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<GroupsListScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { groups, isLoading, error } = useAppSelector(state => state.groups);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading groups...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium" style={styles.emptyText}>
          You don't have any groups yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubText}>
          Create a group to start splitting expenses
        </Text>
      </View>
    );
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleJoinGroup = () => {
    navigation.navigate('JoinGroup');
  };

  const handleGroupPress = (groupId: string) => {
    navigation.navigate('GroupDetails', { groupId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>My Groups</Text>
        <TouchableOpacity onPress={handleJoinGroup}>
          <Text style={{ color: theme.colors.primary }}>Join Group</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleGroupPress(item._id)}
            activeOpacity={0.7}
          >
            <Card style={styles.card}>
              <Card.Title
                title={item.name}
                subtitle={`${item.members?.length || 0} members · ${item.currency}`}
                left={() => (
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: 'white' }}>{item.name[0].toUpperCase()}</Text>
                  </View>
                )}
              />
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateGroup}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  errorText: {
    padding: 16,
    textAlign: 'center',
  }
});

export default GroupsListScreen;
