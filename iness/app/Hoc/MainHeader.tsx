// hoc/withAnimatedHeader.tsx

import React, { ReactElement, useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";

import { Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "../Theme/globalTheme";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getStoredNotifications } from "@/utils/notificationUtils";
import eventBus from "@/event";
import { StatusBar } from "expo-status-bar";
const { height } = Dimensions.get("window");
const topPadding = height * 0.04;
interface AnimatedHeaderProps {
  scrollY: Animated.Value;
  title: string;
}

const withAnimatedHeader = (WrappedComponent: React.ComponentType<any>) => {
  /// Getting the stored cart data for the ------------------/

  const ComponentWithHeader = (props: AnimatedHeaderProps): ReactElement => {
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);
    const insets = useSafeAreaInsets();
    // Use scrollY from props if provided; otherwise, create a new one
    const scrollY = props.scrollY || useRef(new Animated.Value(0)).current;
    const title = props.title;
    const [userData, setUserData] = useState<any>(null);
    const router = useRouter();
    const [notificationResponseLength, setNotificationResponseLength] =
      useState(0);
    // const headerOpacity = scrollY.interpolate({
    //   inputRange: [0, 100],
    //   outputRange: [1, 0],
    //   extrapolate: "clamp",
    // });

    // const headerTranslateY = scrollY.interpolate({
    //   inputRange: [0, 100],
    //   outputRange: [0, -80],
    //   extrapolate: "clamp",
    // });

    useEffect(() => {
      async function fetchData() {
        const response =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        const notificationResponse = await getStoredNotifications();

        setNotificationResponseLength(notificationResponse?.length ?? 0);

        if (response.exists) {
          setUserData(response.data);
        }
      }

      fetchData();

      // 📨 Handler when notification is received
      const handleNotification = () => {
        fetchData();
      };

      // ❌ Handler when notifications are cleared
      const handleClearNotification = () => {
        setNotificationResponseLength(0);
      };

      // ✅ Attach both events
      eventBus.on("notification-received", handleNotification);
      eventBus.on("clear-notifications", handleClearNotification);

      return () => {
        eventBus.off("notification-received", handleNotification);
        eventBus.off("clear-notifications", handleClearNotification);
      };
    }, []);

    return (
      <>
        <StatusBar style="light" />
        <View
          style={{
            // opacity: headerOpacity,
            // transform: [{ translateY: headerTranslateY }],

            top: 0,

            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <LinearGradient
            colors={["#844ACF", "#432569"]}
            start={{ x: 0, y: 0 }} // top
            end={{ x: 0, y: 1 }} // bottom
            style={{
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              paddingHorizontal: 20,
              paddingTop: Platform.OS === "android" ? Math.max(insets.top, 0) : 0,
              paddingBottom: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative", // important
                marginTop: Platform.OS === "ios" ? topPadding : 0,
              }}
            >
            {/* Left Side */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "33%",
              }}
            >
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 40,
                  backgroundColor: theme.colors.cardLight,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => router.push("/dashboard/profile")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 👈 Adds more tappable space
              >
                {userData?.profilePic ? (
                  <Image
                    source={{ uri: userData.profilePic }}
                    style={{ width: 38, height: 38, borderRadius: 20 }}
                  />
                ) : (
                  <Ionicons name="person" size={25} color={theme.colors.text} />
                )}
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <Feather name="arrow-up-right" size={14} color="lightgreen" />
                <Text style={{ color: "#fff" }}>
                  {userData?.weight ? parseFloat(userData.weight.toString()).toFixed(1) : "0.0"} kgs
                </Text>
              </View>
            </View>

            {/* Title in absolute center */}
            <Text
              style={{
                textAlign: "center",
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
                fontSize: theme.fontSizes.regularSmall,
              }}
            >
              {title}
            </Text>

            {/* Right Side */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                width: "33%",
                justifyContent: "flex-end",
              }}
            >
              {/* Cart */}
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.iconBackground,
                  borderRadius: 20,
                  padding: 8,
                  position: "relative",
                }}
                onPress={() => router.push("/dashboard/cart")}
              >
                <Feather name="shopping-cart" size={16} color="white" />
                {cartItems && cartItems.length > 0 ? (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "red",
                      position: "absolute",
                      top: 6,
                      right: 6,
                    }}
                  />
                ) : null}
              </TouchableOpacity>

              {/* Bell */}
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.iconBackground,
                  borderRadius: 20,
                  padding: 8,
                  position: "relative",
                }}
                onPress={() => router.push("/dashboard/notification")}
              >
                <Feather name="bell" size={16} color="#FFFA67" />
                {notificationResponseLength > 0 ? (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "red",
                      position: "absolute",
                      top: 6,
                      right: 6,
                    }}
                  />
                ) : null}
              </TouchableOpacity>
            </View>
          </View>

          <WrappedComponent userData={userData} />
        </LinearGradient>
      </View>
      </>
    );
  };

  return ComponentWithHeader;
};

export default withAnimatedHeader;
