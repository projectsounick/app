import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const SupportChatShimmer: React.FC = () => {
  // Simulate alternating user and support messages
  const messages = [
    { isUser: false, hasImage: false },
    { isUser: true, hasImage: false },
    { isUser: false, hasImage: true },
    { isUser: true, hasImage: false },
    { isUser: false, hasImage: false },
  ];

  return (
    <View style={styles.container}>
      {messages.map((message, index) => (
        <View
          key={index}
          style={[
            styles.messageContainer,
            {
              alignSelf: message.isUser ? "flex-end" : "flex-start",
              alignItems: message.isUser ? "flex-end" : "flex-start",
            },
          ]}
        >
          <View
            style={[
              styles.bubble,
              message.isUser ? styles.userBubble : styles.supportBubble,
            ]}
          >
            {/* Message Text Shimmer */}
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={[
                styles.messageText,
                { width: message.isUser ? "70%" : "80%" },
              ]}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={[
                styles.messageText,
                { width: message.isUser ? "50%" : "60%", marginTop: 6 },
              ]}
              shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
              visible={false}
            />

            {/* Image Attachment Shimmer (for support messages) */}
            {message.hasImage && !message.isUser && (
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.attachmentImage}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
            )}

            {/* Date Shimmer */}
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.dateText}
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
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: "80%",
    paddingHorizontal: 4,
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#9747FF",
    shadowColor: "#9747FF",
    shadowOpacity: 0.2,
  },
  supportBubble: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  messageText: {
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  attachmentImage: {
    width: 180,
    height: 120,
    borderRadius: 10,
    marginTop: 10,
  },
  dateText: {
    width: 100,
    height: 10,
    borderRadius: 5,
    marginTop: 8,
  },
});

export default SupportChatShimmer;

