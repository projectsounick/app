import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../../Theme/ThemeContext";

// Main functional component for the Shimmer skeleton card
const ShimmerCard = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const shimmerColors = isDark 
    ? ["#1a1a1a", "#2a2a2a", "#1a1a1a"]
    : ["#E1E9EE", "#F2F8FC", "#E1E9EE"];

  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={styles.thumbnail}
        shimmerColors={shimmerColors}
        visible={false}
      />

      {/* Content */}
      <View style={styles.content}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.title}
          shimmerColors={shimmerColors}
          visible={false}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.description}
          shimmerColors={shimmerColors}
          visible={false}
        />

        {/* Buttons */}
        <View style={styles.actions}>
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.icon}
            shimmerColors={shimmerColors}
            visible={false}
          />
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.icon}
            shimmerColors={shimmerColors}
            visible={false}
          />
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.share}
            shimmerColors={shimmerColors}
            visible={false}
          />
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 3,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 10,
  },
  title: {
    height: 20,
    marginTop: 12,
    borderRadius: 6,
    width: "70%",
  },
  description: {
    height: 16,
    marginTop: 10,
    borderRadius: 6,
    width: "90%",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  icon: {
    height: 20,
    width: 40,
    borderRadius: 6,
  },
  share: {
    height: 30,
    width: 80,
    borderRadius: 8,
  },
});

export default ShimmerCard;

