import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabBar from "../../components/TabBar";
import Colors from "../../constants/Colors";

// Activity component for displaying each activity item
const ActivityItem = ({ 
  title, 
  date, 
  color 
}: { 
  title: string, 
  date: string, 
  color: string 
}) => {
  return (
    <View style={styles.activityItemContainer}>
      <View style={[styles.colorIndicator, { backgroundColor: color }]} />
      <View style={styles.activityInfoContainer}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDate}>{date}</Text>
      </View>
    </View>
  );
};

export default function ActivityScreen() {
  // Sample activity data
  const activities = [
    { id: 1, title: "You added 'Dinner at The Italian Place'", date: "10/20/24", color: "#6A7FDB" },
    { id: 2, title: "You added 'Movie Tickets'", date: "10/19/24", color: "#8A4FFF" },
    { id: 3, title: "You added 'Weekend Getaway'", date: "10/18/24", color: "#FF745C" },
    { id: 4, title: "You added 'Grocery Shopping'", date: "10/17/24", color: "#45CB85" },
    { id: 5, title: "You added 'Coffee at The Daily Grind'", date: "10/16/24", color: "#F5A623" },
    { id: 6, title: "You added 'Lunch at The Bistro'", date: "10/15/24", color: "#D0021B" },
    { id: 7, title: "You added 'Gas for Road Trip'", date: "10/14/24", color: "#9013FE" },
    { id: 8, title: "You added 'Concert Tickets'", date: "10/13/24", color: "#4A90E2" },
    { id: 9, title: "You added 'Brunch at The Cafe'", date: "10/12/24", color: "#50E3C2" },
    { id: 10, title: "You added 'Drinks at The Bar'", date: "10/11/24", color: "#B8E986" },
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
          <Text style={styles.headerTitle}>Activity</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {activities.map((activity) => (
            <ActivityItem 
              key={activity.id} 
              title={activity.title} 
              date={activity.date} 
              color={activity.color}
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
  activityItemContainer: {
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
  activityInfoContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  activityTitle: {
    color: Colors.text.primary,
    fontFamily: "Manrope_500Medium",
    fontSize: 16,
  },
  activityDate: {
    color: Colors.text.secondary,
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
  },
});
