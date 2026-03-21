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
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import TrainerChatMessage from "@/app/Components/SupportChat/TrainerChatMessage";
import { chatService } from "@/app/services/chat.service";
import { ActivityIndicator } from "react-native-paper";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { userService } from "@/app/services/user.service";
import ImageViewerModal from "@/app/Modals/ImageViewerModal";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomSnackbar from "@/app/modules/Snackbar";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { useLocalSearchParams, router } from "expo-router";

export default function TrainerChatScreen() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const userName = params.userName as string;
  const [chatId, setChatId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("trainer");
  const [inputText, setInputText] = useState("");
  const [remountKey, setRemountKey] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [messageSendingLoader, setMessageSendingLoader] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Initialize chat for trainer/admin
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        const userCheck = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (userCheck.exists && userCheck.data) {
          setCurrentUserRole(userCheck.data.role || "trainer");

          // Create chatId as userId-trainerId
          const generatedChatId = `${userId}-${userCheck.data._id}`;
          console.log("=== INIT CHAT ===");
          console.log("Generated ChatId:", generatedChatId);
          console.log("User Id from params:", userId);
          console.log("Trainer Id from storage:", userCheck.data._id);
          console.log("User role:", userCheck.data.role);
          setChatId(generatedChatId);

          // Get chat messages (will return empty array if chat doesn't exist yet)
          const response = await chatService.getTrainerChat(generatedChatId);
          console.log("Get Chat Response:", response);
          if (response.success) {
            setData(response.data || []);
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        setSnackbarMessage("Failed to load chat");
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
        // Animate header in
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    if (userId) {
      initChat();
    }
  }, [userId]);

  //// Function for sending the message to the trainer ------------------------/
  const handleSend = async () => {
    try {
      setMessageSendingLoader(true);
      console.log("=== SENDING MESSAGE ===");
      console.log("ChatId:", chatId);
      console.log("Current User Role:", currentUserRole);
      console.log("UserId param:", userId);

      if (!chatId) {
        console.error("ChatId is empty!");
        setSnackbarMessage("Chat not initialized. Please try again.");
        setSnackbarVisible(true);
        setMessageSendingLoader(false);
        return;
      }

      if (!inputText.trim() && selectedAttachments.length === 0) {
        setSnackbarMessage("Write down a message first");
        setSnackbarVisible(true);
        setMessageSendingLoader(false);
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

      // Map admin role to trainer for schema compatibility
      const messageRole = currentUserRole === "admin" ? "trainer" : currentUserRole;

      const messageData = {
        role: messageRole,
        content: inputText,
        attachments: uploadedUrls,
        date: new Date().toDateString(),
      };

      console.log("Message Data:", messageData);

      //// Uploading the message to the backend ----------------------------/
      const uploadMessageResponse = await chatService.addTrainerMessage(
        messageData,
        chatId
      );

      console.log("Upload Response:", uploadMessageResponse);

      if (uploadMessageResponse.success) {
        setData((prev: any) => [...prev, messageData]);
        setInputText("");
        setSelectedAttachments([]);
        Keyboard.dismiss();
      } else {
        console.log("Message send failed:", uploadMessageResponse);
        setSnackbarVisible(true);
        setSnackbarMessage("Unable to send the message,try again");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      setSnackbarVisible(true);
      setSnackbarMessage(error.message || "Error sending message");
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

  // Force remount when theme changes
  useEffect(() => {
    setRemountKey(prev => prev + 1);
  }, [isDark]);

  // Re-render and scroll when theme changes
  useEffect(() => {
    // Force FlatList to recalculate layout when theme changes
    if (flatListRef.current && data.length > 0) {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 200);
      });
    }
  }, [isDark, remountKey]);
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, isDark);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Custom Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={20} color={theme.colors.textWhite} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{userName || "User"}</Text>
              <Text style={styles.headerSubtitle}>Chat Conversation</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Messages Area */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.secondPrimary} size="large" />
            <Text style={styles.loadingText}>Loading conversation...</Text>
          </View>
        ) : (
          <FlatList
            key={`flatlist-${remountKey}-${isDark ? 'dark' : 'light'}`}
            data={data}
            keyExtractor={(item, index) => {
              return `${item._id || item.date || `msg-${index}`}-${isDark ? 'dark' : 'light'}`;
            }}
            extraData={`${isDark}-${remountKey}`}
            removeClippedSubviews={false}
            initialNumToRender={50}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item, index }) => (
              <TrainerChatMessage
                key={`${item._id || item.date || index}-${isDark ? 'dark' : 'light'}`}
                index={index}
                item={item}
                setSelectedImage={setSelectedImage}
                setImageModalVisible={setImageModalVisible}
              />
            )}
            ref={flatListRef}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={64}
                    color={theme.colors.textMuted}
                  />
                </View>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start a conversation with {userName || "this user"}
                </Text>
              </View>
            }
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 16 }]}>
          {selectedAttachments.length > 0 && (
            <View style={styles.attachmentsPreview}>
              {selectedAttachments.map((uri, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <Image
                    source={{ uri }}
                    style={styles.attachmentImage}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedAttachments((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                    style={styles.removeAttachment}
                  >
                    <Ionicons name="close" size={14} color={theme.colors.textWhite} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.inputWrapper}>
            <TouchableOpacity
              onPress={handleAttachment}
              style={styles.attachButton}
            >
              <Ionicons
                name="image-outline"
                size={24}
                color={theme.colors.secondPrimary}
              />
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your message..."
                placeholderTextColor={theme.colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                editable={!messageSendingLoader}
                multiline
                maxLength={500}
              />
            </View>

            {messageSendingLoader ? (
              <View style={styles.sendButton}>
                <ActivityIndicator color={theme.colors.textWhite} size="small" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSend}
                style={[
                  styles.sendButton,
                  (!inputText.trim() && selectedAttachments.length === 0) && styles.sendButtonDisabled
                ]}
                disabled={!inputText.trim() && selectedAttachments.length === 0}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={theme.colors.textWhite}
                />
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
        bgColor={theme.colors.success}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...(!isDark && {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.secondPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontFamily: theme.fonts.regular,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.extraLarge,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  inputContainer: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    ...(!isDark && {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 12,
    }),
  },
  attachmentsPreview: {
    flexDirection: "row",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  attachmentItem: {
    position: "relative",
    marginRight: 8,
    marginBottom: 8,
  },
  attachmentImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  removeAttachment: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: "center",
    justifyContent: "center",
    ...(!isDark && {
      shadowColor: theme.colors.error,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textInput: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    ...(!isDark && {
      shadowColor: theme.colors.success,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
    opacity: 0.5,
  },
});
