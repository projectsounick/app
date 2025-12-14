import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { ActivityIndicator } from "react-native-paper";
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
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
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
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator color="#9747FF" size="large" />
          </View>
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
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 40,
                  alignItems: "center",
                  marginTop: 40,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <Ionicons name="notifications-outline" size={48} color="#999" />
                <Text
                  style={{
                    color: "#666",
                    fontSize: 16,
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
                        backgroundColor: "#FFFFFF",
                        borderRadius: 20,
                        padding: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: "#F5F5F5",
                        position: "relative",
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
                                color: "#000",
                                fontSize: 16,
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
                                backgroundColor: "#F8F8F8",
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: 8,
                              }}
                              disabled={deletingId === (item as any)._id}
                            >
                              {deletingId === (item as any)._id ? (
                                <ActivityIndicator size={16} color="#666" />
                              ) : (
                                <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color="#666"
                                />
                              )}
                            </TouchableOpacity>
                          </View>

                          <Text
                            style={{
                              color: "#666",
                              fontSize: 14,
                              lineHeight: 20,
                              marginBottom: 8,
                              fontWeight: "500",
                            }}
                          >
                            {item.body}
                          </Text>
                          <Text
                            style={{
                              color: "#999",
                              fontSize: 12,
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
                                backgroundColor: "#E8F5E9",
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 25,
                                marginTop: 12,
                                borderWidth: 1,
                                borderColor: "#67C694",
                                shadowColor: "#67C694",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.15,
                                shadowRadius: 6,
                                elevation: 3,
                              }}
                            >
                              <Ionicons
                                name="videocam"
                                size={16}
                                color="#67C694"
                                style={{ marginRight: 6 }}
                              />
                              <Text
                                style={{
                                  color: "#67C694",
                                  fontSize: 14,
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
      </ImageBackground>
    </SafeAreaView>
  );
}

export default LoginWrapper(NotificationScreen);
