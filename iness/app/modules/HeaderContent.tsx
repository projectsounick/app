import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "../Theme/globalTheme";
import { Divider } from "react-native-paper";

type BackTitleInfoProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode; // 👈 Allow nested content
};

export default function HeaderContent({
  title = "Back",
  subtitle,
  children, // 👈 Receive children here
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
      {/* Top row: Back arrow + title */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.fontSizes.small,
            fontWeight: "500",
            marginLeft: 8,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Subtitle */}
      {subtitle && (
        <View style={{ marginTop: 8 }}>
          <Text
            numberOfLines={3}
            ellipsizeMode="tail"
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "600",
              textAlign: "left",
              marginBottom: 2,
            }}
          >
            {subtitle}
          </Text>
        </View>
      )}
      {children ? (
        <View
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Divider style={{ width: "90%" }} />
        </View>
      ) : null}
      {/* Optional children */}
      {children && <View style={{ marginTop: 6 }}>{children}</View>}
    </View>
  );
}
