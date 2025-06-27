import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  name?: string;
  email?: string;
}

interface Group {
  id: string;
  name: string;
  currency: string;
  joinCode: string;
  createdBy: string;
  createdAt: string;
  imageUrl?: string;
  members: GroupMember[];
}

interface GroupSettingsScreenProps {
  route: {
    params: {
      groupId: string;
      group: Group;
    };
  };
  navigation: any;
}

export default function GroupSettingsScreen({ route, navigation }: GroupSettingsScreenProps) {
  const { groupId, group: initialGroup } = route.params;
  const { accessToken, user } = useAuth();
  const [group, setGroup] = useState<Group>(initialGroup);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group.name);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = group.members.find(m => m.userId === user?.id)?.role === 'admin';

  useEffect(() => {
    fetchGroupDetails();
  }, []);

  const fetchGroupDetails = async () => {
    if (!accessToken) return;

    try {
      const response = await axios.get(`/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.data) {
        const groupData = {
          ...response.data,
          id: response.data.id || response.data._id,
        };
        setGroup(groupData);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroupDetails();
    setRefreshing(false);
  };

  const handleUpdateGroupName = async () => {
    if (!accessToken || !isAdmin) return;

    if (newGroupName.trim() === group.name) {
      setEditingName(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(`/groups/${groupId}`, {
        name: newGroupName.trim(),
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        const updatedGroup = {
          ...response.data,
          id: response.data.id || response.data._id,
        };
        setGroup(updatedGroup);
        setEditingName(false);
        Alert.alert('Success', 'Group name updated successfully');
      }
    } catch (error) {
      console.error('Error updating group name:', error);
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.detail || 'Failed to update group name');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareInvite = async () => {
    try {
      const inviteMessage = `Join "${group.name}" on SplitWiser!\n\nUse join code: ${group.joinCode}\n\nDownload the app: [App Store / Play Store Link]`;
      
      await Share.share({
        message: inviteMessage,
        title: `Invite to ${group.name}`,
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
    }
  };

  const handleCopyJoinCode = async () => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Join Code', group.joinCode, [
      { text: 'OK' }
    ]);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!accessToken || !isAdmin) return;

    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/groups/${groupId}/members/${memberId}`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });
              
              // Refresh group data
              await fetchGroupDetails();
              Alert.alert('Success', 'Member removed successfully');
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = async () => {
    if (!accessToken) return;

    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You can rejoin using the group code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post(`/groups/${groupId}/leave`, {}, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });
              
              Alert.alert('Success', 'You have left the group', [
                { text: 'OK', onPress: () => navigation.navigate('Groups') }
              ]);
            } catch (error) {
              console.error('Error leaving group:', error);
              if (axios.isAxiosError(error)) {
                Alert.alert('Error', error.response?.data?.detail || 'Failed to leave group');
              }
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = async () => {
    if (!accessToken || !isAdmin) return;

    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/groups/${groupId}`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });
              
              Alert.alert('Success', 'Group deleted successfully', [
                { text: 'OK', onPress: () => navigation.navigate('Groups') }
              ]);
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  const renderMemberItem = ({ item }: { item: GroupMember }) => {
    const isCurrentUser = item.userId === user?.id;
    const joinDate = new Date(item.joinedAt).toLocaleDateString();

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {item.name?.charAt(0).toUpperCase() || item.userId.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {item.name || `User ${item.userId.slice(-4)}`}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.memberEmail}>{item.email || 'Email not available'}</Text>
          <Text style={styles.memberJoinDate}>Joined {joinDate}</Text>
        </View>
        
        <View style={styles.memberActions}>
          <View style={[styles.roleTag, item.role === 'admin' && styles.adminTag]}>
            <Text style={[styles.roleText, item.role === 'admin' && styles.adminText]}>
              {item.role}
            </Text>
          </View>
          
          {isAdmin && !isCurrentUser && (
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveMember(item.userId)}
            >
              <Ionicons name="close-circle" size={20} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Group Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Group Name</Text>
            {editingName && isAdmin ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  autoFocus
                />
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleUpdateGroupName}
                  disabled={loading}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setEditingName(false);
                    setNewGroupName(group.name);
                  }}
                >
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{group.name}</Text>
                {isAdmin && (
                  <TouchableOpacity onPress={() => setEditingName(true)}>
                    <Ionicons name="pencil" size={16} color="#2196F3" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Currency</Text>
            <Text style={styles.infoValue}>{group.currency}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(group.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Members</Text>
            <Text style={styles.infoValue}>{group.members.length}</Text>
          </View>
        </View>
      </View>

      {/* Invite Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invite Members</Text>
        
        <View style={styles.inviteCard}>
          <Text style={styles.inviteDescription}>
            Share the join code or invite link to add new members to this group.
          </Text>
          
          <View style={styles.joinCodeContainer}>
            <Text style={styles.joinCodeLabel}>Join Code</Text>
            <View style={styles.joinCodeRow}>
              <Text style={styles.joinCodeText}>{group.joinCode}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyJoinCode}>
                <Ionicons name="copy-outline" size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShareInvite}>
            <Ionicons name="share-outline" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share Invite</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Members Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members ({group.members.length})</Text>
        
        <FlatList
          data={group.members}
          renderItem={renderMemberItem}
          keyExtractor={item => item.userId}
          scrollEnabled={false}
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <View style={styles.dangerCard}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLeaveGroup}>
            <Ionicons name="exit-outline" size={20} color="#F44336" />
            <Text style={styles.dangerButtonText}>Leave Group</Text>
          </TouchableOpacity>
          
          {isAdmin && (
            <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteGroup}>
              <Ionicons name="trash-outline" size={20} color="#F44336" />
              <Text style={styles.dangerButtonText}>Delete Group</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 16,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    padding: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 8,
  },
  inviteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inviteDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  joinCodeContainer: {
    marginBottom: 16,
  },
  joinCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  joinCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  joinCodeText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberJoinDate: {
    fontSize: 12,
    color: '#999',
  },
  memberActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  roleTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminTag: {
    backgroundColor: '#fff3e0',
  },
  roleText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  adminText: {
    color: '#ff9800',
  },
  removeButton: {
    padding: 4,
  },
  dangerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '500',
  },
});
