import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";

//// Main functional component for the Simmer skeleton card
const SimmerSkeletonCard = () => {
  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <ShimmerPlaceHolder style={styles.thumbnail} />

      {/* Content */}
      <View style={styles.content}>
        <ShimmerPlaceHolder style={styles.title} />
        <ShimmerPlaceHolder style={styles.description} />

        {/* Buttons */}
        <View style={styles.actions}>
          <ShimmerPlaceHolder style={styles.icon} />
          <ShimmerPlaceHolder style={styles.icon} />
          <ShimmerPlaceHolder style={styles.share} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
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

export default SimmerSkeletonCard;
