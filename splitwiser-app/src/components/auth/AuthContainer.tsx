import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGoogleLogin } from '../../hooks/useGoogleLogin';
import AuthScreen from '../auth/AuthScreen';

export default function AuthContainer() {
  const { handleGoogleLogin } = useGoogleLogin();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthScreen onGoogleLogin={handleGoogleLogin} />
    </SafeAreaView>
  );
}
