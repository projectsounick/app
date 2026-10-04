import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../../Theme/ThemeContext";

const NotificationShimmer: React.FC = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const shimmerColors = isDark 
    ? ["#1a1a1a", "#2a2a2a", "#1a1a1a"]
    : ["#E1E9EE", "#F2F8FC", "#E1E9EE"];

  // Simulate 4-5 notification cards
  const notifications = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {notifications.map((item) => (
        <View key={item} style={styles.notificationCard}>
          <View style={styles.cardContent}>
            {/* Icon Shimmer */}
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.iconContainer}
              shimmerColors={shimmerColors}
              visible={false}
            />

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Title and Delete Icon Row */}
              <View style={styles.titleRow}>
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={styles.title}
                  shimmerColors={shimmerColors}
                  visible={false}
                />
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={styles.deleteButton}
                  shimmerColors={shimmerColors}
                  visible={false}
                />
              </View>

              {/* Body Text Shimmer */}
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.bodyText}
                shimmerColors={shimmerColors}
                visible={false}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={[styles.bodyText, { width: "70%", marginTop: 6 }]}
                shimmerColors={shimmerColors}
                visible={false}
              />

              {/* Date Shimmer */}
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.dateText}
                shimmerColors={shimmerColors}
                visible={false}
              />

              {/* Optional Button Shimmer (for some notifications) */}
              {item % 3 === 0 && (
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={styles.button}
                  shimmerColors={shimmerColors}
                  visible={false}
                />
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  notificationCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    flex: 1,
    height: 18,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  bodyText: {
    width: "90%",
    height: 14,
    borderRadius: 6,
    marginBottom: 4,
  },
  dateText: {
    width: 140,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  button: {
    width: 100,
    height: 36,
    borderRadius: 25,
    marginTop: 12,
  },
});

export default NotificationShimmer;

