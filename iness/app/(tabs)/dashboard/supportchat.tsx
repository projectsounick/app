import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";
import ChatMessage from "@/app/Components/SupportChat/ChatMessage";
import useGetDataHook from "@/hooks/useFetchHook";
import { chatService } from "@/app/services/chat.service";
import { ActivityIndicator } from "react-native-paper";
import SupportChatShimmer from "@/app/modules/Shimmer/SupportChatShimmer";
import { uploadToAzureFromExpo } from "@/utils/azureUtils"; // make sure this util exists and works
import { userService } from "@/app/services/user.service";
import ImageViewerModal from "@/app/Modals/ImageViewerModal";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomSnackbar from "@/app/modules/Snackbar";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { useLocalSearchParams } from "expo-router";
import {
  getTemplateByType,
  getTemplateMessage,
  SupportChatTemplate,
} from "@/app/utils/supportChatTemplates";
const { height } = Dimensions.get("window");
const topPadding = height * 0.05; // 2% of screen height

export default function SupportScreen() {
  const { planTitle, requestType } = useLocalSearchParams<{
    planTitle?: string;
    requestType?: string;
  }>();
  const [inputText, setInputText] = useState("");
  const [showTemplateCard, setShowTemplateCard] = useState(!!planTitle);
  
  // Get template based on request type
  const template: SupportChatTemplate | undefined = requestType === "session" 
    ? getTemplateByType("session")
    : requestType === "service"
    ? getTemplateByType("service")
    : undefined;
  const flatListRef = useRef<FlatList>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const {
    data,
    loading,
    fetchData,
    setData,
    setSnackbarMessage,
    setSnackbarVisible,
    snackbarVisible,
    snackbarMessage,
  } = useGetDataHook(chatService.getSupportConversation);
  const [messageSendingLoader, setMessageSendingLoader] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  //// Function for sending the message to the support ------------------------/
  const handleSend = async () => {
    try {
      setMessageSendingLoader(true);
      if (!inputText.trim() && selectedAttachments.length === 0) {
        setSnackbarMessage("Write down a message first");
        setSnackbarVisible(true);
        return;
      }

      let uploadedUrls: string[] = [];

      //// if attachment exists then upload them to azure then generate link and store it --/
      if (selectedAttachments.length > 0) {
        try {
          const storageAccountDetailsResponse =
            await userService.getStorageAccountDetails("chatMedia");

          if (!storageAccountDetailsResponse.success) {
            setSnackbarVisible(true);
            setSnackbarMessage("Server error, try again.");
            return;
          }

          const { storageAccountName, sasToken } =
            storageAccountDetailsResponse.data;
          const uploadPromises = selectedAttachments.map(async (fileUri) => {
            const fileName =
              fileUri.split("/").pop() || `image-${Date.now()}.jpg`;

            const uploadedUrl = await uploadToAzureFromExpo(
              fileUri,
              fileName,
              sasToken,
              storageAccountName,
              "admin-data",
              "chatMedia"
            );
            return uploadedUrl;
          });

          uploadedUrls = await Promise.all(uploadPromises);
        } catch (err: any) {
          setSnackbarVisible(true);
          setSnackbarMessage("Some server error has happend,try again");
          return;
        }
      }

      const data = {
        role: "user",
        content: inputText,
        attachments: uploadedUrls,
        date: new Date().toDateString(),
      };
      let loggedUser =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      let userId;
      if (loggedUser.exists) {
        userId = loggedUser.data._id;
      }

      //// Uploading the message to the backend ----------------------------/
      const uploadMessageResponse = await chatService.addSupportMessage(
        data,
        userId
      );

      if (uploadMessageResponse.success) {
        setData((prev: any) => [...prev, data]);
        setInputText("");
        setSelectedAttachments([]);
        Keyboard.dismiss();
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage("Unable to send the message,try again");
      }
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
    } finally {
      setMessageSendingLoader(false);
    }
  };

  const handleAttachment = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setSelectedAttachments((prev) => [...prev, ...selectedUris]);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [data]);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <View
              style={{
                paddingLeft: 20,
                marginTop: Platform.OS === "ios" ? topPadding : "4%",
              }}
            >
              <NormalHeader screenName="Support" />
            </View>

            {loading ? (
              <SupportChatShimmer />
            ) : (
              <FlatList
                data={data}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <ChatMessage
                    index={index}
                    item={item}
                    setSelectedImage={setSelectedImage}
                    setImageModalVisible={setImageModalVisible}
                  />
                )}
                ref={flatListRef}
                contentContainerStyle={{
                  padding: 16,
                  paddingBottom: 100,
                  flexGrow: 1,
                  justifyContent: data.length === 0 ? "center" : "flex-start",
                  alignItems: data.length === 0 ? "center" : undefined,
                }}
                ListEmptyComponent={
                  <View
                    style={{
                      alignItems: "center",
                      paddingHorizontal: 20,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 20,
                      padding: 24,
                      marginHorizontal: 20,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.12,
                      shadowRadius: 12,
                      elevation: 5,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                    }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: "#F0F0F0",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="chatbubble-ellipses" size={30} color="#9747FF" />
                    </View>
                    <Text
                      style={{
                        color: "#000",
                        fontSize: 18,
                        fontWeight: "700",
                        textAlign: "center",
                        marginBottom: 8,
                      }}
                    >
                      No conversation yet
                    </Text>
                    <Text
                      style={{
                        color: "#666",
                        fontSize: 14,
                        textAlign: "center",
                        lineHeight: 20,
                      }}
                    >
                      Start a conversation with our support team. We're here to help!
                    </Text>
                  </View>
                }
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
              />
            )}

            {/* Template Message Card - Above Input */}
            {showTemplateCard && planTitle && template && (
              <View
                style={{
                  marginHorizontal: 16,
                  marginBottom: 12,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: "#E8F5E9",
                  borderLeftWidth: 4,
                  borderLeftColor: "#67C694",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#1A1A1A",
                        marginBottom: 6,
                        fontFamily: theme.fonts.bold,
                      }}
                    >
                      {template.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#666",
                        fontFamily: theme.fonts.regular,
                      }}
                    >
                      {requestType === "service" ? "Service" : "Plan"}: {planTitle}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowTemplateCard(false)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 18,
                    marginBottom: 12,
                    fontFamily: theme.fonts.regular,
                  }}
                >
                  {getTemplateMessage(template, { planTitle })}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const templateMessage = getTemplateMessage(template, { planTitle });
                    setInputText(templateMessage);
                    setShowTemplateCard(false);
                  }}
                  style={{
                    backgroundColor: "#67C694",
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: "700",
                      fontFamily: theme.fonts.bold,
                    }}
                  >
                    Use This Message
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Input & Attachments */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 16,
                paddingBottom: insets.bottom + 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
                borderTopWidth: 1,
                borderTopColor: "#F0F0F0",
              }}
            >
              {selectedAttachments.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {selectedAttachments.map((uri, index) => (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Image
                        source={{ uri }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedAttachments((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: "#FF6B6B",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8F8F8",
                  borderRadius: 25,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                }}
              >
                <TouchableOpacity
                  onPress={handleAttachment}
                  style={{
                    padding: 6,
                  }}
                >
                  <Ionicons
                    name="attach"
                    size={22}
                    color="#9747FF"
                  />
                </TouchableOpacity>
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    fontSize: 15,
                    color: "#000",
                  }}
                  placeholder="Type your message..."
                  placeholderTextColor="#999"
                  value={inputText}
                  onChangeText={setInputText}
                  editable={!messageSendingLoader}
                  multiline
                  maxLength={500}
                />

                {messageSendingLoader ? (
                  <View
                    style={{
                      padding: 6,
                    }}
                  >
                    <ActivityIndicator color="#67C694" size="small" />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleSend}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#67C694",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="send" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>

          {/* Image modal for showing the image when user clicks on it */}
          {selectedImage != null ? (
            <ImageViewerModal
              visible={imageModalVisible}
              onClose={() => setImageModalVisible(false)}
              imageUrl={selectedImage}
            />
          ) : null}

          <CustomSnackbar
            visible={snackbarVisible}
            message={snackbarMessage}
            onDismiss={() => setSnackbarVisible(false)}
            bgColor="#67C694"
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
