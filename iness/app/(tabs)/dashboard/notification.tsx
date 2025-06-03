import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { getStoredNotifications } from "@/utils/notificationUtils";
import { Divider } from "react-native-paper";

interface NotificationItem {
  title: string | null;
  body: string | null;
  data: any;
  receivedAt: string;
}

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  /// function for fetching the notificaitons ---------------------------/
  async function fetchNotificationsFromLocal() {
    const response = await getStoredNotifications();
    if (response) {
      setNotifications(response);
    }
  }
  useEffect(() => {
    fetchNotificationsFromLocal();
  }, []);
  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpeg")} // ✅ replace with your background
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Overlay for contrast */}
      <View
        style={{
          flex: 1,

          paddingHorizontal: 16,
          paddingTop: 20,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
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

        {/* Notifications */}
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
              <View key={index}>
                <View>
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
                    style={{ color: "#444", fontSize: 14, marginBottom: 4 }}
                  >
                    {item.body}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 12 }}>
                    {new Date(item.receivedAt).toLocaleString()}
                  </Text>
                </View>

                <Divider
                  style={{ backgroundColor: "#ddd", height: 1, marginTop: 8 }}
                />
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
