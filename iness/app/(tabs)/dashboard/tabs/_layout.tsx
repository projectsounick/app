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
} from "react-native";
import Imagepicker from "@/app/modules/Imagepicker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname(); // ✅ get current active route
  console.log("this ispathname");

  console.log(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (!menuOpen) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
    setMenuOpen(!menuOpen);
  };

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
    </View>
  );
}
