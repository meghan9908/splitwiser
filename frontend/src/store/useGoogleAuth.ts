import { useEffect, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { 
  GoogleAuthProvider, 
  signInWithCredential, 
  signInWithPopup, 
  User 
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";

export function useGoogleAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    // Configure only in native
    if (!isWeb()) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      let firebaseIdToken: string;
      let user: User;

      if (isWeb()) {
        // ---- WEB SIGN-IN ----
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        user = result.user;
        firebaseIdToken = await user.getIdToken(true);
      } else {
        // ---- NATIVE SIGN-IN ----
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const userInfo = await GoogleSignin.signIn();

        if (!userInfo?.data?.idToken) throw new Error("No Google ID token returned");

        const credential = GoogleAuthProvider.credential(userInfo.data.idToken);
        const userCredential = await signInWithCredential(auth, credential);

        user = userCredential.user;
        firebaseIdToken = await user.getIdToken(true);
      }

      setFirebaseUser(user);
      setIdToken(firebaseIdToken);

      console.log("Google sign-in success (Firebase token):", firebaseIdToken);
      return { idToken: firebaseIdToken, firebaseUser: user };
    } catch (error) {
      console.error("Google Sign-In error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isWeb()) await GoogleSignin.signOut();
    await auth.signOut();
    setFirebaseUser(null);
    setIdToken(null);
  };

  const isWeb = () => typeof window !== "undefined";

  return { signInWithGoogle, signOut, firebaseUser, idToken };
}
