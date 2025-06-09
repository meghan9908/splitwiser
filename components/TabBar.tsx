import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";

export default function TabBar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/groups' && pathname.startsWith('/groups')) {
      return true;
    }
    return pathname === path;
  };
  
  return (
    <View style={styles.tabBar}>
      <Pressable 
        style={styles.tabBarItem}
        onPress={() => router.push("/groups")}
      >
        <Ionicons 
          name="home-outline" 
          size={24} 
          color={isActive('/groups') ? Colors.primary : Colors.text.secondary} 
        />
        <Text style={[
          styles.tabBarLabel, 
          isActive('/groups') && styles.activeTab
        ]}>
          Groups
        </Text>
      </Pressable>
      
      <Pressable 
        style={styles.tabBarItem}
        onPress={() => router.push("/friends")}
      >
        <Ionicons 
          name="people-outline" 
          size={24} 
          color={isActive('/friends') ? Colors.primary : Colors.text.secondary} 
        />
        <Text style={[
          styles.tabBarLabel, 
          isActive('/friends') && styles.activeTab
        ]}>
          Friends
        </Text>
      </Pressable>
      
      <Pressable 
        style={styles.tabBarItem}
        onPress={() => router.push("/activity")}
      >
        <Ionicons 
          name="list-outline" 
          size={24} 
          color={isActive('/activity') ? Colors.primary : Colors.text.secondary} 
        />
        <Text style={[
          styles.tabBarLabel, 
          isActive('/activity') && styles.activeTab
        ]}>
          Activity
        </Text>
      </Pressable>
      
      <Pressable 
        style={styles.tabBarItem}
        onPress={() => router.push("/account")}
      >
        <Ionicons 
          name="person-outline" 
          size={24} 
          color={isActive('/account') ? Colors.primary : Colors.text.secondary} 
        />
        <Text style={[
          styles.tabBarLabel, 
          isActive('/account') && styles.activeTab
        ]}>
          Account
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#1F261C",
    borderTopWidth: 1,
    borderTopColor: "#2E3829",
  },
  tabBarItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabBarLabel: {
    color: Colors.text.secondary,
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
  },
  activeTab: {
    color: Colors.text.primary,
  },
});
