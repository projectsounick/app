// hoc/withAnimatedHeader.tsx

import React, { ReactElement, useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet, ScrollView } from "react-native";

import { Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "../Theme/globalTheme";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedHeaderProps {
  scrollY: Animated.Value;
  title: string;
}

const withAnimatedHeader = (WrappedComponent: React.ComponentType<any>) => {
  /// Getting the stored cart data for the ------------------/

  const ComponentWithHeader = (props: AnimatedHeaderProps): ReactElement => {
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);
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
        console.log("called");

        const response = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
          "user"
        );
        console.log(typeof response.exists);

        if (response.exists) {
          console.log(response.data.weight);

          setUserData(response.data);
        }
      }
      fetchData();
    }, []);
    const insets = useSafeAreaInsets();
    return (
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
          colors={["#140A21", "#522987"]}
          start={{ x: 0, y: 0 }}
          style={{
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            paddingHorizontal: 20,

            paddingBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative", // important
              paddingTop: 8,
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 👈 Adds more tappable space
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: "#fff", marginLeft: 8 }}>
                  {parseInt(userData?.weight)} kgs
                </Text>
              </View>
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
                  backgroundColor: "#411D6E",
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
                  backgroundColor: "#411D6E",
                  borderRadius: 20,
                  padding: 8,
                  position: "relative",
                }}
                onPress={() => router.push("/dashboard/notification")}
              >
                <Feather name="bell" size={16} color="#FFFA67" />
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
              </TouchableOpacity>
            </View>
          </View>

          <WrappedComponent userData={userData} />
        </LinearGradient>
      </View>
    );
  };

  return ComponentWithHeader;
};

export default withAnimatedHeader;
