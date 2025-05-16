// hoc/withAnimatedHeader.tsx

import React, { ReactElement, useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet, ScrollView } from "react-native";

import { Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "../Theme/globalTheme";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

interface AnimatedHeaderProps {
  scrollY: Animated.Value;
  title: string;
}

const withAnimatedHeader = (WrappedComponent: React.ComponentType<any>) => {
  const ComponentWithHeader = (props: AnimatedHeaderProps): ReactElement => {
    // Use scrollY from props if provided; otherwise, create a new one
    const scrollY = props.scrollY || useRef(new Animated.Value(0)).current;
    const title = props.title;
    const [userData, setUserData] = useState<any>(null);
    const router = useRouter();

    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    const headerTranslateY = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -80],
      extrapolate: "clamp",
    });

    useEffect(() => {
      async function fetchData() {
        const response = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
          "user"
        );
        if (response.exists) {
          setUserData(response.data);
        }
      }
      fetchData();
    }, []);
    return (
      <Animated.View
        style={{
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <LinearGradient
          colors={["#844ACF", "#432569"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 25,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative", // important
            }}
          >
            {/* Left Side */}
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

            {/* Title in absolute center */}
            <Text
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                textAlign: "center",
                color: theme.colors.text,
                fontWeight: "bold",
                fontSize: theme.fontSizes.regularSmall,
              }}
            >
              {title}
            </Text>

            {/* Right Side */}
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

          <WrappedComponent userData={userData} />
        </LinearGradient>
      </Animated.View>
    );
  };

  return ComponentWithHeader;
};

export default withAnimatedHeader;
