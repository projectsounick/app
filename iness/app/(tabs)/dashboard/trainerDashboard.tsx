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
} from "react-native";
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { router } from "expo-router";
import { config } from "@/app/shared/config";
import { fetchWrapper } from "@/app/helpers/fetchWrapper";
import VideoCallScreen from "@/app/modules/VideoCallModule";
import TrainerVideoCallScreen from "@/app/modules/TrainerVideoCallModule";
import { videocallService } from "@/app/services/videocall.service";
import { notificationService } from "@/app/services/notification.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";
import MonthlySessionsCalendar from "@/app/Modals/MonthlySessionsCalendar";

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
}

function TrainerDashboard() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<string>>(new Set());
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [videoCallDetails, setVideoCallDetails] = useState<{
    appId: string;
    channelName: string;
    token: any;
    callId: any;
  } | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchWrapper.get(`${baseUrl}/get-all-users`);

      if (response.success && response.data) {
        const regularUsers = response.data.filter(
          (user: User) => user.role === "user"
        );
        setUsers(regularUsers);
        setFilteredUsers(regularUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phoneNumber?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    await fetchUserDetails(user._id);
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);
      setUserPlans([]);
      setUserSessions([]);

      const plansResponse = await fetchWrapper.get(
        `${baseUrl}/get-active-plans?userId=${userId}&isActive=true`
      );
      if (plansResponse.success && plansResponse.data) {
        setUserPlans(plansResponse.data);
      }

      const sessionsResponse = await fetchWrapper.get(
        `${baseUrl}/get-sessions?id=${userId}`
      );
      if (sessionsResponse.success && sessionsResponse.data) {
        const upcoming = sessionsResponse.data.filter(
          (session: UserSession) => !session.isSessionCompleted
        );
        setUserSessions(upcoming);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStartChat = (user: User) => {
    router.push({
      pathname: "/dashboard/trainerchat",
      params: { userId: user._id, userName: user.name },
    } as any);
    setShowUserDetails(false);
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
    } catch (error) {
      return "N/A";
    }
  };

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
            borderColor: item.isActive ? theme.colors.text : theme.colors.border,
            backgroundColor: item.isActive ? theme.colors.text + "10" : theme.colors.backgroundCardLight
          }
        ]}>
          <Ionicons
            name="person"
            size={26}
            color={item.isActive ? theme.colors.text : theme.colors.textMuted}
          />
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? theme.colors.text : theme.colors.textMuted }
          ]} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name || "Unknown User"}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email}
          </Text>
          {item.phoneNumber && (
            <View style={styles.phoneContainer}>
              <Ionicons name="call" size={12} color={theme.colors.textMuted} />
              <Text style={styles.userPhone} numberOfLines={1}>
                {item.phoneNumber}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  const renderUserDetailsModal = () => (
    <Modal
      visible={showUserDetails}
      animationType="slide"
      onRequestClose={() => setShowUserDetails(false)}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
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
                  <Ionicons name="person" size={56} color={theme.colors.text} />
                </View>
                <View style={[
                  styles.profileStatusBadge,
                  { backgroundColor: selectedUser.isActive ? theme.colors.text : theme.colors.textMuted }
                ]}>
                  <Text style={styles.profileStatusText}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>

              <Text style={styles.profileName}>{selectedUser.name}</Text>
              <Text style={styles.profileEmail}>{selectedUser.email}</Text>
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

            {/* Client Details Card */}
            {selectedUser.userDetails && (
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
                    <Text style={styles.detailValue}>{selectedUser.userDetails.targetWeight || "Not set"}</Text>
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

            {/* Plans Section */}
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
                  const planName = plan.plan?.title || plan.plan?.planName || plan.plan?.planItem?.planName || plan.dietPlanDetails?.title || "Plan";

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
                          <View style={[
                            styles.statusChip,
                            { backgroundColor: plan.isActive ? theme.colors.text + "15" : theme.colors.textMuted + "15" }
                          ]}>
                            <Text style={[
                              styles.statusChipText,
                              { color: plan.isActive ? theme.colors.text : theme.colors.textMuted }
                            ]}>
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
                          {/* Plan Name */}
                          <View style={styles.planDetailRow}>
                            <Ionicons name="layers-outline" size={18} color={theme.colors.textMuted} />
                            <Text style={styles.planDetailLabel}>Plan Name:</Text>
                            <Text style={styles.planDetailValue} numberOfLines={2}>
                              {planName}
                            </Text>
                          </View>

                          {/* Purchase Date */}
                          <View style={styles.planDetailRow}>
                            <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
                            <Text style={styles.planDetailLabel}>Purchase Date:</Text>
                            <Text style={styles.planDetailValue}>
                              {formatDate(plan.createdAt)}
                            </Text>
                          </View>

                          {/* Plan Duration */}
                          <View style={styles.planDetailRow}>
                            <Ionicons name="calendar-number-outline" size={18} color={theme.colors.textMuted} />
                            <Text style={styles.planDetailLabel}>Plan Duration:</Text>
                            <Text style={styles.planDetailValue}>
                              {formatDate(plan.planStartDate)} - {formatDate(plan.planEndDate)}
                            </Text>
                          </View>

                          {/* Type (Online/Offline) */}
                          {plan.plan?.planItem?.isOnline !== undefined && (
                            <View style={styles.planDetailRow}>
                              <Ionicons name="globe-outline" size={18} color={theme.colors.textMuted} />
                              <Text style={styles.planDetailLabel}>Type:</Text>
                              <Text style={styles.planDetailValue}>
                                {plan.plan.planItem.isOnline ? "Online" : "Offline"}
                              </Text>
                            </View>
                          )}

                          {/* Duration */}
                          {plan.plan?.planItem?.duration && (
                            <View style={styles.planDetailRow}>
                              <Ionicons name="time-outline" size={18} color={theme.colors.textMuted} />
                              <Text style={styles.planDetailLabel}>Duration:</Text>
                              <Text style={styles.planDetailValue}>
                                {plan.plan.planItem.duration} {plan.plan.planItem.durationType || "days"}
                              </Text>
                            </View>
                          )}

                          {/* Total Sessions */}
                          {(plan.totalSessions !== undefined || plan.plan?.planItem?.sessionCount !== undefined) && (
                            <View style={styles.planDetailRow}>
                              <Ionicons name="fitness-outline" size={18} color={theme.colors.textMuted} />
                              <Text style={styles.planDetailLabel}>Total Sessions:</Text>
                              <Text style={styles.planDetailValue}>
                                {plan.totalSessions || plan.plan?.planItem?.sessionCount}
                              </Text>
                            </View>
                          )}

                          {/* Remaining Sessions */}
                          {plan.remainingSessions !== undefined && (
                            <View style={styles.planDetailRow}>
                              <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.textMuted} />
                              <Text style={styles.planDetailLabel}>Remaining:</Text>
                              <Text style={styles.planDetailValue}>
                                {plan.remainingSessions} sessions
                              </Text>
                            </View>
                          )}

                          {/* Last Updated */}
                          <View style={styles.planDetailRow}>
                            <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
                            <Text style={styles.planDetailLabel}>Last Updated:</Text>
                            <Text style={styles.planDetailValue}>
                              {formatDate(plan.updatedAt)}
                            </Text>
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

            {/* Sessions Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={22} color={theme.colors.text} />
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{userSessions.length}</Text>
                </View>
              </View>

              {loadingDetails ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={theme.colors.text} />
                </View>
              ) : userSessions.length > 0 ? (
                userSessions.map((session) => (
                  <View key={session._id} style={styles.listItem}>
                    <View style={styles.listItemIcon}>
                      <Ionicons name="time" size={20} color={theme.colors.text} />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>
                        {session.sessionAgainstType === "againstPlan" ? "Plan Session" : "Service Session"}
                      </Text>
                      <Text style={styles.listItemSubtitle}>
                        {new Date(session.sessionDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {session.sessionTime && ` • ${session.sessionTime}`}
                      </Text>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: theme.colors.text + "15" }]}>
                      <Text style={[styles.statusChipText, { color: theme.colors.text }]}>
                        Upcoming
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="calendar-outline" size={40} color={theme.colors.textMuted} />
                  <Text style={styles.emptyText}>No upcoming sessions</Text>
                </View>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Clients</Text>
          <Text style={styles.headerSubtitle}>{filteredUsers.length} total clients</Text>
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
    </View>
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
      paddingTop: 60,
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
    headerTitle: {
      fontSize: 24,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: 4,
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
    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },
    userCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 16,
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
    userName: {
      fontSize: 17,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: 4,
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
      paddingTop: 60,
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
