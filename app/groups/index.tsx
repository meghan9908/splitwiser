import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabBar from "../../components/TabBar";
import Colors from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";

// Group component for displaying each group item
const GroupItem = ({ 
  id, 
  title, 
  balance, 
  color 
}: { 
  id: number, 
  title: string, 
  balance: string, 
  color: string 
}) => {
  return (
    <Pressable 
      style={styles.groupItemContainer}
      onPress={() => router.push(`/groups/${id}`)}
    >
      <View style={[styles.colorIndicator, { backgroundColor: color }]} />
      <View style={styles.groupInfoContainer}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Text style={styles.groupBalance}>{balance}</Text>
      </View>
    </Pressable>
  );
};

export default function GroupsScreen() {
  const { user, logout } = useAuth();

  // Handle logout
  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  // Sample group data
  const groups = [
    { id: 1, title: "Vacation Crew", balance: "Total balance: $120", color: "#6A7FDB" },
    { id: 2, title: "Apartment Mates", balance: "Total balance: $350", color: "#8A4FFF" },
    { id: 3, title: "Road Trip Buddies", balance: "Total balance: $80", color: "#FF745C" },
    { id: 4, title: "Family Getaway", balance: "Total balance: $200", color: "#45CB85" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="menu-outline" size={24} color={Colors.text.primary} />
        </View>
        <Text style={styles.headerTitle}>Groups</Text>
        <View style={styles.headerRight}>
          <Pressable style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.text.primary} />
          </Pressable>
        </View>
      </View>      <ScrollView style={styles.scrollView}>
        {groups.map((group) => (
          <GroupItem 
            key={group.id}
            id={group.id}
            title={group.title} 
            balance={group.balance} 
            color={group.color}
          />
        ))}      </ScrollView>
      
      {/* Import and use the TabBar component */}
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text.primary,
    fontFamily: "Manrope_700Bold",
    fontSize: 18,
    textAlign: "center",
  },
  headerRight: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.button.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  groupItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    gap: 16,
  },
  colorIndicator: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  groupInfoContainer: {
    justifyContent: 'center',
  },
  groupTitle: {
    color: Colors.text.primary,
    fontFamily: "Manrope_500Medium",
    fontSize: 16,
  },
  groupBalance: {
    color: Colors.text.secondary,
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
  },  // TabBar styles are now in the TabBar component
});
