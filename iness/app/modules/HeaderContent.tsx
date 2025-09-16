import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "../Theme/globalTheme";
import { Divider } from "react-native-paper";

type BackTitleInfoProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function HeaderContent({
  title = "Back",
  subtitle,
  children,
}: BackTitleInfoProps) {
  const router = useRouter();

  return (
    <View
      style={{
        width: "100%",
        paddingTop: 4,
        paddingBottom: 4,
      }}
    >
      {/* Top row: Back arrow */}
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={34}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        {/* Subtitle below / next to arrow */}
        {subtitle && (
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              numberOfLines={3}
              ellipsizeMode="tail"
              style={{
                color: "#fff",

                fontSize: 22,
                fontFamily: theme.fonts.bold,
                textAlign: "left",
                flexShrink: 1, // ✅ allows wrapping instead of overflowing
              }}
            >
              {subtitle}
            </Text>
          </View>
        )}
      </View>

      {/* Divider if children exist */}
      {children ? (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <Divider style={{ width: "90%" }} />
        </View>
      ) : null}

      {/* Optional children */}
      {children && <View style={{ marginTop: 12 }}>{children}</View>}
    </View>
  );
}
