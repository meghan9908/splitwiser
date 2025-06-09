import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, login, isLoading } = useAuth();
  
  // If user is already authenticated, redirect to groups screen
  useEffect(() => {
    if (user) {
      router.replace("/groups");
    }
  }, [user]);
  
  const handleLogIn = async () => {
    // For demo, we'll use a mock login
    const success = await login("demo@example.com", "password");
    if (success) {
      router.replace("/groups");
    }
  };

  const handleSignUp = () => {
    // In a real app, navigate to sign up form
    // For now, use same login functionality
    handleLogIn();
  };

  const handleEmailSignIn = () => {
    // In a real app, navigate to email sign in form
    // For now, use same login functionality
    handleLogIn();
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/login-background.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Splitwiser</Text>
          </View>

          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>Get started</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable 
              style={styles.loginButton} 
              onPress={handleLogIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.loginButtonText}>Log in</Text>
              )}
            </Pressable>

            <Pressable 
              style={styles.signUpButton} 
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>Sign up</Text>
            </Pressable>

            <Pressable 
              style={styles.emailButton} 
              onPress={handleEmailSignIn}
              disabled={isLoading}
            >
              <Text style={styles.emailButtonText}>Sign in with an email</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 23, 18, 0.5)',
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 18,
    textAlign: "center",
  },
  getStartedContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  getStartedText: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 28,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loginButton: {
    backgroundColor: Colors.button.primary,
    padding: 16,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: Colors.background,
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: Colors.button.secondary,
    padding: 16,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
  },
  signUpButtonText: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
  },
  emailButton: {
    backgroundColor: Colors.button.secondary,
    padding: 16,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
  },
  emailButtonText: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
  },
});
