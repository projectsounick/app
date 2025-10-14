import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { ChatMessageBubbleProps } from "@/app/interfaces/chatInterface";
import { router } from "expo-router";

const ChatMessage: React.FC<ChatMessageBubbleProps> = ({
  item,
  index,
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
              fontFamily: theme.fonts.medium,
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

        {/* "Go to Plans" Button inside chat bubble */}
        {index === 0 && !isUser && (
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
              marginTop: 10,
            }}
            onPress={() => {
              router.push("/(tabs)/dashboard/plan");
            }}
          >
            <Text
              style={{
                color: "#000",
                fontWeight: "bold",
                fontSize: 13,
                marginRight: 6,
              }}
            >
              Go to Plans
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
        {item.date}
      </Text>
    </View>
  );
};

export default ChatMessage;
