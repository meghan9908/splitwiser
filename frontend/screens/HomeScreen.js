import { useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { createGroup, getGroups, getOptimizedSettlements } from "../api/groups";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import { colors, typography, spacing } from "../styles/theme";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const HomeScreen = ({ navigation }) => {
  const { token, user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupSettlements, setGroupSettlements] = useState({});

  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  const calculateSettlementStatus = async (groupId, userId) => {
    try {
      const response = await getOptimizedSettlements(groupId);
      const settlements = response.data.optimizedSettlements || [];
      const userOwes = settlements.filter((s) => s.fromUserId === userId);
      const userIsOwed = settlements.filter((s) => s.toUserId === userId);
      const totalOwed = userOwes.reduce((sum, s) => sum + (s.amount || 0), 0);
      const totalToReceive = userIsOwed.reduce(
        (sum, s) => sum + (s.amount || 0),
        0
      );
      return {
        isSettled: totalOwed === 0 && totalToReceive === 0,
        owesAmount: totalOwed,
        owedAmount: totalToReceive,
        netBalance: totalToReceive - totalOwed,
      };
    } catch (error) {
      console.error(
        "Failed to fetch settlement status for group:",
        groupId,
        error
      );
      return { isSettled: true, owesAmount: 0, owedAmount: 0, netBalance: 0 };
    }
  };

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await getGroups();
      const groupsList = response.data.groups;
      setGroups(groupsList);

      if (user?._id) {
        const settlementPromises = groupsList.map(async (group) => {
          const status = await calculateSettlementStatus(group._id, user._id);
          return { groupId: group._id, status };
        });
        const settlementResults = await Promise.all(settlementPromises);
        const settlementMap = {};
        settlementResults.forEach(({ groupId, status }) => {
          settlementMap[groupId] = status;
        });
        setGroupSettlements(settlementMap);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      Alert.alert("Error", "Failed to fetch groups.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGroups();
    }
  }, [token]);

  const handleCreateGroup = async () => {
    if (!newGroupName) {
      Alert.alert("Error", "Please enter a group name.");
      return;
    }
    setIsCreatingGroup(true);
    try {
      await createGroup(newGroupName);
      hideModal();
      setNewGroupName("");
      await fetchGroups();
    } catch (error) {
      console.error("Failed to create group:", error);
      Alert.alert("Error", "Failed to create group.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const renderGroup = ({ item, index }) => {
    const settlementStatus = groupSettlements[item._id];
    const scale = new Animated.Value(0);

    Animated.timing(scale, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    const getSettlementStatusText = () => {
      if (!settlementStatus) return "Calculating balances...";
      if (settlementStatus.isSettled) return "✓ You are settled up.";
      if (settlementStatus.netBalance > 0) {
        return `You are owed ${formatCurrency(settlementStatus.netBalance)}.`;
      }
      return `You owe ${formatCurrency(
        Math.abs(settlementStatus.netBalance)
      )}.`;
    };

    const getStatusColor = () => {
      if (!settlementStatus || settlementStatus.isSettled)
        return colors.success;
      return settlementStatus.netBalance > 0 ? colors.success : colors.error;
    };

    const isImage =
      item.imageUrl && /^(https?:|data:image)/.test(item.imageUrl);
    const groupIcon = item.imageUrl || item.name?.charAt(0) || "?";

    return (
      <AnimatedTouchableOpacity
        style={[styles.card, { transform: [{ scale }] }]}
        onPress={() =>
          navigation.navigate("GroupDetails", {
            groupId: item._id,
            groupName: item.name,
            groupIcon,
          })
        }
      >
        <View style={styles.cardContent}>
          {isImage ? (
            <Avatar.Image
              size={50}
              source={{ uri: item.imageUrl }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={50}
              label={groupIcon}
              style={styles.avatar}
              labelStyle={{ ...typography.h3, color: colors.white }}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={[styles.settlementStatus, { color: getStatusColor() }]}>
              {getSettlementStatusText()}
            </Text>
          </View>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Create a New Group</Text>
          <TextInput
            label="Group Name"
            value={newGroupName}
            onChangeText={setNewGroupName}
            style={styles.input}
            theme={{ colors: { primary: colors.accent } }}
          />
          <Button
            mode="contained"
            onPress={handleCreateGroup}
            loading={isCreatingGroup}
            disabled={isCreatingGroup}
            style={styles.createButton}
            labelStyle={{ color: colors.white }}
          >
            Create
          </Button>
        </Modal>
      </Portal>

      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.Content
          title="Your Groups"
          color={colors.white}
          titleStyle={{ fontWeight: "bold" }}
        />
        <Appbar.Action icon="plus" color={colors.white} onPress={showModal} />
        <Appbar.Action
          icon="account-plus"
          color={colors.white}
          onPress={() =>
            navigation.navigate("JoinGroup", { onGroupJoined: fetchGroups })
          }
        />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No groups found. Create or join one!
              </Text>
            </View>
          }
          onRefresh={fetchGroups}
          refreshing={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: spacing.md,
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  groupName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settlementStatus: {
    ...typography.body,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: spacing.sm,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.lg,
    backgroundColor: colors.secondary,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
});

export default HomeScreen;
