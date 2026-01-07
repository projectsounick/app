import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

interface NormalHeaderProps {
  screenName: string;
  rightIcon?: boolean;
  showSupportChat?: boolean;
  textColor?: string;
}

export default function NormalHeader({ screenName, rightIcon, showSupportChat, textColor }: NormalHeaderProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          paddingTop: Platform.OS === "android" ? Math.max(insets.top, 0) : 0,
        }}
      >
      {/* Back Button and Title */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
          style={{
            backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.black,
            borderRadius: 24,
            padding: 4,
            marginRight: 10,
          }}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? theme.colors.textWhite : theme.colors.textWhite} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: theme.fontSizes.large,
            color: textColor || (isDark ? theme.colors.textWhite : theme.colors.text),
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
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={isDark ? theme.colors.textWhite : theme.colors.black} />
          </TouchableOpacity>
        ) : null}
        {/* {rightIcon ? (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.colors.success,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 16,
            }}
          >
            <Ionicons name="stats-chart-outline" size={16} color="#fff" />
            <Text style={{ marginLeft: 4, color: theme.colors.textWhite, fontWeight: theme.fontWeights.medium as "500", fontSize: theme.fontSizes.small }}>
              History
            </Text>
          </TouchableOpacity>
        ) : null} */}
      </View>
    </View>
    </>
  );
}
