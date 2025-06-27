import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import AccountScreen from './screens/AccountScreen';
import ActivityScreen from './screens/ActivityScreen';
import FriendsScreen from './screens/FriendsScreen';
import GroupDetailsScreen from './screens/GroupDetailsScreen';
import GroupSettingsScreen from './screens/GroupSettingsScreen';
import GroupsScreen from './screens/GroupsScreen';
import LoginScreen from './screens/LoginScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function GroupsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="GroupsList" 
        component={GroupsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GroupDetails" 
        component={GroupDetailsScreen as React.ComponentType<{}>} 
        options={{ 
          headerShown: true,
          title: 'Group Details',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen 
        name="GroupSettings" 
        component={GroupSettingsScreen as React.ComponentType<{}>} 
        options={{ 
          headerShown: true,
          title: 'Group Settings',
          headerBackVisible: true,
        }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home'; // Default icon

          // Safety check for route and route.name
          if (route && route.name) {
            switch (route.name) {
              case 'Groups':
                iconName = focused ? 'people' : 'people-outline';
                break;
              case 'Friends':
                iconName = focused ? 'person-add' : 'person-add-outline';
                break;
              case 'Activity':
                iconName = focused ? 'pulse' : 'pulse-outline';
                break;
              case 'Account':
                iconName = focused ? 'person-circle' : 'person-circle-outline';
                break;
              default:
                iconName = 'home';
            }
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Groups" component={GroupsStack} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while authentication is being checked
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ title: 'Help & Support' }} />
        </>
      ) : (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
