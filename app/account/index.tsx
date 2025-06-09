import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabBar from "../../components/TabBar";
import Colors from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";

// Setting item component
const SettingItem = ({ 
  icon, 
  title, 
  rightElement 
}: { 
  icon: string, 
  title: string, 
  rightElement?: React.ReactNode 
}) => {
  return (
    <View style={styles.settingItemContainer}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color={Colors.text.primary} />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {rightElement || <Ionicons name="chevron-forward" size={24} color={Colors.text.primary} />}
      </View>
    </View>
  );
};

export default function AccountScreen() {
  const { logout, user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.profileContainer}>
            <View style={styles.profileAvatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.name || "Sophia Carter"}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || "sophia.carter@email.com"}
              </Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <SettingItem icon="notifications-outline" title="Notifications" />
            <SettingItem icon="cash-outline" title="Currency" />
            <SettingItem icon="language-outline" title="Language" />
            <SettingItem 
              icon="moon-outline" 
              title="Dark Mode" 
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: "#121712", true: Colors.primary }}
                  thumbColor={Colors.text.primary}
                />
              }
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Support</Text>

            <SettingItem icon="help-circle-outline" title="Help Center" />
            <SettingItem icon="mail-outline" title="Contact Us" />
            <SettingItem icon="document-text-outline" title="Terms of Service" />
            <SettingItem icon="shield-outline" title="Privacy Policy" />
          </View>

          <View style={styles.logoutContainer}>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </View>
        </ScrollView>

        <TabBar />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 18,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  profileAvatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#3A3A3C",
  },
  profileInfo: {
    justifyContent: 'center',
  },
  profileName: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 22,
  },
  profileEmail: {
    color: Colors.text.secondary,
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 18,
    marginBottom: 8,
  },
  settingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.button.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    color: Colors.text.primary,
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
  },
  settingRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
  },
});
