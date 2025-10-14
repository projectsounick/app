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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoCallChecker from "@/app/modules/VideoCallJoinModal";
import eventBus from "@/event";
import { notificationService } from "@/app/services/notification.service";
import CustomSnackbar from "@/app/modules/Snackbar";

const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

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

  /// Fetch notifications
  async function fetchNotificationsFromLocal() {
    setLoading(true);
    try {
      const response = await notificationService.getNotification();
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
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            paddingLeft: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
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
              fontFamily: theme.fonts.bold,
              marginLeft: 20,
            }}
          >
            Notifications
          </Text>
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
                  fontFamily: theme.fonts.bold,
                }}
              >
                No notifications available.
              </Text>
            ) : (
              notifications.map((item, index) => (
                <View key={index} style={{ marginBottom: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: 16,
                      padding: 14,
                      borderColor: theme.colors.cardLight,
                      borderWidth: 1,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 6,
                      elevation: 3,
                      position: "relative",
                    }}
                  >
                    {/* Notification Icon */}
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: "#ddd",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={
                          item.data?.type === "video" ? "video" : "bell-outline"
                        }
                        size={22}
                        color="#333"
                      />
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: theme.colors.secondPrimary,
                          fontSize: 16,
                          fontWeight: "700",
                          marginBottom: 4,
                          fontFamily: theme.fonts.bold,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          color: "#444",
                          fontSize: 14,
                          marginBottom: 6,
                          lineHeight: 20,
                          fontFamily: theme.fonts.medium,
                        }}
                      >
                        {item.body}
                      </Text>
                      <Text
                        style={{
                          color: "#888",
                          fontSize: 12,
                          marginBottom: 8,
                          fontFamily: theme.fonts.regular,
                        }}
                      >
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>

                      {/* Join Button */}
                      {item.data?.type === "video" && (
                        <TouchableOpacity
                          onPress={() => openVideoCallModal(item.data)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "flex-start",
                            backgroundColor: theme.colors.primary,
                            height: 30,
                            width: 80,

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
                              fontFamily: theme.fonts.bold,
                            }}
                          >
                            Join
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={() => handleDelete((item as any)._id)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        padding: 6,
                        borderRadius: 20,
                        backgroundColor: "rgba(0,0,0,0.05)",
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
                  </View>
                </View>
              ))
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
