import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../../Theme/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const TrackShimmer: React.FC = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const shimmerColors = isDark 
    ? ["#1a1a1a", "#2a2a2a", "#1a1a1a"]
    : ["#E1E9EE", "#F2F8FC", "#E1E9EE"];

  return (
    <View style={styles.container}>
      {/* Header Shimmer */}
      <View style={styles.headerContainer}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.headerTitle}
          shimmerColors={shimmerColors}
          visible={false}
        />
      </View>

      {/* Tabs Shimmer */}
      <View style={styles.tabsContainer}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.tab}
          shimmerColors={shimmerColors}
          visible={false}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.tab}
          shimmerColors={shimmerColors}
          visible={false}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.tab}
          shimmerColors={shimmerColors}
          visible={false}
        />
      </View>

      {/* Month Switcher Shimmer */}
      <View style={styles.monthContainer}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.monthButton}
          shimmerColors={shimmerColors}
          visible={false}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.monthText}
          shimmerColors={shimmerColors}
          visible={false}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.monthButton}
          shimmerColors={shimmerColors}
          visible={false}
        />
      </View>

      {/* Chart Container Shimmer */}
      <View style={styles.chartContainer}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.chart}
          shimmerColors={shimmerColors}
          visible={false}
        />
      </View>

      {/* Stats Cards Shimmer */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.statLabel}
            shimmerColors={shimmerColors}
            visible={false}
          />
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.statValue}
            shimmerColors={shimmerColors}
            visible={false}
          />
        </View>
        <View style={styles.statCard}>
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.statLabel}
            shimmerColors={shimmerColors}
            visible={false}
          />
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.statValue}
            shimmerColors={shimmerColors}
            visible={false}
          />
        </View>
        <View style={styles.statCard}>
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.statLabel}
            shimmerColors={shimmerColors}
            visible={false}
          />
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.statValue}
            shimmerColors={shimmerColors}
            visible={false}
          />
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    width: 120,
    height: 28,
    borderRadius: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  monthContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  monthText: {
    width: 140,
    height: 20,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  chartContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 300,
  },
  chart: {
    width: "100%",
    height: 280,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    width: "60%",
    height: 14,
    borderRadius: 6,
    marginBottom: 12,
  },
  statValue: {
    width: "80%",
    height: 24,
    borderRadius: 8,
  },
});

export default TrackShimmer;

