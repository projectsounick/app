import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { ChatMessageBubbleProps } from "@/app/interfaces/chatInterface";
import { router } from "expo-router";
import dayjs from "dayjs";

const ChatMessage: React.FC<ChatMessageBubbleProps> = ({
  item,
  index,
  setSelectedImage,
  setImageModalVisible,
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const isUser = item.role === "user";

  // Format date - handle both ISO strings and Date strings
  const formatDate = (dateString: string) => {
    try {
      const date = dayjs(dateString);
      if (!date.isValid()) {
        // Fallback for Date string format like "Mon Jan 01 2024"
        return dateString;
      }
      // Format: "Jan 1, 2024 at 2:30 PM"
      return date.format("MMM D, YYYY [at] h:mm A");
    } catch (error) {
      return dateString;
    }
  };

  // Detect and render links in text
  const renderTextWithLinks = (text: string) => {
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(
          <Text key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </Text>
        );
      }

      // Add the link
      const url = match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
      parts.push(
        <Text
          key={`link-${match.index}`}
          style={{
            color: isUser ? "#FFD700" : theme.colors.secondPrimary,
            textDecorationLine: "underline",
            fontWeight: "600" as "600",
          }}
          onPress={() => {
            Linking.openURL(url).catch((err) =>
              console.error("Failed to open URL:", err)
            );
          }}
        >
          {match[0]}
        </Text>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </Text>
      );
    }

    return parts.length > 0 ? parts : <Text>{text}</Text>;
  };

  return (
    <View
      style={[
        styles.container,
        {
          alignSelf: isUser ? "flex-end" : "flex-start",
          alignItems: isUser ? "flex-end" : "flex-start",
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.supportBubble,
        ]}
      >
        {/* Text Content */}
        {item.content ? (
          <Text
            style={[
              styles.messageText,
              { color: isUser ? theme.colors.textWhite : theme.colors.text },
            ]}
          >
            {renderTextWithLinks(item.content.replace(/\\n/g, "\n"))}
          </Text>
        ) : null}

        {/* Attachments */}
        {item.attachments?.map((file: any, idx) => {
          const fileUrl = typeof file === "string" ? file : file.name;
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.attachmentContainer,
                {
                  marginTop: item.content ? 10 : 0,
                  backgroundColor: isUser
                    ? "rgba(255,255,255,0.15)"
                    : (isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary),
                },
              ]}
              onPress={() => {
                setImageModalVisible(true);
                setSelectedImage(fileUrl);
              }}
            >
              {isImage ? (
                <Image source={{ uri: fileUrl }} style={styles.attachmentImage} />
              ) : (
                <View style={styles.fileAttachment}>
                  <Ionicons
                    name="document-attach"
                    size={18}
                    color={isUser ? theme.colors.textWhite : theme.colors.secondPrimary}
                  />
                  <Text
                    style={[
                      styles.fileText,
                      { color: isUser ? theme.colors.textWhite : theme.colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {fileUrl.split("/").pop() || "Attachment"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* "Go to Plans" Button inside chat bubble */}
        {index === 0 && !isUser && (
          <TouchableOpacity
            style={styles.goToPlansBtn}
            onPress={() => {
              router.push("/(tabs)/dashboard/plan");
            }}
          >
            <Text style={styles.goToPlansText}>Go to Plans</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Date inside bubble */}
        <Text
          style={[
            styles.dateText,
            { color: isUser ? "rgba(255,255,255,0.8)" : theme.colors.textMuted },
          ]}
        >
          {formatDate(item.date)}
        </Text>
      </View>
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginVertical: 6,
    maxWidth: "80%",
    paddingHorizontal: 4,
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
    ...(isDark ? {} : {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  userBubble: {
    backgroundColor: theme.colors.secondPrimary,
    ...(isDark ? {} : {
      shadowColor: theme.colors.secondPrimary,
      shadowOpacity: 0.2,
    }),
  },
  supportBubble: {
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
    }),
  },
  messageText: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  attachmentContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  attachmentImage: {
    width: 180,
    height: 120,
    borderRadius: 10,
    resizeMode: "cover",
  },
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  fileText: {
    marginLeft: 8,
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    fontFamily: theme.fonts.medium,
  },
  goToPlansBtn: {
    backgroundColor: theme.colors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 12,
  },
  goToPlansText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.medium as "500",
    fontSize: theme.fontSizes.regularSmall,
    marginRight: 6,
    fontFamily: theme.fonts.medium,
  },
  dateText: {
    fontSize: theme.fontSizes.small,
    marginTop: 8,
    fontWeight: theme.fontWeights.regular as "400",
    fontFamily: theme.fonts.regular,
  },
});

export default ChatMessage;
