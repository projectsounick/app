import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { bottomTabs } from "@/utils/staticDataUtils";
import theme from "../Theme/globalTheme";

////// Main functional component for the bottom navbar -----------------------/
export default function BottomNavBar({ pathname, router }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: theme.colors.secondPrimary,
        height: 70,
        paddingTop: 6,
        paddingBottom: 6,

        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      {bottomTabs.map((tab: any) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.path}
            onPress={() => router.push(tab.path)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={28}
              color={isActive ? theme.colors.textWhite : theme.colors.textMuted}
            />
            <Text
              style={{
                color: isActive ? theme.colors.textWhite : theme.colors.textMuted,
                fontSize: theme.fontSizes.small,
                textAlign: "center",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
