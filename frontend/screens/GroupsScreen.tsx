import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CreateGroupModal from '../components/CreateGroupModal';
import { useAuth } from '../contexts/AuthContext';

interface Group {
  id: string;
  name: string;
  currency: string;
  joinCode: string;
  createdBy: string;
  createdAt: string;
  imageUrl?: string;
  members?: Array<{
    userId: string;
    role: 'admin' | 'member';
    joinedAt: string;
  }>;
}

export default function GroupsScreen() {
  const { accessToken } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    if (!accessToken) {
      console.log('No access token available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/groups', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.data && response.data.groups && Array.isArray(response.data.groups)) {
        // Normalize the groups to ensure id field is present
        const normalizedGroups = response.data.groups.map((group: any) => ({
          ...group,
          id: group.id || group._id, // Handle both id and _id
        }));
        setGroups(normalizedGroups);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct array response
        const normalizedGroups = response.data.map((group: any) => ({
          ...group,
          id: group.id || group._id,
        }));
        setGroups(normalizedGroups);
      } else {
        console.error('Unexpected response format:', response.data);
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Alert.alert('Error', 'Please log in again');
        } else {
          Alert.alert('Error', 'Failed to load groups');
        }
      } else {
        Alert.alert('Error', 'Failed to load groups');
      }
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const handleGroupPress = (group: Group) => {
    // TODO: Navigate to group details screen
    Alert.alert('Group Selected', `Navigating to ${group.name}`);
  };

  const handleCreateGroup = async (groupData: { name: string; currency: string; imageUrl?: string }) => {
    if (!accessToken) {
      Alert.alert('Error', 'Please log in again');
      return;
    }

    try {
      const response = await axios.post('/groups', {
        name: groupData.name,
        currency: groupData.currency,
        imageUrl: groupData.imageUrl || null,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Create group response:', response.data);

      if (response.data) {
        // Handle different possible response formats
        let newGroup;
        
        if (response.data.id || response.data._id) {
          // Direct group response
          newGroup = {
            ...response.data,
            id: response.data.id || response.data._id,
          };
        } else if (response.data.group && (response.data.group.id || response.data.group._id)) {
          // Nested group response
          newGroup = {
            ...response.data.group,
            id: response.data.group.id || response.data.group._id,
          };
        } else {
          console.error('Unexpected create group response format:', response.data);
          throw new Error('Invalid response format - no group data found');
        }

        setGroups((prev: Group[]) => [newGroup, ...prev]);
        setCreateModalVisible(false);
        Alert.alert('Success', `Group "${newGroup.name}" created successfully!\nJoin code: ${newGroup.joinCode}`);
      } else {
        throw new Error('Empty response from server');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Alert.alert('Error', 'Please log in again');
        } else if (error.response?.data?.detail) {
          Alert.alert('Error', error.response.data.detail);
        } else {
          Alert.alert('Error', 'Failed to create group');
        }
      } else {
        Alert.alert('Error', 'Failed to create group');
      }
    }
  };

  const handleJoinGroup = async (joinCode: string) => {
    if (!accessToken) {
      Alert.alert('Error', 'Please log in again');
      return;
    }

    try {
      const response = await axios.post('/groups/join', {
        joinCode: joinCode.trim().toUpperCase(),
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.group) {
        const joinedGroup = {
          ...response.data.group,
          id: response.data.group.id || response.data.group._id, // Handle both id and _id
        };
        setGroups((prev: Group[]) => {
          // Check if group already exists in the list
          const exists = prev.find(g => g.id === joinedGroup.id);
          if (exists) {
            return prev; // Group already in list
          }
          return [joinedGroup, ...prev];
        });
        Alert.alert('Success', `Joined "${joinedGroup.name}" successfully!`);
        // Refresh the list to get updated member info
        fetchGroups();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Alert.alert('Error', 'Please log in again');
        } else if (error.response?.status === 404) {
          Alert.alert('Error', 'Group not found. Please check the join code.');
        } else if (error.response?.data?.detail) {
          Alert.alert('Error', error.response.data.detail);
        } else {
          Alert.alert('Error', 'Failed to join group');
        }
      } else {
        Alert.alert('Error', 'Failed to join group');
      }
    }
  };

  const handleJoinGroupPrompt = () => {
    Alert.prompt(
      'Join Group',
      'Enter the group join code:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: (code) => {
            if (code && code.trim()) {
              handleJoinGroup(code.trim());
            }
          }
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    const memberCount = item.members ? item.members.length : 1;
    const createdDate = new Date(item.createdAt).toLocaleDateString();
    
    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => handleGroupPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.groupAvatar}>
          <Text style={styles.avatarText}>
            {item.imageUrl || item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription}>
            Created on {createdDate} • {item.currency}
          </Text>
          <View style={styles.groupStats}>
            <Text style={styles.memberCount}>
              <Ionicons name="people" size={14} color="#666" /> {memberCount} member{memberCount !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.joinCode}>
              Code: {item.joinCode}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first group to start splitting expenses with friends!
      </Text>
      <TouchableOpacity
        style={styles.createFirstGroupButton}
        onPress={() => setCreateModalVisible(true)}
      >
        <Text style={styles.createFirstGroupButtonText}>Create Your First Group</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleJoinGroupPrompt}
          >
            <Ionicons name="enter" size={24} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item: Group) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          groups.length === 0 && styles.emptyContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      {groups.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      <CreateGroupModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
  },
  joinCode: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstGroupButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstGroupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
