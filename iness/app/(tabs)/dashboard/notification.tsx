import React from "react";
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

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    title: "Workout Reminder",
    description: "Don't forget your 5 PM session today!",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Meal Plan Updated",
    description: "Your new meal plan for the week is now available.",
    time: "5 hours ago",
  },
  {
    id: 3,
    title: "New Message",
    description: "Coach John sent you a new message.",
    time: "Yesterday",
  },
  {
    id: 4,
    title: "Progress Update",
    description: "Your weekly progress has been posted.",
    time: "2 days ago",
  },
];

export default function NotificationScreen() {
  const router = useRouter();

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
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: "#FFF",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                width: "98%",
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: theme.colors.secondPrimary,
                  fontSize: 17,
                  fontWeight: "bold",
                  marginBottom: 6,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  color: "#444",
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                {item.description}
              </Text>
              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  textAlign: "right",
                }}
              >
                {item.time}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
