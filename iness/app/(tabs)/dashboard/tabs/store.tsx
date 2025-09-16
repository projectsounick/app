import React, { useRef } from "react";
import { View, Image, Animated, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SmallHeader from "@/app/modules/SmallHeader";

//// Main functional component for the equipscreen ------------------------/

export default function EquipScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      {/* Header */}
      <SmallHeader title="Store" weightShow={false} />

      {/* Equip Placeholder Image + Coming Soon */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../../../../assets/images/placholderEquip.png")}
          style={{ width: 220, height: 220, resizeMode: "contain" }}
        />
        <Text
          style={{
            marginTop: 20,
            fontSize: 18,
            fontWeight: "600",
            color: "#333",
          }}
        >
          We are coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
