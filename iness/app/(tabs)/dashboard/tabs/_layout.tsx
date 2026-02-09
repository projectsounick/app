import { Tabs, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import React from "react";
import { View, Dimensions } from "react-native";
import CustomTabBar from "@/app/modules/CustomTabBar";
import theme from "@/app/Theme/globalTheme";
import Imagepicker from "@/app/modules/Imagepicker";
import { Portal } from "react-native-paper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 60;
const FLOAT_BUTTON_SIZE = 60;

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const showFloatingButton =
    pathname === "/dashboard/tabs" ||
    pathname === "/dashboard/tabs/" ||
    pathname.endsWith("/dashboard/tabs/index");

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Tabs
        tabBar={(props:any) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarLabelStyle: { fontSize: theme.fontSizes.small, fontWeight: theme.fontWeights.medium as "500" },
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#888",
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color }: any) => (
              <MaterialCommunityIcons
                name="home-variant"
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="train"
          options={{
            tabBarLabel: "Train",
            tabBarIcon: ({ color }: any) => (
              <MaterialCommunityIcons name="fire" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            tabBarLabel: "Feed",
            tabBarIcon: ({ color }: any) => (
              <MaterialCommunityIcons
                name="account-group"
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="store"
          options={{
            tabBarLabel: "Store",
            tabBarIcon: ({ color }: any) => (
              <MaterialCommunityIcons name="store" size={28} color={color} />
            ),
          }}
        />
      </Tabs>

      {showFloatingButton && (
        <Portal>
          <View
            style={{
              position: "absolute",
              bottom:
                Math.max(insets.bottom, 0) + TAB_BAR_HEIGHT - FLOAT_BUTTON_SIZE / 2,
              left: SCREEN_WIDTH / 2 - FLOAT_BUTTON_SIZE / 2,
              zIndex: 1000,
              elevation: 1000,
            }}
          >
            <Imagepicker />
          </View>
        </Portal>
      )}
    </View>
  );
}
