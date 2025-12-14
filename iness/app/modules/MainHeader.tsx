import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  LayoutChangeEvent,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
} from "react-native-reanimated";
import theme from "../Theme/globalTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

interface UserData {
  name?: string;
  profilePic?: string;
}

interface MainHeaderProps {
  userData: any;
  scrollY: any;
  router: any;
  onHeightMeasured?: (height: number) => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  userData,
  scrollY,
  router,
  onHeightMeasured,
}) => {
  const insets = useSafeAreaInsets();
  const headerOpacity = useDerivedValue(() =>
    interpolate(scrollY.value, [0, 100], [1, 0])
  );

  const headerTranslateY = useDerivedValue(() =>
    interpolate(scrollY.value, [0, 100], [0, -20])
  );

  return (
    <>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#844ACF", "#432569"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          zIndex: 10,
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "android" ? Math.max(insets.top, 20) : 20,
          paddingBottom: 16, // ensure bottom spacing
        }}
      >
      <Animated.View
        style={{
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        {/* Top Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Profile */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{
                width: 35,
                height: 35,
                borderRadius: 35,
                backgroundColor: theme.colors.cardLight,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => router.push("/dashboard/profile")}
            >
              {userData?.profilePic ? (
                <Image
                  source={{ uri: userData.profilePic }}
                  style={{ width: 30, height: 30, borderRadius: 20 }}
                />
              ) : (
                <Ionicons name="person" size={25} color={theme.colors.text} />
              )}
            </TouchableOpacity>
            <Text style={{ color: "#fff", marginLeft: 8 }}>↑ 79 kgs</Text>
          </View>

          {/* Icons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={() => router.push("/dashboard/cart")}>
              <Ionicons name="cart-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/notification")}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
            marginTop: 8,
          }}
        >
          Namaste {userData?.name?.split(" ")[0]}! 🙏
        </Text>
        <Text style={{ color: "white" }}>
          Get ready to crush your fitness goals today.
        </Text>

        {/* Chat Button */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "4%",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#4A2A75",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              borderColor: "#A4FF55",
              borderWidth: 1,
            }}
            onPress={() => router.push("/dashboard/supportchat")}
          >
            <Text style={{ color: "#A4FF55" }}>💬 Chat with us</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </LinearGradient>
    </>
  );
};

export default MainHeader;
