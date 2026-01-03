import React from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../../Theme/globalTheme";

const { width: screenWidth } = Dimensions.get("window");
const imageSize = (screenWidth - 64) / 3;

const ProgressShimmer: React.FC = () => {
  return (
    <ScrollView
      style={styles.shimmerContainer}
      contentContainerStyle={styles.shimmerContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Info Card Shimmer */}
      <View style={[styles.shimmerCard, styles.shimmerInfoCard]}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.shimmerIcon}
          shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
          visible={false}
        />
        <View style={styles.shimmerTextContainer}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.shimmerTitle}
            shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
            visible={false}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.shimmerSubtitle}
            shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
            visible={false}
          />
        </View>
      </View>

      {/* Stats Card Shimmer */}
      <View style={styles.shimmerCard}>
        <View style={styles.shimmerStatsRow}>
          <View style={styles.shimmerStatItem}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerStatIcon}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerStatValue}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerStatLabel}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
          </View>
          <View style={styles.shimmerStatDivider} />
          <View style={styles.shimmerStatItem}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerStatIcon}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerStatValue}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerStatLabel}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
          </View>
        </View>
      </View>

      {/* Section Headers Shimmer */}
      {[1, 2, 3].map((section) => (
        <View key={section} style={styles.shimmerSection}>
          <View style={styles.shimmerSectionHeader}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerDateBadge}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerDateLine}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerCountBadge}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
          </View>
          {/* Media Grid Shimmer */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.shimmerMediaScroll}
          >
            {[1, 2, 3].map((item) => (
              <ShimmerPlaceholder
                key={item}
                LinearGradient={LinearGradient}
                style={[styles.shimmerMediaItem, { width: imageSize, height: imageSize }]}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    flex: 1,
  },
  shimmerContent: {
    padding: 16,
    paddingBottom: 20,
  },
  shimmerCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  shimmerInfoCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  shimmerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 14,
  },
  shimmerTextContainer: {
    flex: 1,
    gap: 8,
  },
  shimmerTitle: {
    width: "70%",
    height: 18,
    borderRadius: 8,
  },
  shimmerSubtitle: {
    width: "90%",
    height: 14,
    borderRadius: 6,
  },
  shimmerStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  shimmerStatItem: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  shimmerStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  shimmerStatValue: {
    width: 40,
    height: 22,
    borderRadius: 8,
  },
  shimmerStatLabel: {
    width: 60,
    height: 12,
    borderRadius: 6,
  },
  shimmerStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: theme.colors.lightGrey,
  },
  shimmerSection: {
    marginBottom: 20,
  },
  shimmerSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  shimmerDateBadge: {
    width: 100,
    height: 28,
    borderRadius: 20,
  },
  shimmerDateLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 12,
  },
  shimmerCountBadge: {
    width: 40,
    height: 24,
    borderRadius: 12,
  },
  shimmerMediaScroll: {
    marginBottom: 8,
  },
  shimmerMediaItem: {
    marginRight: 12,
    borderRadius: 14,
  },
});

export default ProgressShimmer;

