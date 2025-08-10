import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Menu,
  SegmentedButtons,
  TextInput,
} from "react-native-paper";
import { createExpense, getGroupMembers } from "../api/groups";
import { AuthContext } from "../context/AuthContext";
import { colors, spacing, typography } from "../styles/theme";

const CustomCheckbox = ({ label, status, onPress }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <Ionicons
      name={status === "checked" ? "checkbox" : "square-outline"}
      size={24}
      color={status === "checked" ? colors.primary : colors.textSecondary}
    />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const SplitInputRow = ({ label, value, onChangeText, isPercentage }) => (
  <View style={styles.splitRow}>
    <Text style={styles.splitLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType="numeric"
      style={styles.splitInput}
    />
    {isPercentage && <Text style={styles.percentageSymbol}>%</Text>}
  </View>
);

const AddExpenseScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { token, user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(null);
  const [splitMethod, setSplitMethod] = useState("equal");
  const [exactAmounts, setExactAmounts] = useState({});
  const [percentages, setPercentages] = useState({});
  const [shares, setShares] = useState({});
  const [selectedMembers, setSelectedMembers] = useState({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await getGroupMembers(groupId);
        setMembers(res.data || []);
        const initial = {};
        (res.data || []).forEach((m) => {
          initial[m.userId] = true; // include by default for equal split
        });
        setSelectedMembers(initial);
      } catch (e) {
        Alert.alert("Error", "Failed to load members");
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, [groupId]);

  const toNumber = (v) => {
    if (v === null || v === undefined) return 0;
    const cleaned = String(v).replace(/[^0-9.+-]/g, '').trim();
    if (cleaned === '' || cleaned === '.' || cleaned === '-' || cleaned === '+') return 0;
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const handleAddExpense = async () => {
    if (!description || !amount || !payerId) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    const numericAmount = toNumber(amount);
    if (numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount greater than 0.");
      return;
    }
    setIsSubmitting(true);
    try {
      let splits = [];
      if (splitMethod === "equal") {
        const includedMembers = Object.keys(selectedMembers).filter((id) => selectedMembers[id]);
        if (includedMembers.length === 0)
          throw new Error("Select at least one member for the split.");
        const base = Math.floor((numericAmount * 100) / includedMembers.length);
        const remainder = (numericAmount * 100) - base * includedMembers.length;
        splits = includedMembers.map((userId, idx) => ({
          userId,
          amount: (base + (idx === 0 ? remainder : 0)) / 100,
          type: "equal",
        }));
      } else if (splitMethod === "exact") {
        const total = Object.values(exactAmounts).reduce((sum, val) => sum + toNumber(val), 0);
        if (!Number.isFinite(total) || Math.abs(total - numericAmount) > 0.01)
          throw new Error("Exact amounts must add up to the total.");
        splits = Object.entries(exactAmounts)
          .map(([userId, value]) => ({ userId, amount: toNumber(value) }))
          .filter((s) => s.amount > 0)
          .map((s) => ({ ...s, type: "unequal" }));
        const diff = Math.round((numericAmount - splits.reduce((a, b) => a + b.amount, 0)) * 100) / 100;
        if (Math.abs(diff) > 0 && splits.length > 0) splits[0].amount += diff;
      } else if (splitMethod === "percentage") {
        const totalPercentage = Object.values(percentages).reduce((sum, val) => sum + toNumber(val), 0);
        if (!Number.isFinite(totalPercentage) || Math.abs(totalPercentage - 100) > 0.01)
          throw new Error("Percentages must add up to 100.");
        splits = Object.entries(percentages)
          .map(([userId, value]) => ({ userId, pct: toNumber(value) }))
          .filter((s) => s.pct > 0)
          .map((s) => ({
            userId: s.userId,
            amount: Math.round((numericAmount * (s.pct / 100)) * 100) / 100,
            type: "percentage",
          }));
        const diff = Math.round((numericAmount - splits.reduce((a, b) => a + b.amount, 0)) * 100) / 100;
        if (Math.abs(diff) > 0 && splits.length > 0) splits[0].amount += diff;
      } else if (splitMethod === "shares") {
        const totalShares = Object.values(shares).reduce((sum, val) => sum + toNumber(val), 0);
        if (!Number.isFinite(totalShares) || totalShares <= 0) throw new Error("Total shares must be positive.");
        splits = Object.entries(shares)
          .map(([userId, value]) => ({ userId, shares: toNumber(value) }))
          .filter((s) => s.shares > 0)
          .map((s) => ({
            userId: s.userId,
            amount: Math.round((numericAmount * (s.shares / totalShares)) * 100) / 100,
            type: "unequal",
          }));
        const diff = Math.round((numericAmount - splits.reduce((a, b) => a + b.amount, 0)) * 100) / 100;
        if (Math.abs(diff) > 0 && splits.length > 0) splits[0].amount += diff;
      }
      const splitTypeMap = { exact: "unequal", shares: "unequal" };
      const expenseData = {
        description,
        amount: numericAmount,
        paidBy: payerId,
        splitType: splitTypeMap[splitMethod] || splitMethod,
        splits,
      };
      await createExpense(groupId, expenseData);
      Alert.alert("Success", "Expense added successfully.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to add expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberSelect = (userId) => {
    setSelectedMembers((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const renderSplitInputs = () => {
    switch (splitMethod) {
      case "equal":
        return members.map((member) => (
          <CustomCheckbox
            key={member.userId}
            label={member.user.name}
            status={selectedMembers[member.userId] ? "checked" : "unchecked"}
            onPress={() => handleMemberSelect(member.userId)}
          />
        ));
      case "exact":
        return members.map((member) => (
          <SplitInputRow
            key={member.userId}
            label={member.user.name}
            value={exactAmounts[member.userId]}
            onChangeText={(text) => setExactAmounts({ ...exactAmounts, [member.userId]: text })}
          />
        ));
      case "percentage":
        return members.map((member) => (
          <SplitInputRow
            key={member.userId}
            label={member.user.name}
            value={percentages[member.userId]}
            onChangeText={(text) => setPercentages({ ...percentages, [member.userId]: text })}
            isPercentage
          />
        ));
      case "shares":
        return members.map((member) => (
          <SplitInputRow
            key={member.userId}
            label={member.user.name}
            value={shares[member.userId]}
            onChangeText={(text) => setShares({ ...shares, [member.userId]: text })}
          />
        ));
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const selectedPayerName = members.find((m) => m.userId === payerId)?.user.name || "Select Payer";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.white} />
        <Appbar.Content title="Add Expense" color={colors.white} titleStyle={{ ...typography.h2 }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          theme={{ colors: { primary: colors.accent } }}
        />
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
          keyboardType="numeric"
          theme={{ colors: { primary: colors.accent } }}
        />
        <View>
          <Text style={styles.label}>Paid by</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity style={styles.menuAnchor} onPress={() => setMenuVisible(true)}>
                <Text style={styles.menuAnchorText}>{selectedPayerName}</Text>
                <Ionicons name="chevron-down-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            }
          >
            {members.map((member) => (
              <Menu.Item
                key={member.userId}
                onPress={() => {
                  setPayerId(member.userId);
                  setMenuVisible(false);
                }}
                title={member.user.name}
              />
            ))}
          </Menu>
        </View>
        <Text style={styles.splitTitle}>Split Method</Text>
        <SegmentedButtons
          value={splitMethod}
          onValueChange={setSplitMethod}
          buttons={[
            { value: "equal", label: "Equally", icon: "division" },
            { value: "exact", label: "Exact", icon: "currency-usd" },
            { value: "percentage", label: "%", icon: "percent-outline" },
            { value: "shares", label: "Shares", icon: "chart-pie" },
          ]}
          style={styles.input}
          theme={{ colors: { primary: colors.primary } }}
        />
        <View style={styles.splitInputsContainer}>{renderSplitInputs()}</View>
        <Button
          mode="contained"
          onPress={handleAddExpense}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Add Expense
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    ...typography.body,
    color: colors.white,
    fontWeight: "bold",
  },
  splitTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  splitInputsContainer: {
    marginTop: spacing.md,
  },
  menuAnchor: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  menuAnchorText: {
    ...typography.body,
    color: colors.text,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.md,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  splitLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  splitInput: {
    width: 100,
    textAlign: "right",
    backgroundColor: colors.white,
  },
  percentageSymbol: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});

export default AddExpenseScreen;
