import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../../Theme/ThemeContext";

const SupportChatShimmer: React.FC = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const shimmerColors = isDark 
    ? ["#1a1a1a", "#2a2a2a", "#1a1a1a"]
    : ["#E1E9EE", "#F2F8FC", "#E1E9EE"];

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
              shimmerColors={shimmerColors}
              visible={false}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={[
                styles.messageText,
                { width: message.isUser ? "50%" : "60%", marginTop: 6 },
              ]}
              shimmerColors={shimmerColors}
              visible={false}
            />

            {/* Image Attachment Shimmer (for support messages) */}
            {message.hasImage && !message.isUser && (
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.attachmentImage}
                shimmerColors={shimmerColors}
                visible={false}
              />
            )}

            {/* Date Shimmer */}
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.dateText}
              shimmerColors={shimmerColors}
              visible={false}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
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
    backgroundColor: theme.colors.secondPrimary,
    shadowColor: "#9747FF",
    shadowOpacity: 0.2,
  },
  supportBubble: {
    backgroundColor: theme.colors.background,
    shadowColor: "#000",
    borderWidth: 1,
    borderColor: theme.colors.border,
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

