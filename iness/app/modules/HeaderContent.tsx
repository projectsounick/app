import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "../Theme/globalTheme";
import { LinearGradient } from "expo-linear-gradient";

type BackTitleInfoProps = {
  title?: string;
  subtitle: string;
};

export default function HeaderContent({
  title = "Back",
  subtitle,
}: BackTitleInfoProps) {
  const router = useRouter();

  return (
    <View
      style={{
        width: "100%",
        paddingTop: 10,
        paddingBottom: 10,
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

      {/* Second row: Subtitle + duration */}
      <View style={{ marginTop: 8 }}>
        <View style={{ marginTop: 8 }}>
          <Text
            numberOfLines={3}
            ellipsizeMode="tail"
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: "600",
              marginBottom: 2,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}
