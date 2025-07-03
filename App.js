import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';

// Optional: Ignore specific warnings if they are known and not critical
// LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);
// Add any other logs you want to ignore, e.g., related to deprecated lifecycle methods if any deps use them.
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state', // Can happen with params, ensure all params are serializable if this is an issue
]);


export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
