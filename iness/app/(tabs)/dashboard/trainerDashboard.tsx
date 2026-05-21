import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { router } from "expo-router";
import { config } from "@/app/shared/config";
import { fetchWrapper } from "@/app/helpers/fetchWrapper";
import { chatService } from "@/app/services/chat.service";
import TrainerVideoCallScreen from "@/app/modules/TrainerVideoCallModule";
import { videocallService } from "@/app/services/videocall.service";
import { notificationService } from "@/app/services/notification.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";
import MonthlySessionsCalendar from "@/app/Modals/MonthlySessionsCalendar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { paymentService } from "@/app/services/payment.service";
import { transformatiomImageService } from "@/app/services/transofmationImage.service";
import SessionHealthOverview from "@/app/modules/SessionHealthOverview";
import ImageViewerModal from "@/app/Modals/ImageViewerModal";
import VideoViewerModal from "@/app/Modals/VideoViewerModal";

const baseUrl = `${config.apiUrl}/api`;

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profilePic?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  userDetails?: {
    height?: string;
    weight?: string;
    targetWeight?: string;
    goal?: string;
    healthReport?: string;
  };
}

interface UserPlan {
  _id: string;
  plan?: {
    title?: string;
    planName?: string;
    planItem?: {
      planName?: string;
      isOnline?: boolean;
      duration?: number;
      durationType?: string;
      sessionCount?: number;
    };
  };
  planStartDate?: string;
  planEndDate?: string;
  isActive: boolean;
  remainingSessions?: number;
  totalSessions?: number;
  createdAt?: string;
  updatedAt?: string;
  trainerId?: string;
  dietPlanDetails?: {
    title?: string;
  };
}

interface UserSession {
  _id: string;
  sessionDate: string;
  sessionTime: string;
  sessionAgainstType: string;
  isSessionCompleted: boolean;
  sessionStatus?: "scheduled" | "completed" | "cancelled";
}

interface PaymentHistoryItem {
  _id: string;
  amount: number;
  status?: string;
  createdAt?: string;
  cartItems?: PaymentHistoryCartItem[];
}

interface PaymentHistoryCartItem {
  quantity?: number;
  plan?: {
    title?: string;
    planName?: string;
    planItem?: {
      planName?: string;
    };
  };
  product?: {
    title?: string;
    productName?: string;
  };
  service?: {
    title?: string;
  };
  dietPlanDetails?: {
    title?: string;
  };
}

interface ProgressMediaGroup {
  date: string;
  images: Array<{
    url: string;
    date?: string;
  }>;
}

interface TrainerChatSummary {
  chatId?: string;
  userId?: string;
  trainerId?: string;
  updatedAt?: string;
  createdAt?: string;
}

const sortUsersList = (items: User[]) =>
  [...items].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    return (a.name || "").localeCompare(b.name || "");
  });

const getChatSortTime = (chat: TrainerChatSummary) => {
  const timestamp = chat.updatedAt || chat.createdAt;
  const parsedTime = timestamp ? new Date(timestamp).getTime() : 0;
  return Number.isFinite(parsedTime) ? parsedTime : 0;
};

type ClientProfileTab =
  | "overview"
  | "upcoming"
  | "history"
  | "health"
  | "measurements"
  | "progress";

const clientProfileTabs: Array<{
  key: ClientProfileTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "overview", label: "Overview", icon: "grid-outline" },
  { key: "upcoming", label: "Upcoming", icon: "calendar-outline" },
  { key: "history", label: "History", icon: "time-outline" },
  { key: "health", label: "Health", icon: "pulse-outline" },
  { key: "measurements", label: "Measurements", icon: "analytics-outline" },
  { key: "progress", label: "Progress", icon: "images-outline" },
];

const getSessionTimestamp = (session: UserSession) => {
  const baseDate = new Date(session.sessionDate);
  if (Number.isNaN(baseDate.getTime())) {
    return 0;
  }

  if (session.sessionTime) {
    const [hours = "0", minutes = "0"] = session.sessionTime.split(":");
    baseDate.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  } else {
    baseDate.setHours(0, 0, 0, 0);
  }

  return baseDate.getTime();
};

const getSessionStatus = (session: UserSession) => {
  if (session.sessionStatus) {
    return session.sessionStatus.toLowerCase();
  }

  return session.isSessionCompleted ? "completed" : "scheduled";
};

const splitSessionsByTimeline = (items: UserSession[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();

  const upcoming = items.filter((session) => {
    const status = getSessionStatus(session);
    const sessionTimestamp = getSessionTimestamp(session);
    return (
      sessionTimestamp >= startOfToday &&
      status !== "completed" &&
      status !== "cancelled"
    );
  });

  const history = items.filter((session) => !upcoming.some((item) => item._id === session._id));

  return {
    upcoming: [...upcoming].sort((a, b) => getSessionTimestamp(a) - getSessionTimestamp(b)),
    history: [...history].sort((a, b) => getSessionTimestamp(b) - getSessionTimestamp(a)),
  };
};

const formatLongDate = (value?: string) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCompactDate = (value?: string) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });
};

const formatAmount = (value?: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getPaymentItemLabel = (item?: PaymentHistoryCartItem) =>
  item?.plan?.title ||
  item?.plan?.planName ||
  item?.plan?.planItem?.planName ||
  item?.service?.title ||
  item?.dietPlanDetails?.title ||
  item?.product?.title ||
  item?.product?.productName ||
  "Item";

function TrainerDashboard() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UserSession[]>([]);
  const [sessionHistory, setSessionHistory] = useState<UserSession[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [progressMedia, setProgressMedia] = useState<ProgressMediaGroup[]>([]);
  const [profileTab, setProfileTab] = useState<ClientProfileTab>("overview");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<string>>(new Set());
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [videoCallDetails, setVideoCallDetails] = useState<{
    appId: string;
    channelName: string;
    token: any;
    callId: any;
  } | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    loadCurrentRole();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchWrapper.get(`${baseUrl}/get-all-users`);

      if (response.success && response.data) {
        const regularUsers = sortUsersList(response.data.filter(
          (user: User) => user.role === "user"
        ));
        setUsers(regularUsers);
        setFilteredUsers(regularUsers);
        setSelectedUser((prev) =>
          prev ? regularUsers.find((user) => user._id === prev._id) || prev : prev
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = useCallback(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(normalizedQuery) ||
        user.email?.toLowerCase().includes(normalizedQuery) ||
        user.phoneNumber?.toLowerCase().includes(normalizedQuery)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadCurrentRole = async () => {
    try {
      const userCheck = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (userCheck.exists && userCheck.data?.role) {
        setCurrentUserRole(userCheck.data.role);
      }
    } catch (error) {
      console.error("Error loading current role:", error);
    }
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    setDetailsError("");
    setExpandedPlanIds(new Set());
    setProfileTab("overview");
    await fetchUserDetails(user._id);
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);
      setDetailsError("");
      setUserPlans([]);
      setUpcomingSessions([]);
      setSessionHistory([]);
      setPaymentHistory([]);
      setProgressMedia([]);

      const [plansResult, sessionsResult, paymentsResult, progressResult] =
        await Promise.allSettled([
          fetchWrapper.get(`${baseUrl}/get-active-plans?userId=${userId}&isActive=true`),
          fetchWrapper.get(`${baseUrl}/get-sessions?id=${userId}`),
          paymentService.getTotalPurchaseHistory(userId),
          transformatiomImageService.getTransformationImages(userId),
        ]);

      const failedSections: string[] = [];

      if (plansResult.status === "fulfilled" && plansResult.value.success) {
        setUserPlans(plansResult.value.data || []);
      } else {
        failedSections.push("plans");
      }

      if (sessionsResult.status === "fulfilled" && sessionsResult.value.success) {
        const { upcoming, history } = splitSessionsByTimeline(
          (sessionsResult.value.data || []) as UserSession[]
        );
        setUpcomingSessions(upcoming);
        setSessionHistory(history);
      } else {
        failedSections.push("sessions");
      }

      if (paymentsResult.status === "fulfilled" && paymentsResult.value.success) {
        setPaymentHistory((paymentsResult.value.data || []) as PaymentHistoryItem[]);
      } else {
        failedSections.push("payments");
      }

      if (progressResult.status === "fulfilled" && progressResult.value.success) {
        setProgressMedia((progressResult.value.data || []) as ProgressMediaGroup[]);
      } else {
        failedSections.push("progress");
      }

      if (failedSections.length > 0) {
        setDetailsError(
          `Some client sections could not be loaded: ${failedSections.join(", ")}.`
        );
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setDetailsError("We couldn't load the latest client details. Try again in a moment.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStartChat = async (user: User) => {
    try {
      if (loadingDetails) {
        Alert.alert("Please wait", "Client details are still loading.");
        return;
      }

      const userCheck = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userCheck.exists || !userCheck.data?._id) {
        Alert.alert("Error", "Unable to open this chat right now.");
        return;
      }

      const loggedInRole = userCheck.data.role || currentUserRole || "trainer";
      const loggedInUserId = userCheck.data._id;

      if (loggedInRole === "admin") {
        router.push({
          pathname: "/dashboard/supportchat",
          params: {
            userId: user._id,
            userName: user.name,
          },
        } as any);
        setShowUserDetails(false);
        return;
      }

      const candidateTrainerIds = Array.from(
        new Set(
          userPlans
            .map((plan) => plan.trainerId)
            .filter((trainerId): trainerId is string => Boolean(trainerId))
        )
      );

      let resolvedTrainerId = loggedInUserId;
      let resolvedChatId = "";

      if (candidateTrainerIds.length > 0) {
        const chatResponses = await Promise.all(
          candidateTrainerIds.map(async (trainerId) => {
            try {
              const response = await chatService.getTrainerChats(trainerId);
              return { trainerId, response };
            } catch (error) {
              console.error("Error fetching trainer chats:", error);
              return { trainerId, response: null };
            }
          })
        );

        const matchingChats = chatResponses.flatMap(({ trainerId, response }) => {
          if (!response?.success || !Array.isArray(response.data)) {
            return [];
          }

          return response.data
            .filter((chat: TrainerChatSummary) => {
              if (chat.userId) {
                return chat.userId === user._id;
              }

              return typeof chat.chatId === "string" && chat.chatId.startsWith(`${user._id}-`);
            })
            .map((chat: TrainerChatSummary) => ({
              ...chat,
              trainerId: chat.trainerId || trainerId,
            }));
        });

        if (matchingChats.length > 0) {
          const latestChat = [...matchingChats].sort(
            (a, b) => getChatSortTime(b) - getChatSortTime(a)
          )[0];

          resolvedTrainerId = latestChat.trainerId || candidateTrainerIds[0];
          resolvedChatId = latestChat.chatId || `${user._id}-${resolvedTrainerId}`;
        } else {
          resolvedTrainerId = candidateTrainerIds[0];
          resolvedChatId = `${user._id}-${resolvedTrainerId}`;
        }
      } else {
        resolvedChatId = `${user._id}-${resolvedTrainerId}`;
      }

      router.push({
        pathname: "/dashboard/trainerchat",
        params: {
          userId: user._id,
          userName: user.name,
          trainerId: resolvedTrainerId,
          chatId: resolvedChatId,
        },
      } as any);
      setShowUserDetails(false);
    } catch (error) {
      console.error("Error opening trainer chat:", error);
      Alert.alert("Error", "Unable to open this conversation.");
    }
  };

  const handleStartVideoCall = async (user: User) => {
    try {
      setLoadingDetails(true);

      const userCheck = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userCheck.exists || !userCheck.data) {
        Alert.alert("Error", "User not found");
        return;
      }

      const channelName = `trainer_${userCheck.data._id}_${user._id}_${Date.now()}`;

      const createResponse = await videocallService.createOpenVideoCall({
        channelName,
        duration: 3600,
        participantIds: [user._id],
        participantsCanSeeEachOther: true,
      });

      if (createResponse.success && createResponse.data) {
        const { appId, token, callId, _id: videoCallId } = createResponse.data;

        setVideoCallDetails({
          appId,
          channelName,
          token,
          callId,
        });
        setShowVideoCallModal(true);
        setShowUserDetails(false);

        // Send notification to user after 2 seconds (give time for call to establish)
        setTimeout(async () => {
          try {
            const trainerName = userCheck.data.name || "Your trainer";
            const notification = {
              title: "Join the video call",
              body: `${trainerName} is requesting you to join the call`,
              senderId: userCheck.data._id,
              receiverId: user._id,
              data: {
                screenName: "/dashboard/notification",
                videoCallId: videoCallId,
                channelName: channelName,
                type: "video",
                navigationData: {
                  screen: "/dashboard/notification",
                  params: {},
                },
              },
            };

            await notificationService.addUserNotification([notification]);
            console.log("Video call notification sent to user");
          } catch (notifError) {
            console.error("Failed to send notification:", notifError);
            // Don't show error to user since call already started
          }
        }, 2000);
      } else {
        Alert.alert("Error", createResponse.message || "Failed to start video call");
      }
    } catch (error: any) {
      console.error("Error starting video call:", error);
      Alert.alert("Error", error.message || "Failed to start video call");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewSessions = () => {
    if (selectedUser) {
      router.push({
        pathname: "/dashboard/trainerSessionCalendar",
        params: { userId: selectedUser._id, userName: selectedUser.name },
      } as any);
      setShowUserDetails(false);
    }
  };

  const handleAssignDietPlan = () => {
    if (selectedUser) {
      router.push({
        pathname: "/dashboard/assignDietPlan",
        params: { userId: selectedUser._id, userName: selectedUser.name },
      } as any);
      setShowUserDetails(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlanIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "N/A";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";

    const parts = name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2);

    return parts.map((part) => part[0]?.toUpperCase()).join("") || "U";
  };

  const totalClients = users.length;
  const activeClients = users.filter((user) => user.isActive).length;
  const inactiveClients = Math.max(totalClients - activeClients, 0);
  const headerTitle = currentUserRole === "admin" ? "Client Dashboard" : "My Clients";
  const headerSubtitle = searchQuery.trim()
    ? `${filteredUsers.length} result${filteredUsers.length === 1 ? "" : "s"} found`
    : `${totalClients} client${totalClients === 1 ? "" : "s"} in your workspace`;

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserSelect(item)}
      activeOpacity={0.8}
    >
      <View style={styles.userCardContent}>
        <View style={[
          styles.userAvatar,
          {
            borderColor: item.isActive ? theme.colors.success : theme.colors.border,
            backgroundColor: item.isActive ? theme.colors.backgroundCardLight : theme.colors.backgroundSecondary
          }
        ]}>
          {item.profilePic ? (
            <Image source={{ uri: item.profilePic }} style={styles.userAvatarImage} />
          ) : (
            <Text style={styles.userAvatarText}>{getUserInitials(item.name)}</Text>
          )}
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? theme.colors.success : theme.colors.textMuted }
          ]} />
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.name || "Unknown User"}
            </Text>
            <View
              style={[
                styles.userStatePill,
                {
                  backgroundColor: item.isActive
                    ? theme.colors.greenLight
                    : theme.colors.backgroundSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.userStatePillText,
                  { color: item.isActive ? theme.colors.success : theme.colors.textMuted },
                ]}
              >
                {item.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email || "No email added"}
          </Text>
          {item.phoneNumber && (
            <View style={styles.phoneContainer}>
              <Ionicons name="call" size={12} color={theme.colors.textMuted} />
              <Text style={styles.userPhone} numberOfLines={1}>
                {item.phoneNumber}
              </Text>
            </View>
          )}
          {item.userDetails?.goal ? (
            <View style={styles.goalChip}>
              <Ionicons name="flag-outline" size={12} color={theme.colors.secondPrimary} />
              <Text style={styles.goalChipText} numberOfLines={1}>
                {item.userDetails.goal}
              </Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  const openMediaPreview = (url: string) => {
    const normalized = (url || "").toLowerCase();
    const type = normalized.endsWith(".mp4") || normalized.endsWith(".mov") ? "video" : "image";
    setSelectedMedia({ url, type });
    setShowMediaModal(true);
  };

  const renderPlansSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="barbell" size={22} color={theme.colors.text} />
        <Text style={styles.sectionTitle}>Active Plans</Text>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{userPlans.length}</Text>
        </View>
      </View>

      {loadingDetails ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : userPlans.length > 0 ? (
        userPlans.map((plan) => {
          const isExpanded = expandedPlanIds.has(plan._id);
          const planName =
            plan.plan?.title ||
            plan.plan?.planName ||
            plan.plan?.planItem?.planName ||
            plan.dietPlanDetails?.title ||
            "Plan";

          return (
            <View key={plan._id}>
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => togglePlanExpansion(plan._id)}
                activeOpacity={0.7}
              >
                <View style={styles.listItemIcon}>
                  <Ionicons name="barbell" size={20} color={theme.colors.text} />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{planName}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {formatDate(plan.planStartDate)}
                    {" - "}
                    {formatDate(plan.planEndDate)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: plan.isActive
                          ? theme.colors.text + "15"
                          : theme.colors.textMuted + "15",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        { color: plan.isActive ? theme.colors.text : theme.colors.textMuted },
                      ]}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.colors.text}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.planDetailsContainer}>
                  <View style={styles.planDetailRow}>
                    <Ionicons name="layers-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.planDetailLabel}>Plan Name:</Text>
                    <Text style={styles.planDetailValue} numberOfLines={2}>
                      {planName}
                    </Text>
                  </View>

                  <View style={styles.planDetailRow}>
                    <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.planDetailLabel}>Purchase Date:</Text>
                    <Text style={styles.planDetailValue}>{formatDate(plan.createdAt)}</Text>
                  </View>

                  <View style={styles.planDetailRow}>
                    <Ionicons name="calendar-number-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.planDetailLabel}>Plan Duration:</Text>
                    <Text style={styles.planDetailValue}>
                      {formatDate(plan.planStartDate)} - {formatDate(plan.planEndDate)}
                    </Text>
                  </View>

                  {plan.plan?.planItem?.isOnline !== undefined && (
                    <View style={styles.planDetailRow}>
                      <Ionicons name="globe-outline" size={18} color={theme.colors.textMuted} />
                      <Text style={styles.planDetailLabel}>Type:</Text>
                      <Text style={styles.planDetailValue}>
                        {plan.plan.planItem.isOnline ? "Online" : "Offline"}
                      </Text>
                    </View>
                  )}

                  {plan.plan?.planItem?.duration && (
                    <View style={styles.planDetailRow}>
                      <Ionicons name="time-outline" size={18} color={theme.colors.textMuted} />
                      <Text style={styles.planDetailLabel}>Duration:</Text>
                      <Text style={styles.planDetailValue}>
                        {plan.plan.planItem.duration} {plan.plan.planItem.durationType || "days"}
                      </Text>
                    </View>
                  )}

                  {(plan.totalSessions !== undefined ||
                    plan.plan?.planItem?.sessionCount !== undefined) && (
                    <View style={styles.planDetailRow}>
                      <Ionicons name="fitness-outline" size={18} color={theme.colors.textMuted} />
                      <Text style={styles.planDetailLabel}>Total Sessions:</Text>
                      <Text style={styles.planDetailValue}>
                        {plan.totalSessions || plan.plan?.planItem?.sessionCount}
                      </Text>
                    </View>
                  )}

                  {plan.remainingSessions !== undefined && (
                    <View style={styles.planDetailRow}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color={theme.colors.textMuted}
                      />
                      <Text style={styles.planDetailLabel}>Remaining:</Text>
                      <Text style={styles.planDetailValue}>{plan.remainingSessions} sessions</Text>
                    </View>
                  )}

                  <View style={styles.planDetailRow}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.textMuted}
                    />
                    <Text style={styles.planDetailLabel}>Last Updated:</Text>
                    <Text style={styles.planDetailValue}>{formatDate(plan.updatedAt)}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="clipboard-outline" size={40} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>No active plans</Text>
        </View>
      )}
    </View>
  );

  const renderSessionList = (
    title: string,
    sessions: UserSession[],
    emptyLabel: string
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="calendar" size={22} color={theme.colors.text} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{sessions.length}</Text>
        </View>
      </View>

      {loadingDetails ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : sessions.length > 0 ? (
        sessions.map((session) => {
          const status = getSessionStatus(session);
          const isUpcoming = title.toLowerCase().includes("upcoming");
          const statusBackground =
            status === "completed"
              ? theme.colors.success + "16"
              : status === "cancelled"
              ? theme.colors.error + "16"
              : theme.colors.text + "15";
          const statusColor =
            status === "completed"
              ? theme.colors.success
              : status === "cancelled"
              ? theme.colors.error
              : theme.colors.text;

          return (
            <View key={session._id} style={styles.listItem}>
              <View style={styles.listItemIcon}>
                <Ionicons
                  name={isUpcoming ? "time-outline" : "albums-outline"}
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>
                  {session.sessionAgainstType === "againstPlan" ? "Plan Session" : "Service Session"}
                </Text>
                <Text style={styles.listItemSubtitle}>
                  {formatLongDate(session.sessionDate)}
                  {session.sessionTime ? ` • ${session.sessionTime}` : ""}
                </Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: statusBackground }]}>
                <Text style={[styles.statusChipText, { color: statusColor }]}>
                  {isUpcoming ? "Upcoming" : status}
                </Text>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={40} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>{emptyLabel}</Text>
        </View>
      )}
    </View>
  );

  const renderPaymentsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="card-outline" size={22} color={theme.colors.text} />
        <Text style={styles.sectionTitle}>Payment History</Text>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{paymentHistory.length}</Text>
        </View>
      </View>

      {loadingDetails ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : paymentHistory.length > 0 ? (
        paymentHistory.map((payment) => (
          <View key={payment._id} style={styles.paymentCard}>
            <View style={styles.paymentHeaderRow}>
              <View>
                <Text style={styles.paymentAmount}>{formatAmount(payment.amount)}</Text>
                <Text style={styles.paymentMeta}>{formatDate(payment.createdAt)}</Text>
              </View>
              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      payment.status === "success"
                        ? theme.colors.success + "16"
                        : payment.status === "pending"
                        ? theme.colors.warning + "18"
                        : theme.colors.error + "16",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    {
                      color:
                        payment.status === "success"
                          ? theme.colors.success
                          : payment.status === "pending"
                          ? theme.colors.warning
                          : theme.colors.error,
                    },
                  ]}
                >
                  {(payment.status || "unknown").toUpperCase()}
                </Text>
              </View>
            </View>

            {payment.cartItems && payment.cartItems.length > 0 ? (
              <View style={styles.paymentItemsWrap}>
                {payment.cartItems.slice(0, 3).map((item, index) => (
                  <View key={`${payment._id}-${index}`} style={styles.paymentItemRow}>
                    <View style={styles.paymentDot} />
                    <Text style={styles.paymentItemText}>
                      {(item.quantity || 1)}x {getPaymentItemLabel(item)}
                    </Text>
                  </View>
                ))}
                {payment.cartItems.length > 3 ? (
                  <Text style={styles.paymentOverflowText}>
                    +{payment.cartItems.length - 3} more item
                    {payment.cartItems.length - 3 === 1 ? "" : "s"}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.paymentMeta}>No item details available.</Text>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="card-outline" size={40} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>No payments recorded for this client</Text>
        </View>
      )}
    </View>
  );

  const renderProgressSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="images-outline" size={22} color={theme.colors.text} />
        <Text style={styles.sectionTitle}>Progress Media</Text>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{progressMedia.length}</Text>
        </View>
      </View>

      {loadingDetails ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : progressMedia.length > 0 ? (
        progressMedia.map((group) => (
          <View key={group.date} style={styles.progressGroupCard}>
            <View style={styles.progressGroupHeader}>
              <View>
                <Text style={styles.progressGroupTitle}>{formatLongDate(group.date)}</Text>
                <Text style={styles.progressGroupMeta}>
                  {group.images.length} file{group.images.length === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {group.images.map((item, index) => {
                const isVideo = /\.(mp4|mov)$/i.test(item.url);
                return (
                  <TouchableOpacity
                    key={`${group.date}-${index}`}
                    style={styles.progressTile}
                    onPress={() => openMediaPreview(item.url)}
                    activeOpacity={0.85}
                  >
                    {isVideo ? (
                      <View style={styles.progressVideoTile}>
                        <Ionicons name="play-circle" size={28} color={theme.colors.textWhite} />
                        <Text style={styles.progressVideoText}>Video</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: item.url }} style={styles.progressImage} />
                    )}
                    <View style={styles.progressTileFooter}>
                      <Text style={styles.progressTileFooterText}>
                        {formatCompactDate(item.date || group.date)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="images-outline" size={40} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>No progress images or videos uploaded yet</Text>
        </View>
      )}
    </View>
  );

  const renderOverviewTab = () => (
    <>
      <View style={styles.overviewGrid}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewValue}>{userPlans.length}</Text>
          <Text style={styles.overviewLabel}>Active Plans</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewValue}>{upcomingSessions.length}</Text>
          <Text style={styles.overviewLabel}>Upcoming Sessions</Text>
        </View>
      </View>

      {detailsError ? (
        <View style={styles.inlineErrorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={theme.colors.warning} />
          <Text style={styles.inlineErrorText}>{detailsError}</Text>
        </View>
      ) : null}

      {selectedUser?.userDetails && (
        <View style={styles.detailsCard}>
          <View style={styles.detailsCardHeader}>
            <Ionicons name="person-circle" size={24} color={theme.colors.text} />
            <Text style={styles.detailsCardTitle}>Client Details</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="resize" size={20} color={theme.colors.textMuted} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailValue}>{selectedUser.userDetails.height || "Not set"}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="fitness" size={20} color={theme.colors.textMuted} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Current Weight</Text>
              <Text style={styles.detailValue}>{selectedUser.userDetails.weight || "Not set"}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="flag" size={20} color={theme.colors.textMuted} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Target Weight</Text>
              <Text style={styles.detailValue}>
                {selectedUser.userDetails.targetWeight || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="trophy" size={20} color={theme.colors.textMuted} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Fitness Goal</Text>
              <Text style={styles.detailValue}>{selectedUser.userDetails.goal || "Not set"}</Text>
            </View>
          </View>
        </View>
      )}

      {renderPlansSection()}
      {renderSessionList("Upcoming Sessions", upcomingSessions.slice(0, 3), "No upcoming sessions")}
    </>
  );

  const renderUserDetailsModal = () => (
    <Modal
      visible={showUserDetails}
      animationType="slide"
      onRequestClose={() => setShowUserDetails(false)}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
          <TouchableOpacity
            onPress={() => setShowUserDetails(false)}
            style={styles.modalBackButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Client Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        {selectedUser && (
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatarWrapper}>
                <View style={styles.profileAvatar}>
                  {selectedUser.profilePic ? (
                    <Image source={{ uri: selectedUser.profilePic }} style={styles.profileAvatarImage} />
                  ) : (
                    <Text style={styles.profileAvatarInitials}>
                      {getUserInitials(selectedUser.name)}
                    </Text>
                  )}
                </View>
                <View style={[
                  styles.profileStatusBadge,
                  { backgroundColor: selectedUser.isActive ? theme.colors.success : theme.colors.textMuted }
                ]}>
                  <Text style={styles.profileStatusText}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>

              <Text style={styles.profileName}>{selectedUser.name}</Text>
              <Text style={styles.profileEmail}>{selectedUser.email || "No email added"}</Text>
              {selectedUser.phoneNumber && (
                <View style={styles.profilePhoneWrapper}>
                  <Ionicons name="call" size={16} color={theme.colors.text} />
                  <Text style={styles.profilePhone}>{selectedUser.phoneNumber}</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      await Clipboard.setStringAsync(selectedUser.phoneNumber || '');
                      Alert.alert('Copied', 'Phone number copied to clipboard');
                    }}
                    style={styles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Quick Action CTAs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ctaRowContent}
                style={styles.ctaRow}
              >
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => handleStartChat(selectedUser)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubbles" size={18} color={theme.colors.textWhite} />
                  <Text style={styles.ctaButtonText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => handleStartVideoCall(selectedUser)}
                  disabled={loadingDetails}
                  activeOpacity={0.7}
                >
                  {loadingDetails ? (
                    <ActivityIndicator size="small" color={theme.colors.textWhite} />
                  ) : (
                    <Ionicons name="videocam" size={18} color={theme.colors.textWhite} />
                  )}
                  <Text style={styles.ctaButtonText}>Video</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleViewSessions}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar" size={18} color={theme.colors.textWhite} />
                  <Text style={styles.ctaButtonText}>Sessions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleAssignDietPlan}
                  activeOpacity={0.7}
                >
                  <Ionicons name="nutrition" size={18} color={theme.colors.textWhite} />
                  <Text style={styles.ctaButtonText}>Diet Plan</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.profileTabsContent}
              style={styles.profileTabsRow}
            >
              {clientProfileTabs.map((tab) => {
                const isActive = profileTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.profileTabChip, isActive && styles.profileTabChipActive]}
                    onPress={() => setProfileTab(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={16}
                      color={isActive ? theme.colors.textWhite : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.profileTabLabel,
                        isActive && styles.profileTabLabelActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {profileTab === "overview" && renderOverviewTab()}
            {profileTab === "upcoming" &&
              renderSessionList(
                "Upcoming Sessions",
                upcomingSessions,
                "No upcoming sessions"
              )}
            {profileTab === "history" && (
              <>
                {renderSessionList(
                  "Session History",
                  sessionHistory,
                  "No past sessions recorded"
                )}
                {renderPaymentsSection()}
              </>
            )}
            {profileTab === "health" && (
              <SessionHealthOverview
                userId={selectedUser._id}
                userDetails={{
                  _id: selectedUser._id,
                  name: selectedUser.name,
                  healthReport: selectedUser.userDetails?.healthReport,
                  height: selectedUser.userDetails?.height,
                  weight: selectedUser.userDetails?.weight,
                  targetWeight: selectedUser.userDetails?.targetWeight,
                  goal: selectedUser.userDetails?.goal,
                }}
                showHero={false}
                showMeasurements={false}
              />
            )}
            {profileTab === "measurements" && (
              <SessionHealthOverview
                userId={selectedUser._id}
                userDetails={{
                  _id: selectedUser._id,
                  name: selectedUser.name,
                  healthReport: selectedUser.userDetails?.healthReport,
                  height: selectedUser.userDetails?.height,
                  weight: selectedUser.userDetails?.weight,
                  targetWeight: selectedUser.userDetails?.targetWeight,
                  goal: selectedUser.userDetails?.goal,
                }}
                showHero={false}
                showQuickFacts={false}
                showReport={false}
              />
            )}
            {profileTab === "progress" && renderProgressSection()}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            {currentUserRole === "admin" || currentUserRole === "trainer" ? (
              <View style={styles.headerRoleBadge}>
                <Text style={styles.headerRoleBadgeText}>
                  {currentUserRole === "admin" ? "Admin" : "Trainer"}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCalendarModal(true)}
          style={styles.calendarButton}
        >
          <Ionicons name="calendar" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email or phone..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {searchQuery.trim()
              ? `Showing ${filteredUsers.length} matching client${filteredUsers.length === 1 ? "" : "s"}`
              : `Showing all ${totalClients} client${totalClients === 1 ? "" : "s"}`}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalClients}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {activeClients}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{inactiveClients}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <Text style={styles.loadingMainText}>Loading clients...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.text}
              colors={[theme.colors.text]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Ionicons name="people-outline" size={80} color={theme.colors.textMuted} />
              <Text style={styles.emptyListTitle}>No clients found</Text>
              <Text style={styles.emptyListSubtitle}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Your clients will appear here"}
              </Text>
            </View>
          }
        />
      )}

      {/* User Details Modal */}
      {renderUserDetailsModal()}

      {selectedMedia?.type === "image" && (
        <ImageViewerModal
          visible={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          imageUrl={selectedMedia.url}
        />
      )}

      {selectedMedia?.type === "video" && (
        <VideoViewerModal
          visible={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          videoUrl={selectedMedia.url}
        />
      )}

      {/* Video Call Modal */}
      {showVideoCallModal && videoCallDetails && (
        <Modal
          visible={showVideoCallModal}
          animationType="slide"
          onRequestClose={() => setShowVideoCallModal(false)}
        >
          <TrainerVideoCallScreen
            appId={videoCallDetails.appId}
            channelName={videoCallDetails.channelName}
            token={videoCallDetails.token}
            uid={videoCallDetails.callId}
            onCallEnd={() => {
              setShowVideoCallModal(false);
              setVideoCallDetails(null);
            }}
          />
        </Modal>
      )}

      {/* Monthly Sessions Calendar */}
      <MonthlySessionsCalendar
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 20,
      backgroundColor: theme.colors.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    headerContent: {
      flex: 1,
    },
    headerTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
      flexWrap: "wrap",
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    headerRoleBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.backgroundCardLight,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.border : "rgba(151, 71, 255, 0.14)",
    },
    headerRoleBadgeText: {
      fontSize: 12,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.secondPrimary,
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
    },
    calendarButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    searchSection: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.colors.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      fontSize: 15,
      color: theme.colors.text,
      fontFamily: theme.fonts.medium,
    },
    resultsRow: {
      marginTop: 12,
      marginBottom: 12,
    },
    resultsText: {
      fontSize: 13,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 22,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },
    userCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 18,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    userCardContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    userAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
      borderWidth: 2,
      position: "relative",
      overflow: "hidden",
    },
    userAvatarImage: {
      width: "100%",
      height: "100%",
    },
    userAvatarText: {
      fontSize: 18,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    statusBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 3,
      borderColor: theme.colors.backgroundCard,
    },
    userInfo: {
      flex: 1,
    },
    userNameRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      gap: 8,
    },
    userName: {
      flex: 1,
      fontSize: 17,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    userStatePill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    userStatePillText: {
      fontSize: 11,
      fontFamily: theme.fonts.semiBold,
      textTransform: "uppercase",
    },
    userEmail: {
      fontSize: 14,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
      marginBottom: 4,
    },
    phoneContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    userPhone: {
      fontSize: 13,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
    },
    goalChip: {
      marginTop: 8,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundCardLight,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.border : "rgba(151, 71, 255, 0.1)",
      maxWidth: "100%",
    },
    goalChipText: {
      flexShrink: 1,
      fontSize: 12,
      fontFamily: theme.fonts.medium,
      color: theme.colors.secondPrimary,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingMainText: {
      fontSize: 16,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
      marginTop: 16,
    },
    emptyListContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
    },
    emptyListTitle: {
      fontSize: 20,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginTop: 20,
    },
    emptyListSubtitle: {
      fontSize: 15,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
      marginTop: 8,
      textAlign: "center",
      paddingHorizontal: 40,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 20,
      backgroundColor: theme.colors.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalBackButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    profileTabsRow: {
      marginBottom: 20,
    },
    profileTabsContent: {
      gap: 10,
      paddingRight: 20,
    },
    profileTabChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    profileTabChipActive: {
      backgroundColor: theme.colors.text,
      borderColor: theme.colors.text,
    },
    profileTabLabel: {
      fontSize: 13,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textMuted,
    },
    profileTabLabelActive: {
      color: theme.colors.textWhite,
    },
    profileHeader: {
      alignItems: "center",
      paddingVertical: 24,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    profileAvatarWrapper: {
      position: "relative",
      marginBottom: 16,
    },
    profileAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: theme.colors.text,
      overflow: "hidden",
    },
    profileAvatarImage: {
      width: "100%",
      height: "100%",
    },
    profileAvatarInitials: {
      fontSize: 34,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    profileStatusBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
      borderWidth: 3,
      borderColor: theme.colors.backgroundCard,
    },
    profileStatusText: {
      fontSize: 12,
      fontFamily: theme.fonts.bold,
      color: theme.colors.white,
    },
    profileName: {
      fontSize: 26,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: 6,
      textAlign: "center",
    },
    profileEmail: {
      fontSize: 15,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
      marginBottom: 10,
    },
    profilePhoneWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    profilePhone: {
      fontSize: 15,
      fontFamily: theme.fonts.medium,
      color: theme.colors.text,
    },
    copyButton: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
    },
    ctaRow: {
      marginTop: 16,
      paddingHorizontal: 20,
    },
    ctaRowContent: {
      gap: 10,
      paddingRight: 20,
    },
    ctaButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.text,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 6,
      minWidth: 110,
    },
    ctaButtonText: {
      fontSize: 14,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textWhite,
    },
    overviewGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 20,
    },
    overviewCard: {
      flexGrow: 1,
      minWidth: "30%",
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    overviewValue: {
      fontSize: 24,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    overviewLabel: {
      fontSize: 13,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
    },
    inlineErrorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 14,
      marginBottom: 16,
      borderRadius: 14,
      backgroundColor: theme.colors.warningLight,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.border : "rgba(255, 152, 0, 0.16)",
    },
    inlineErrorText: {
      flex: 1,
      fontSize: 13,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    detailsCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    detailsCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailsCardTitle: {
      fontSize: 18,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginLeft: 10,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + "30",
    },
    detailIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    detailTextContainer: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 13,
      color: theme.colors.textMuted,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.text,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    sectionTitle: {
      flex: 1,
      fontSize: 18,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    sectionBadge: {
      backgroundColor: theme.colors.backgroundCardLight,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    sectionBadgeText: {
      fontSize: 13,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    listItemIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    listItemContent: {
      flex: 1,
    },
    listItemTitle: {
      fontSize: 15,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    listItemSubtitle: {
      fontSize: 13,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
    },
    statusChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    statusChipText: {
      fontSize: 11,
      fontFamily: theme.fonts.bold,
      textTransform: "uppercase",
    },
    paymentCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    paymentHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
    },
    paymentAmount: {
      fontSize: 18,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    paymentMeta: {
      fontSize: 13,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
    },
    paymentItemsWrap: {
      gap: 8,
    },
    paymentItemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    paymentDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.secondPrimary,
    },
    paymentItemText: {
      flex: 1,
      fontSize: 13,
      fontFamily: theme.fonts.medium,
      color: theme.colors.text,
    },
    paymentOverflowText: {
      fontSize: 12,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    loadingBox: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 14,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyBox: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 14,
      padding: 40,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
    },
    emptyText: {
      fontSize: 15,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
      marginTop: 12,
      textAlign: "center",
    },
    progressGroupCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressGroupHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    progressGroupTitle: {
      fontSize: 16,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    progressGroupMeta: {
      fontSize: 13,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    progressTile: {
      width: 132,
      marginRight: 12,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressImage: {
      width: "100%",
      height: 140,
    },
    progressVideoTile: {
      width: "100%",
      height: 140,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.text,
      gap: 8,
    },
    progressVideoText: {
      fontSize: 13,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textWhite,
    },
    progressTileFooter: {
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    progressTileFooterText: {
      fontSize: 12,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
    },
    planDetailsContainer: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 14,
      marginTop: -6,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    planDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 4,
    },
    planDetailLabel: {
      fontSize: 14,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
      minWidth: 120,
    },
    planDetailValue: {
      fontSize: 14,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.text,
      textAlign: "right",
      flex: 1,
      flexWrap: "wrap",
    },
  });

export default LoginWrapper(TrainerDashboard);
