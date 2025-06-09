import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../../constants/Colors";

// Expense component for displaying each expense item
const ExpenseItem = ({ 
  icon, 
  title, 
  paidBy, 
  amount 
}: { 
  icon: string, 
  title: string, 
  paidBy: string, 
  amount: string 
}) => {
  return (
    <View style={styles.expenseItemContainer}>
      <View style={styles.expenseLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color={Colors.text.primary} />
        </View>
        <View style={styles.expenseInfoContainer}>
          <Text style={styles.expenseTitle}>{title}</Text>
          <Text style={styles.expensePaidBy}>{paidBy}</Text>
        </View>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>{amount}</Text>
      </View>
    </View>
  );
};

// Member component for displaying each member
const MemberItem = ({ 
  name, 
  status, 
  color 
}: { 
  name: string, 
  status: string, 
  color: string 
}) => {
  return (
    <View style={styles.memberItemContainer}>
      <View style={[styles.memberAvatar, { backgroundColor: color }]} />
      <View style={styles.memberInfoContainer}>
        <Text style={styles.memberName}>{name}</Text>
        <Text style={styles.memberStatus}>{status}</Text>
      </View>
    </View>
  );
};

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams();
  
  // Mock data for the screen - in a real app, this would come from an API
  const groupTitle = id === "1" ? "Vacation Crew" : 
                    id === "2" ? "Apartment Mates" :
                    id === "3" ? "Road Trip Buddies" : "Family Getaway";
  
  // Mock members
  const members = [
    { id: 1, name: "You", status: "", color: "#6A7FDB" },
    { id: 2, name: "Sophia", status: "Owes you $12.50", color: "#8A4FFF" },
    { id: 3, name: "Ethan", status: "You owe $12.50", color: "#FF745C" },
  ];
  
  // Mock expenses
  const expenses = [
    { id: 1, icon: "ticket-outline", title: "Eiffel Tower Tickets", paidBy: "Paid by Liam", amount: "$50" },
    { id: 2, icon: "restaurant-outline", title: "Dinner at Le Jules Verne", paidBy: "Paid by Sophia", amount: "$100" },
    { id: 3, icon: "bed-outline", title: "Hotel Accommodation", paidBy: "Paid by Ethan", amount: "$150" },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: groupTitle,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text.primary,
          headerTitleStyle: {
            fontFamily: "Manrope_700Bold",
          },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Group Members</Text>
            {members.map((member) => (
              <MemberItem
                key={member.id}
                name={member.name}
                status={member.status}
                color={member.color}
              />
            ))}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                icon={expense.icon}
                title={expense.title}
                paidBy={expense.paidBy}
                amount={expense.amount}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.fabContainer}>
          <Pressable style={styles.fab}>
            <Ionicons name="add" size={24} color={Colors.background} />
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
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
  memberItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 16,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  memberInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  memberName: {
    color: Colors.text.primary,
    fontFamily: "Manrope_500Medium",
    fontSize: 16,
  },
  memberStatus: {
    color: Colors.text.secondary,
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
  },
  expenseItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.button.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseInfoContainer: {
    justifyContent: "center",
  },
  expenseTitle: {
    color: Colors.text.primary,
    fontFamily: "Manrope_500Medium",
    fontSize: 16,
  },
  expensePaidBy: {
    color: Colors.text.secondary,
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
  },
  expenseRight: {
    justifyContent: "center",
  },
  expenseAmount: {
    color: Colors.text.primary,
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
