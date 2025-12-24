import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");

const FeedShimmer: React.FC = () => {
  // Simulate 3-4 feed posts
  const posts = [1, 2, 3, 4];

  return (
    <View style={styles.container}>
      {posts.map((post) => (
        <View key={post} style={styles.postCard}>
          {/* Header - Avatar, Username, Time, Menu */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.avatar}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
              <View style={styles.userInfo}>
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={styles.username}
                  shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                  visible={false}
                />
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={styles.timeText}
                  shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                  visible={false}
                />
              </View>
            </View>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.menuButton}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
          </View>

          {/* Media - Image/Video */}
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.media}
            shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
            visible={false}
          />

          {/* Actions Row */}
          <View style={styles.actions}>
            <View style={styles.actionsLeft}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.actionIcon}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.actionIcon}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
            </View>
          </View>

          {/* Likes Count */}
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.likesText}
            shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
            visible={false}
          />

          {/* Caption */}
          <View style={styles.captionContainer}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.captionLine}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={[styles.captionLine, { width: "70%", marginTop: 6 }]}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    width: 120,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  timeText: {
    width: 80,
    height: 12,
    borderRadius: 6,
  },
  menuButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  media: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: "#F5F5F5",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  likesText: {
    width: 100,
    height: 14,
    borderRadius: 7,
    marginLeft: 16,
    marginBottom: 8,
  },
  captionContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  captionLine: {
    width: "90%",
    height: 14,
    borderRadius: 7,
  },
});

export default FeedShimmer;

