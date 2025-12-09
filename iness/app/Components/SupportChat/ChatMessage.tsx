import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { ChatMessageBubbleProps } from "@/app/interfaces/chatInterface";
import { router } from "expo-router";
import dayjs from "dayjs";

const ChatMessage: React.FC<ChatMessageBubbleProps> = ({
  item,
  index,
  setSelectedImage,
  setImageModalVisible,
}) => {
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

  return (
    <View
      style={{
        marginVertical: 6,
        alignSelf: isUser ? "flex-end" : "flex-start",
        alignItems: isUser ? "flex-end" : "flex-start",
        maxWidth: "80%",
        paddingHorizontal: 4,
      }}
    >
      <View
        style={{
          backgroundColor: isUser ? "#67C694" : "#FFFFFF",
          padding: 16,
          borderRadius: 20,
          shadowColor: isUser ? "#67C694" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isUser ? 0.2 : 0.1,
          shadowRadius: 6,
          elevation: 4,
          borderWidth: isUser ? 0 : 1,
          borderColor: "#F5F5F5",
        }}
      >
        {/* Text Content */}
        {item.content ? (
          <Text
            style={{
              color: isUser ? "#FFFFFF" : "#000",
              fontSize: 15,
              fontWeight: "500",
              lineHeight: 22,
            }}
          >
            {item.content.replace(/\\n/g, "\n")}
          </Text>
        ) : null}

        {/* Attachments */}
        {item.attachments?.map((file: any, idx) => {
          const fileUrl = typeof file === "string" ? file : file.name;
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

          return (
            <TouchableOpacity
              key={idx}
              style={{
                marginTop: item.content ? 10 : 0,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: isUser ? "rgba(255,255,255,0.1)" : "#F8F8F8",
              }}
              onPress={() => {
                setImageModalVisible(true);
                setSelectedImage(fileUrl);
              }}
            >
              {isImage ? (
                <Image
                  source={{ uri: fileUrl }}
                  style={{
                    width: 180,
                    height: 120,
                    borderRadius: 12,
                    resizeMode: "cover",
                  }}
                />
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Ionicons
                    name="document-attach"
                    size={18}
                    color={isUser ? "#FFFFFF" : "#9747FF"}
                  />
                  <Text
                    style={{
                      color: isUser ? "#FFFFFF" : "#000",
                      marginLeft: 8,
                      fontSize: 13,
                      fontWeight: "500",
                    }}
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
            style={{
              backgroundColor: "#9747FF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 12,
              marginTop: 12,
              shadowColor: "#9747FF",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              router.push("/(tabs)/dashboard/plan");
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: 14,
                marginRight: 6,
              }}
            >
              Go to Plans
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Date inside bubble */}
        <Text
          style={{
            fontSize: 10,
            color: isUser ? "rgba(255,255,255,0.8)" : "#999",
            marginTop: 8,
            fontWeight: "400",
          }}
        >
          {formatDate(item.date)}
        </Text>
      </View>
    </View>
  );
};

export default ChatMessage;
