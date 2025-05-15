import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { ChatMessageBubbleProps } from "@/app/interfaces/chatInterface";

const ChatMessage: React.FC<ChatMessageBubbleProps> = ({
  item,
  setSelectedImage,
  setImageModalVisible,
}) => {
  const isUser = item.role === "user";

  return (
    <View
      style={{
        marginVertical: 6,
        alignSelf: isUser ? "flex-end" : "flex-start",
        alignItems: isUser ? "flex-end" : "flex-start",
        maxWidth: "80%",
      }}
    >
      <View
        style={{
          backgroundColor: isUser
            ? theme.colors.secondPrimary
            : theme.colors.primary,
          padding: 12,
          borderRadius: 12,
        }}
      >
        {/* Text Content */}
        {item.content ? (
          <Text
            style={{
              color: isUser ? theme.colors.text : theme.colors.dark,
              fontSize: 14,
            }}
          >
            {item.content}
          </Text>
        ) : null}

        {/* Attachments */}
        {item.attachments?.map((file: any, index) => {
          const fileUrl = typeof file === "string" ? file : file.name;
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

          return (
            <TouchableOpacity
              key={index}
              style={{ marginTop: 8 }}
              onPress={() => {
                setImageModalVisible(true);
                setSelectedImage(fileUrl);
              }}
            >
              {isImage ? (
                <Image
                  source={{ uri: fileUrl }}
                  style={{
                    width: 150,
                    height: 100,
                    borderRadius: 8,
                    resizeMode: "cover",
                  }}
                />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="attach" size={16} color="#fff" />
                  <Text style={{ color: "#fff", marginLeft: 6, fontSize: 12 }}>
                    {fileUrl}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
        {item.date}
      </Text>
    </View>
  );
};

export default ChatMessage;
