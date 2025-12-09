import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import theme from "../Theme/globalTheme";

interface NormalHeaderProps {
  screenName: string;
  rightIcon?: boolean;
  showSupportChat?: boolean;
}

export default function NormalHeader({ screenName, rightIcon, showSupportChat }: NormalHeaderProps) {
  const router = useRouter();

  const navigation = useNavigation();



  const handleSupportChatPress = () => {
    router.push("/dashboard/supportchat");
  };

  const handleBackPress = () => {
    // Check if we can go back using React Navigation
    if (navigation.canGoBack()) {
      // There's a screen to go back to, use router.back()
      router.back();
    } else {
      // No screen to go back to, navigate to dashboard
      router.push("/dashboard/tabs" as any);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
      }}
    >
      {/* Back Button and Title */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.dark,
            borderRadius: 24,
            padding: 4,
            marginRight: 10,
          }}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 22,

            color: theme.colors.dark,
            fontFamily: theme.fonts.bold,
          }}
        >
          {screenName}
        </Text>
      </View>

      {/* Right Icons */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingRight: 20 }}>
        {showSupportChat ? (
          <TouchableOpacity
            onPress={handleSupportChatPress}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.dark} />
          </TouchableOpacity>
        ) : null}
        {/* {rightIcon ? (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#67c694",
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 16,
            }}
          >
            <Ionicons name="stats-chart-outline" size={16} color="#fff" />
            <Text style={{ marginLeft: 4, color: "#fff", fontWeight: "600", fontSize: 12 }}>
              History
            </Text>
          </TouchableOpacity>
        ) : null} */}
      </View>
    </View>
  );
}
