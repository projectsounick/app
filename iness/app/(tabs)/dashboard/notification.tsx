import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { ActivityIndicator } from "react-native-paper";
import NotificationShimmer from "@/app/modules/Shimmer/NotificationShimmer";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoCallChecker from "@/app/Modals/VideoCallJoinModal";
import eventBus from "@/event";
import { notificationService } from "@/app/services/notification.service";
import CustomSnackbar from "@/app/modules/Snackbar";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";
import NormalHeader from "@/app/modules/NormalHeader";
import dayjs from "dayjs";
import {
  handleNotificationNavigation,
  getNotificationIcon,
  NotificationData,
} from "@/app/utils/notificationRouter";

const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

interface NotificationItem {
  title: string | null;
  body: string | null;
  data: any;
  createdAt: string;
}

function NotificationScreen() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [videoCallSchedule, setVideoCallSchedule] = useState<any>({
    data: null,
    scheduled: false,
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /// Fetch notifications
  async function fetchNotificationsFromLocal() {
    setLoading(true);
    try {
      const response = await notificationService.getNotification();
      if (response.success) {
        setNotifications(response.data);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  /// Delete single notification
  async function handleDelete(notificationId: string) {
    try {
      setDeletingId(notificationId);
      const res = await notificationService.deleteNotification(notificationId);

      if (res.success) {
        setNotifications((prev) =>
          prev.filter((n) => (n as any)._id !== notificationId)
        );
      } else {
        setSnackbarOpen(true);
        setSnackbarMessage("Failed to delete notification.");
      }
    } catch (error) {
      setSnackbarOpen(true);
      setSnackbarMessage("Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  /// Open video call modal
  function openVideoCallModal(data: any) {
    setVideoCallSchedule({
      data: data,
      scheduled: true,
    });
  }

  /// Handle notification click
  function handleNotificationClick(notification: NotificationItem) {
    const notificationData: NotificationData = notification.data || {};
    
    // Special handling for video calls
    if (notificationData.type === "video") {
      openVideoCallModal(notificationData);
      return;
    }

    // Use the router utility for navigation
    handleNotificationNavigation(router, notificationData);
  }

  useEffect(() => {
    fetchNotificationsFromLocal();
    eventBus.emit("clear-notifications");
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
          }}
        >
          <NormalHeader screenName="Notifications" />
        </View>

        {/* Loader */}
        {loading ? (
          <NotificationShimmer />
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 16,
              paddingHorizontal: 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View
                style={{
                  backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
                  borderRadius: 20,
                  padding: 40,
                  alignItems: "center",
                  marginTop: 40,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  ...(isDark ? {} : {
                    shadowColor: theme.colors.black,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 3,
                  }),
                }}
              >
                <Ionicons name="notifications-outline" size={48} color={theme.colors.textMuted} />
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.regular,
                    fontWeight: "600",
                    marginTop: 12,
                    textAlign: "center",
                  }}
                >
                  No notifications available
                </Text>
              </View>
            ) : (
              notifications.map((item, index) => {
                const notificationData: NotificationData = item.data || {};
                const { icon, color: iconColor, bgColor: iconBg } = getNotificationIcon(notificationData);
                const isVideoCall = notificationData.type === "video";
                
                return (
                  <View key={index} style={{ marginBottom: 12 }}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleNotificationClick(item)}
                      style={{
                        backgroundColor: theme.colors.background,
                        borderRadius: 20,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        position: "relative",
                        ...(isDark ? {} : {
                          shadowColor: theme.colors.black,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.08,
                          shadowRadius: 12,
                          elevation: 3,
                        }),
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Notification Icon */}
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: iconBg,
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 12,
                          }}
                        >
                          {notificationData.type === "podcast" ? (
                            <MaterialCommunityIcons
                              name={icon as any}
                              size={24}
                              color={iconColor}
                            />
                          ) : (
                            <Ionicons
                              name={icon as any}
                              size={24}
                              color={iconColor}
                            />
                          )}
                        </View>

                        {/* Content */}
                        <View style={{ flex: 1 }}>
                          {/* Title and Delete Icon Row */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 6,
                            }}
                          >
                            <Text
                              style={{
                                color: theme.colors.text,
                                fontSize: theme.fontSizes.regular,
                                fontWeight: "700",
                                flex: 1,
                                paddingRight: 8,
                              }}
                              numberOfLines={2}
                            >
                              {item.title}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleDelete((item as any)._id)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: theme.colors.backgroundSecondary,
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: 8,
                              }}
                              disabled={deletingId === (item as any)._id}
                            >
                              {deletingId === (item as any)._id ? (
                                <ActivityIndicator size={16} color={theme.colors.textSecondary} />
                              ) : (
                                <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color={theme.colors.textSecondary}
                                />
                              )}
                            </TouchableOpacity>
                          </View>

                          <Text
                            style={{
                              color: theme.colors.textSecondary,
                              fontSize: theme.fontSizes.regularSmall,
                              lineHeight: 20,
                              marginBottom: 8,
                              fontWeight: "500",
                            }}
                          >
                            {item.body}
                          </Text>
                          <Text
                            style={{
                              color: theme.colors.textMuted,
                              fontSize: theme.fontSizes.small,
                              fontWeight: "500",
                            }}
                          >
                            {dayjs(item.createdAt).format("MMM D, YYYY • h:mm A")}
                          </Text>

                          {/* Join Button */}
                          {isVideoCall && (
                            <TouchableOpacity
                              onPress={() => openVideoCallModal(item.data)}
                              activeOpacity={0.8}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                alignSelf: "flex-start",
                                backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.greenLight,
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 25,
                                marginTop: 12,
                                borderWidth: 1,
                                borderColor: theme.colors.success,
                                ...(isDark ? {} : {
                                  shadowColor: theme.colors.success,
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.15,
                                  shadowRadius: 6,
                                  elevation: 3,
                                }),
                              }}
                            >
                              <Ionicons
                                name="videocam"
                                size={16}
                                color={theme.colors.success}
                                style={{ marginRight: 6 }}
                              />
                              <Text
                                style={{
                                  color: theme.colors.success,
                                  fontSize: theme.fontSizes.regularSmall,
                                  fontWeight: "700",
                                  fontFamily: theme.fonts.bold,
                                }}
                              >
                                Join Call
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Video Call Modal */}
        <VideoCallChecker
          videoCallSchedule={videoCallSchedule}
          setVideoCallSchedule={setVideoCallSchedule}
        />

        {/* Snackbar */}
        <CustomSnackbar
          visible={snackbarOpen}
          message={snackbarMessage}
          bgColor={theme.colors.primary}
          onDismiss={() => setSnackbarOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
}

export default LoginWrapper(NotificationScreen);
