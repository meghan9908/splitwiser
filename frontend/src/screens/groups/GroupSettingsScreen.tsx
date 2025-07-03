import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Divider, List, Switch, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '../../store/hooks';
import { GroupsStackParamList } from '../../types';

type GroupSettingsScreenRouteProp = RouteProp<GroupsStackParamList, 'GroupSettings'>;
type GroupSettingsScreenNavigationProp = StackNavigationProp<GroupsStackParamList, 'GroupSettings'>;

const GroupSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<GroupSettingsScreenNavigationProp>();
  const route = useRoute<GroupSettingsScreenRouteProp>();
  
  const { groupId } = route.params;
  
  const group = useAppSelector(state => 
    state.groups.groups.find(g => g._id === groupId)
  );

  // In a real app, these would be connected to actual functionality
  // These are placeholders for now
  const showInviteCode = () => {
    Alert.alert(
      'Group Invite Code',
      `Share this code with friends: ${group?.joinCode || 'Code not available'}`,
      [{ text: 'OK' }]
    );
  };

  const leaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API
            console.log('User would leave group here');
            navigation.navigate('GroupsList');
          }
        },
      ]
    );
  };

  const deleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API
            console.log('User would delete group here');
            navigation.navigate('GroupsList');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text variant="headlineSmall" style={styles.header}>Group Settings</Text>
        
        <List.Section>
          <List.Subheader>Group Information</List.Subheader>
          <List.Item
            title="Group Name"
            description={group?.name || 'Not available'}
            left={props => <List.Icon {...props} icon="account-group" />}
          />
          <List.Item
            title="Currency"
            description={group?.currency || 'Not available'}
            left={props => <List.Icon {...props} icon="currency-usd" />}
          />
          <List.Item
            title="Invite Code"
            description="Share with friends to join the group"
            left={props => <List.Icon {...props} icon="link" />}
            onPress={showInviteCode}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>
        
        <Divider />
        
        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="New Expenses"
            right={() => <Switch value={true} />}
          />
          <List.Item
            title="Reminders"
            right={() => <Switch value={true} />}
          />
        </List.Section>
        
        <Divider />
        
        <List.Section>
          <List.Subheader>Actions</List.Subheader>
          <List.Item
            title="Leave Group"
            description="Leave this group but keep your expense history"
            left={props => <List.Icon {...props} icon="exit-to-app" color={theme.colors.warning} />}
            onPress={leaveGroup}
          />
          
          {/* This option would typically only be shown to group admins */}
          <List.Item
            title="Delete Group"
            description="Permanently delete this group and all expenses"
            left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
            onPress={deleteGroup}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    margin: 16,
    fontWeight: 'bold',
  },
});

export default GroupSettingsScreen;
