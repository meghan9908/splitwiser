import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Home/HomeScreen';
import { useAuth } from '../hooks/auth/useAuth'; // To get logout for header
import { Button } from 'react-native';


const Stack = createStackNavigator();

const MainNavigator = () => {
  const { logout } = useAuth(); // For the logout button in header

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <Button onPress={logout} title="Logout" color="#c00" />
          ),
        }}
      />
      {/* More app screens and navigators (e.g., tab navigator) would be added here */}
    </Stack.Navigator>
  );
};

export default MainNavigator;
