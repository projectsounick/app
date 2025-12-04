import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // or useNavigation from @react-navigation/native
import theme from "../Theme/globalTheme";

interface NormalHeaderProps {
  screenName: string;
  rightIcon?: boolean;
  showSupportChat?: boolean;
}

export default function NormalHeader({ screenName, rightIcon, showSupportChat }: NormalHeaderProps) {
  const router = useRouter();

  const handleRightIconPress = () => {
    router.push("/dashboard/trackhistory");
  };

  const handleSupportChatPress = () => {
    router.push("/dashboard/supportchat");
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
          onPress={() => router.back()}
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
        {rightIcon ? (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#67c694",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 20,
            }}
          >
            <Ionicons name="stats-chart-outline" size={20} color="#fff" />
            <Text style={{ marginLeft: 6, color: "#fff", fontWeight: "bold" }}>
              History
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
