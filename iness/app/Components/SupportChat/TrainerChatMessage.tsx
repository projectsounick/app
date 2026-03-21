import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { ChatMessageBubbleProps } from "@/app/interfaces/chatInterface";
import dayjs from "dayjs";

const TrainerChatMessage: React.FC<ChatMessageBubbleProps> = ({
  item,
  index,
  setSelectedImage,
  setImageModalVisible,
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);

  // For trainer/admin view: trainer messages on right, user messages on left
  const isTrainerMessage = item.role === "trainer";

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
            color: isTrainerMessage ? "#FFD700" : theme.colors.secondPrimary,
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
          alignSelf: isTrainerMessage ? "flex-end" : "flex-start",
          alignItems: isTrainerMessage ? "flex-end" : "flex-start",
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          isTrainerMessage ? styles.trainerBubble : styles.userBubble,
        ]}
      >
        {/* Text Content */}
        {item.content ? (
          <Text
            style={[
              styles.messageText,
              { color: isTrainerMessage ? theme.colors.textWhite : theme.colors.text },
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
                  backgroundColor: isTrainerMessage
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
                    color={isTrainerMessage ? theme.colors.textWhite : theme.colors.secondPrimary}
                  />
                  <Text
                    style={[
                      styles.fileText,
                      { color: isTrainerMessage ? theme.colors.textWhite : theme.colors.text },
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

        {/* Date inside bubble */}
        <Text
          style={[
            styles.dateText,
            { color: isTrainerMessage ? "rgba(255,255,255,0.8)" : theme.colors.textMuted },
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
    marginVertical: 4,
    maxWidth: "85%",
    paddingHorizontal: 2,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    ...(isDark ? {} : {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  trainerBubble: {
    backgroundColor: theme.colors.secondPrimary,
    borderBottomRightRadius: 4,
    ...(isDark ? {} : {
      shadowColor: theme.colors.secondPrimary,
      shadowOpacity: 0.25,
    }),
  },
  userBubble: {
    backgroundColor: isDark ? theme.colors.backgroundCard : "#FFFFFF",
    borderWidth: 1.5,
    borderColor: isDark ? theme.colors.border : "#E8E8E8",
    borderBottomLeftRadius: 4,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
    }),
  },
  messageText: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.regular as "400",
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  attachmentContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  attachmentImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
    resizeMode: "cover",
  },
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  fileText: {
    marginLeft: 8,
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    fontFamily: theme.fonts.medium,
  },
  dateText: {
    fontSize: theme.fontSizes.small,
    marginTop: 6,
    fontWeight: theme.fontWeights.regular as "400",
    fontFamily: theme.fonts.regular,
    opacity: 0.7,
  },
});

export default TrainerChatMessage;
