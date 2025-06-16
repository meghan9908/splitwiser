import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as React from 'react';
import { auth } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '323312632683-cgj2g17fgaucfclbsvm8gfgo3c2hohpf.apps.googleusercontent.com',
    iosClientId: '323312632683-dqv5ag5l03ms82q0lqs94uecetfrshnf.apps.googleusercontent.com',
    androidClientId: '323312632683-qj3n1dhq3gr18khd6dl5iamdh00qt6j3.apps.googleusercontent.com',
    webClientId: '323312632683-cgj2g17fgaucfclbsvm8gfgo3c2hohpf.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch(console.error);
    }
  }, [response]);

  const handleGoogleLogin = React.useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  return { handleGoogleLogin, request };
}
