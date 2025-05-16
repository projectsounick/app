import React, { useRef } from "react";
import { View, Text, Image, Animated, Dimensions } from "react-native";

import theme from "@/app/Theme/globalTheme";
import withAnimatedHeader from "@/app/Hoc/MainHeader";
import NameHeader from "@/app/Components/HeaderSubComponents/NameHeader";

//// Main functional component for the equipscreen ------------------------/
const MainHeader = withAnimatedHeader(NameHeader);
export default function EquipScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      {/* Header */}
      <MainHeader scrollY={scrollY} title="Equip" />

      {/* Coming Soon Content */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          marginTop: 40,
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
