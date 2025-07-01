import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import {
  getStoredNotifications,
  deleteNotificationByIndex,
} from "@/utils/notificationUtils";
import { ActivityIndicator, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoCallChecker from "@/app/modules/VideoCallJoinModal";
import eventBus from "@/event";
import { notificationService } from "@/app/services/notification.service";
import CustomSnackbar from "@/app/modules/Snackbar";

interface NotificationItem {
  title: string | null;
  body: string | null;
  data: any;
  createdAt: string;
}

export default function NotificationScreen() {
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

  /// Fetch notifications from AsyncStorage
  async function fetchNotificationsFromLocal() {
    setLoading(true);

    try {
      const response = await notificationService.getNotification();
      console.log(response);
      if (response.success) {
        setNotifications(response.data);
      } else {
        setSnackbarOpen(true);
        setSnackbarMessage("Some error has happened");
      }
    } catch (error) {
      setSnackbarOpen(true);
      setSnackbarMessage("Some error has happened");
    } finally {
      setLoading(false);
    }
  }

  /// Delete single notification
  async function handleDelete(notificationId: string) {
    try {
      setDeletingId(notificationId); // set loading for this one
      const res = await notificationService.deleteNotification(notificationId);

      if (res.success) {
        // Remove the notification from local state
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
      setDeletingId(null); // reset loading state
    }
  }

  /// Open video call modal
  function openVideoCallModal(data: any) {
    setVideoCallSchedule({
      data: data,
      scheduled: true,
    });
  }

  useEffect(() => {
    fetchNotificationsFromLocal();
    eventBus.emit("clear-notifications");
    return () => {};
  }, []);

  function setSnackbarVisible(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            paddingLeft: 20,
            paddingTop: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.dark,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={25}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text
            style={{
              color: "#333",
              fontSize: 22,
              fontWeight: "bold",
              marginLeft: 20,
            }}
          >
            Notifications
          </Text>
        </View>
        {loading ? (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 2,
              paddingHorizontal: 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <Text
                style={{
                  color: "#888",
                  fontSize: 16,
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                No notifications available.
              </Text>
            ) : (
              notifications.map((item, index) => (
                <View key={index} style={{ marginBottom: 16 }}>
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 12,
                      padding: 12,
                      borderColor: theme.colors.cardLight,
                      borderWidth: 1,
                      position: "relative",
                    }}
                  >
                    {/* Delete Icon */}
                    <TouchableOpacity
                      onPress={() => handleDelete((item as any)._id)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        padding: 4,
                      }}
                      disabled={deletingId === (item as any)._id}
                    >
                      {deletingId === (item as any)._id ? (
                        <ActivityIndicator size={16} color="#000" />
                      ) : (
                        <MaterialCommunityIcons
                          name="delete"
                          size={18}
                          color="#000"
                        />
                      )}
                    </TouchableOpacity>

                    {/* Content */}
                    <Text
                      style={{
                        color: theme.colors.secondPrimary,
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{ color: "#444", fontSize: 14, marginBottom: 6 }}
                    >
                      {item.body}
                    </Text>
                    <Text
                      style={{ color: "#888", fontSize: 12, marginBottom: 8 }}
                    >
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>

                    {/* Join Video Button */}
                    {item.data?.type === "video" && (
                      <TouchableOpacity
                        onPress={() => openVideoCallModal(item.data)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          alignSelf: "flex-start",
                          backgroundColor: theme.colors.primary,
                          paddingVertical: 6,
                          paddingHorizontal: 16,
                          borderRadius: 20,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="video"
                          size={16}
                          color="#000"
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            color: "#000",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          Join
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Divider
                    style={{
                      backgroundColor: "#ccc",
                      height: 1,
                      marginTop: 12,
                    }}
                  />
                </View>
              ))
            )}
          </ScrollView>
        )}
        {/* Notifications List */}

        {/* Video Call Modal Slide-Up */}
        <VideoCallChecker
          videoCallSchedule={videoCallSchedule}
          setVideoCallSchedule={setVideoCallSchedule}
        />
        <CustomSnackbar
          visible={snackbarOpen}
          message={snackbarMessage}
          bgColor={theme.colors.primary}
          onDismiss={() => setSnackbarVisible(false)}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}
