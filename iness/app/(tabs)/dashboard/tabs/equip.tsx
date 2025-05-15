import React, { useRef } from "react";
import { View, Text, Image, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
import theme from "@/app/Theme/globalTheme";
export default function EquipScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      {/* Header */}
      <Animated.View
        style={{
          height: headerHeight,
          opacity: headerOpacity,
          backgroundColor: "#6C1B9B",
          paddingHorizontal: 20,
          paddingTop: 40,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
          Namaste Sunny! 🙏
        </Text>
        <Text style={{ color: "white", marginTop: 4 }}>
          Get ready to crush your fitness goals today.
        </Text>
      </Animated.View>

      {/* Coming Soon Content */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            height: "80%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSizes.medium,
                fontWeight: "800",
                color: theme.colors.normal,

                textAlign: "center",
                marginBottom: 4,
              }}
            >
              This feature is
            </Text>

            <Text
              style={{
                fontSize: theme.fontSizes.xxl,
                fontWeight: "800",
                color: theme.colors.secondPrimary,

                textAlign: "center",
              }}
            >
              Coming Soon
            </Text>
          </View>
          <Image
            source={require("../../../../assets/images/placholderEquip.png")}
            style={{
              width: 250,
              height: 250,
              resizeMode: "contain",
            }}
          />
        </View>
      </View>
    </View>
  );
}
