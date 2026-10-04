// components/FullScreenLoader.tsx
import React from "react";
import { View, ActivityIndicator, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
import theme from "../Theme/globalTheme";
export default function FullScreenLoader() {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
