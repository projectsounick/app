import { Tabs, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from "react-native";
import Imagepicker from "@/app/modules/Imagepicker";
import StreaksBottomSheet from "@/app/modules/StreakBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { setStreakModalShow } from "@/Slices/streakSlice";
import { RootState } from "@/store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DashboardLayout() {
  //// Streak modal show from the root ----------------------------/
  const streakModalShow = useSelector(
    (state: RootState) => state?.streak?.streakModalShow
  );

  const insets = useSafeAreaInsets();
  const pathname = usePathname(); // ✅ get current active route
  const dispatch = useDispatch();
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Tabs
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            paddingBottom: 2 + insets.bottom,
            paddingTop: 6,
            borderTopWidth: 0,
            height: 50 + insets.bottom,
            backgroundColor: "transparent",
          },
          headerShown: false,
          tabBarBackground: () => (
            <LinearGradient
              colors={["#140A21", "#522987"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          ),
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

      {/* ✅ Show Floating Button ONLY on Home tab */}
      {pathname === "/dashboard/tabs" && (
        <View
          style={{
            position: "absolute",
            bottom: 15 + insets.bottom,
            left: SCREEN_WIDTH / 2 - 35, // center
            zIndex: 100,
          }}
        >
          <Imagepicker />
        </View>
      )}
      {streakModalShow ? (
        <Modal
          visible={streakModalShow}
          transparent
          animationType="slide"
          onRequestClose={() => dispatch(setStreakModalShow(false))}
        >
          <StreaksBottomSheet
            onClose={() => dispatch(setStreakModalShow(false))}
          />
        </Modal>
      ) : null}
    </View>
  );
}
