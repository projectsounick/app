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
import { uploadToAzureFromExpo } from "@/utils/azureUtils"; // make sure this util exists and works
import { userService } from "@/app/services/user.service";
import ImageViewerModal from "@/app/modules/ImageModel";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
const { height } = Dimensions.get("window");
const topPadding = height * 0.05; // 2% of screen height

export default function SupportScreen() {
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const {
    data,
    loading,
    fetchData,
    setData,
    setSnackbarMessage,
    setSnackbarVisible,
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
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            paddingLeft: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
          }}
        >
          <NormalHeader screenName="Support" />
        </View>

        <ImageBackground
          source={require("../../../assets/images/basicBackground.jpg")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator color={theme.colors.secondPrimary} size={25} />
            </View>
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
                paddingBottom: 80,
                flexGrow: 1,
                justifyContent: data.length === 0 ? "center" : "flex-start",
                alignItems: data.length === 0 ? "center" : undefined,
              }}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
                  <Text
                    style={{
                      color: theme.colors.dark,
                      fontSize: theme.fontSizes.medium,
                      textAlign: "center",
                      fontFamily: theme.fonts.bold,
                    }}
                  >
                    No conversation available.
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.dark,
                      fontSize: theme.fontSizes.medium,
                      textAlign: "center",
                      marginTop: 6,
                    }}
                  >
                    Start a conversation now.
                  </Text>
                </View>
              }
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
          )}
        </ImageBackground>

        {/* Input & Attachments */}
        <View
          style={{
            width: "100%",
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: "#eee",
            backgroundColor: "#fff",
          }}
        >
          {selectedAttachments.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              {selectedAttachments.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={{
                    width: 60,
                    height: 60,
                    marginRight: 6,
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                />
              ))}
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={handleAttachment}>
              <Ionicons
                name="attach"
                size={24}
                color="#67c694"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: "#f5f5f5",
                borderWidth: 0,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 25,
                fontSize: 15,
                color: "#333",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2, // Android shadow
              }}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              editable={!messageSendingLoader}
            />

            {messageSendingLoader ? (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color={theme.colors.secondPrimary} />
              </View>
            ) : (
              <TouchableOpacity onPress={handleSend}>
                <Ionicons
                  name="send"
                  size={24}
                  color="#67c694"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Image modal for showing the image when user clicks on it */}
        {selectedImage != null ? (
          <ImageViewerModal
            visible={imageModalVisible}
            onClose={() => setImageModalVisible(false)}
            imageUrl={selectedImage}
          />
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
