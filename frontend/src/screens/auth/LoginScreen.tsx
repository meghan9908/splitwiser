import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Text,
  TextInput,
  useTheme,
  Divider,
  HelperText,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch } from "../../store/hooks";
import { loginUser, loginWithGoogle } from "../../store/slices/authSlice";
import { AuthStackParamList } from "../../types";
import { useGoogleAuth } from "../../store/useGoogleAuth";

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();

  const { signInWithGoogle } = useGoogleAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
    } catch (e: any) {
      setError(e.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const { idToken, firebaseUser } = await signInWithGoogle();
      await dispatch(
        loginWithGoogle({
          idToken,
          user: {
            id: firebaseUser?.uid ?? "",
            name: firebaseUser?.displayName ?? "",
            email: firebaseUser?.email ?? "",
            photo: firebaseUser?.photoURL ?? "",
          },
        })
      ).unwrap();
      navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
    } catch (e: any) {
      setError(e.message || "Failed to sign in with Google");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text variant="headlineLarge" style={styles.title}>
              SplitWiser
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Login to your account
            </Text>
          </View>

          {error && <HelperText type="error">{error}</HelperText>}

          {/* Google Sign-In Button */}
          <Button
            icon="google"
            mode="outlined"
            onPress={handleGoogleSignIn}
            style={styles.googleButton}
          >
            Sign in with Google
          </Button>

          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <Divider style={styles.divider} />
          </View>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            mode="outlined"
            right={
              <TextInput.Icon
                icon={secureTextEntry ? "eye" : "eye-off"}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Login
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: "center" },
  headerContainer: { alignItems: "center", marginBottom: 40 },
  title: { fontWeight: "bold", marginBottom: 8 },
  subtitle: { opacity: 0.7 },
  googleButton: { marginBottom: 20 },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 14, opacity: 0.6 },
  input: { marginVertical: 10 },
  button: { marginTop: 20, borderRadius: 8 },
  buttonContent: { paddingVertical: 8 },
  forgotPasswordContainer: { alignItems: "center", marginTop: 20 },
  forgotPasswordText: { textDecorationLine: "underline" },
  signupContainer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
});

export default LoginScreen;
