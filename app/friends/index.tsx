import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabBar from "../../components/TabBar";
import Colors from "../../constants/Colors";

// Friend component for displaying each friend item
const FriendItem = ({ 
  name, 
  status, 
  color 
}: { 
  name: string, 
  status: string, 
  color: string 
}) => {
  return (
    <Pressable style={styles.friendItemContainer}>
      <View style={[styles.colorIndicator, { backgroundColor: color }]} />
      <View style={styles.friendInfoContainer}>
        <Text style={styles.friendName}>{name}</Text>
        <Text style={styles.friendStatus}>{status}</Text>
      </View>
    </Pressable>
  );
};

export default function FriendsScreen() {
  // Sample friends data
  const friends = [
    { id: 1, name: "Liam Carter", status: "You owe $10.00", color: "#6A7FDB" },
    { id: 2, name: "Sophia Bennett", status: "You owe $25.00", color: "#8A4FFF" },
    { id: 3, name: "Ethan Harper", status: "You owe $15.00", color: "#FF745C" },
    { id: 4, name: "Olivia Hayes", status: "You owe $5.00", color: "#45CB85" },
    { id: 5, name: "Noah Foster", status: "You owe $30.00", color: "#F5A623" },
    { id: 6, name: "Ava Mitchell", status: "You owe $20.00", color: "#D0021B" },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContentWrapper}>
            <Text style={styles.headerTitle}>Friends</Text>
            <View style={styles.headerRight}>
              <Pressable style={styles.addButton}>
                <Ionicons name="add" size={24} color={Colors.text.primary} />
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {friends.map((friend) => (
            <FriendItem 
              key={friend.id} 
              name={friend.name} 
              status={friend.status} 
              color={friend.color}
            />
          ))}
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
  },
  headerContentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  friendItemContainer: {
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
  friendInfoContainer: {
    justifyContent: 'center',
  },
  friendName: {
    color: Colors.text.primary,
    fontFamily: "Manrope_500Medium",
    fontSize: 16,
  },
  friendStatus: {
    color: Colors.text.secondary,
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
  },
});
