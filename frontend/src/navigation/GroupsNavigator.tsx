import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import CreateGroupScreen from '../screens/groups/CreateGroupScreen';
import GroupDetailsScreen from '../screens/groups/GroupDetailsScreen';
import GroupSettingsScreen from '../screens/groups/GroupSettingsScreen';
import GroupsListScreen from '../screens/groups/GroupsListScreen';
import JoinGroupScreen from '../screens/groups/JoinGroupScreen';
import { GroupsStackParamList } from '../types';

const Stack = createStackNavigator<GroupsStackParamList>();

const GroupsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="GroupsList"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="GroupsList" 
        component={GroupsListScreen} 
        options={{ title: 'My Groups' }}
      />
      <Stack.Screen 
        name="GroupDetails" 
        component={GroupDetailsScreen}
        options={({ route }) => ({ title: route.params.groupId ? 'Group Details' : 'Group Details' })}
      />
      <Stack.Screen 
        name="CreateGroup" 
        component={CreateGroupScreen} 
        options={{ title: 'Create Group' }}
      />
      <Stack.Screen 
        name="JoinGroup" 
        component={JoinGroupScreen} 
        options={{ title: 'Join Group' }}
      />
      <Stack.Screen 
        name="GroupSettings" 
        component={GroupSettingsScreen} 
        options={{ title: 'Group Settings' }}
      />
      <Stack.Screen 
        name="AddExpense" 
        component={AddExpenseScreen} 
        options={{ title: 'Add Expense' }}
      />
    </Stack.Navigator>
  );
};

export default GroupsNavigator;
