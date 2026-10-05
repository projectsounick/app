import { Tabs, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import React from "react";
import { View, Dimensions } from "react-native";
import CustomTabBar from "@/src/modules/CustomTabBar";
import theme from "@/src/Theme/globalTheme";
import Imagepicker from "@/src/modules/Imagepicker";
import { Portal } from "react-native-paper";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

const STAFF_ROLES = ["admin", "trainer", "hr"];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 60;
const FLOAT_BUTTON_SIZE = 60;

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [isStaff, setIsStaff] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const u = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage<any>("user");
        if (active && u.exists && STAFF_ROLES.includes(u.data?.role)) {
          setIsStaff(true);
        }
      } catch {
        // ignore; default to non-staff
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Staff use the equal-width bar with the Manage tab (no center float button).
  const showFloatingButton =
    !isStaff &&
    (pathname === "/dashboard/tabs" ||
      pathname === "/dashboard/tabs/" ||
      pathname.endsWith("/dashboard/tabs/index"));

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Tabs
        tabBar={(props: any) => (
          <CustomTabBar {...props} showManage={isStaff} />
        )}
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
          name="ai"
          options={{
            tabBarLabel: "AI Coach",
            tabBarIcon: ({ color }: any) => (
              <MaterialCommunityIcons name="robot" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="store"
          options={{
            href: null,
            tabBarLabel: "Store",
            tabBarIcon: ({ color }: any) => (
              <MaterialCommunityIcons name="store" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="manage"
          options={{
            // Hidden from the tab bar unless the logged-in user is staff.
            href: isStaff ? undefined : null,
            tabBarLabel: "Manage",
            tabBarIcon: ({ color }: any) => (
              <MaterialCommunityIcons name="shield-account" size={28} color={color} />
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
