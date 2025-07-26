import { useEffect, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  User,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { Platform } from "react-native";

export function useGoogleAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === "web") {
        // ---- WEB FLOW ----
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        const firebaseIdToken = await result.user.getIdToken(true);
        setFirebaseUser(result.user);
        setIdToken(firebaseIdToken);

        console.log("Google sign-in success (web)");
        return { idToken: firebaseIdToken, firebaseUser: result.user };
      } else {
        // ---- NATIVE FLOW (your original logic) ----
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        const userInfo = await GoogleSignin.signIn();

        if (!userInfo?.data?.idToken) throw new Error("No Google ID token returned");

        const credential = GoogleAuthProvider.credential(userInfo.data.idToken);
        const userCredential = await signInWithCredential(auth, credential);

        const firebaseIdToken = await userCredential.user.getIdToken(true);
        setFirebaseUser(userCredential.user);
        setIdToken(firebaseIdToken);

        console.log("Google sign-in success");
        return { idToken: firebaseIdToken, firebaseUser: userCredential.user };
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (Platform.OS === "web") {
      await auth.signOut();
    } else {
      await GoogleSignin.signOut();
      await auth.signOut();
    }
    setFirebaseUser(null);
    setIdToken(null);
  };

  return { signInWithGoogle, signOut, firebaseUser, idToken };
}
