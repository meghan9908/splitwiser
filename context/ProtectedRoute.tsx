import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

export function useProtectedRoute(protectedPaths: string[] = ["groups", "friends", "activity", "account"]) {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    
    if (!user) {
      // If the user is not signed in and the initial segment is not in the auth group,
      // redirect to the sign-in page.
      if (protectedPaths.includes(segments[0])) {
        router.replace("/");
      }
    } else {
      // If the user is signed in and the initial segment is in the auth group,
      // redirect to the groups page.
      if (segments.length === 0 || segments[0] === "") {
        router.replace("/groups");
      }
    }
  }, [user, segments]);
}
