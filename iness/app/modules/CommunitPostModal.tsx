import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  FlatList,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "expo-av";
import { ActivityIndicator } from "react-native-paper";

import theme from "../Theme/globalTheme";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
import { Post } from "../interfaces/communityService";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { communityService } from "../services/community.service";

const screenWidth = Dimensions.get("window").width;

interface CustomPostModalProps {
  setPosts: any;
  communityId: any;
}

const CustomPostModal = React.forwardRef<{ openModal: () => void }, CustomPostModalProps>(
  ({ setPosts, communityId }, ref) => {
  const [modalVisible, setModalVisible] = useState(false);

  React.useImperativeHandle(ref, () => ({
    openModal: () => setModalVisible(true),
  }));
  const [postType, setPostType] = useState<"text" | "image" | "video" | null>(
    null
  );
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { loading, callService, setLoading } = useServiceWithSnackbar(
    communityService.createPost
  );

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentMediaIndex(index);
  };

  const handleUploadMedia = async () => {
    // ✅ Only ask for permission on Android
    if (Platform.OS === "android") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need access to your gallery.");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        postType === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setMedia((prev) => [...prev, ...selectedUris]);
    }
  };

  const handlePost = async () => {
    if (!postType || (!caption && media.length === 0)) return;

    setLoading(true);
    try {
      const storageDetails =
        await userService.getStorageAccountDetails("community");
      if (!storageDetails.success) {
        alert("Server error, try again.");
        return;
      }

      const { storageAccountName, sasToken } = storageDetails.data;
      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      if (!userData.exists) {
        alert("User not found.");
        return;
      }

      const userId = userData.data._id;

      let uploadedUrls: string[] = [];

      if (postType !== "text" && media.length > 0) {
        uploadedUrls = await Promise.all(
          media.map(async (fileUri) => {
            const type = fileUri.endsWith(".mp4") ? "video" : "image";
            const ext =
              fileUri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
            const originalFileName =
              fileUri.split("/").pop() || `file-${Date.now()}.${ext}`;
            const fileName = `${userId}_${originalFileName}`;

            const uploadedUrl = await uploadToAzureFromExpo(
              fileUri,
              fileName,
              sasToken,
              storageAccountName,
              "admin-data",
              "community"
            );

            return uploadedUrl;
          })
        );
      }

      const post: Post = {
        communityId: communityId || "68866c50cf2f2ea93541e6f5",
        type: postType,
        media: uploadedUrls,
        text: caption,
        isActive: true,
        isApproved: true,
        createdBy: userId,
      };

      let response = await callService(post);

      if (response.success) {
        const newPost = {
          ...response.data,
          likeCount: 0,
          likedByUser: false,
          commentCount: 0,
        };

        setPosts((prev: any) => [newPost, ...prev]);
      }
    } catch (err) {
      console.error("Post error:", err);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setMedia([]);
      setCaption("");
      setPostType(null);
    }
  };

  return (
    <>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContainer,
                  keyboardHeight > 0 && Platform.OS === "android" && { 
                    marginBottom: keyboardHeight - 100,
                    maxHeight: "85%",
                  },
                ]}
              >
                {/* Dash Handle */}
                <View style={styles.dash} />

                <Text style={styles.modalTitle}>Create a Post</Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.scrollContent}
                >
                  {/* Post Type Options */}
                  <View style={styles.optionContainer}>
                    {[
                      { type: "text", icon: "text-outline" },
                      { type: "image", icon: "image-outline" },
                      { type: "video", icon: "videocam-outline" },
                    ].map(({ type, icon }) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.optionButton,
                          postType === type && styles.optionButtonSelected,
                        ]}
                        onPress={() => {
                          setPostType(type as any);
                          setMedia([]);
                        }}
                      >
                        <Ionicons
                          name={icon as any}
                          size={20}
                          color={
                            postType === type
                              ? "#FFFFFF"
                              : theme.colors.secondPrimary
                          }
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.optionButtonText,
                            postType === type && styles.optionButtonTextSelected,
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Caption for text post */}
                  {postType === "text" && (
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={theme.colors.secondPrimary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Write your caption..."
                        placeholderTextColor="#999"
                        multiline
                        style={styles.captionInput}
                        value={caption}
                        onChangeText={setCaption}
                      />
                    </View>
                  )}

                  {/* Media Preview */}
                  {(postType === "image" || postType === "video") &&
                    media.length > 0 && (
                      <View style={styles.sliderContainer}>
                        <View style={styles.inputContainer}>
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color={theme.colors.secondPrimary}
                            style={styles.inputIcon}
                          />
                          <TextInput
                            placeholder="Write your caption..."
                            placeholderTextColor="#999"
                            multiline
                            style={styles.captionInput}
                            value={caption}
                            onChangeText={setCaption}
                          />
                        </View>

                    <FlatList
                      data={media}
                      keyExtractor={(_, index) => index.toString()}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleScroll}
                      scrollEventThrottle={14}
                      renderItem={({ item }) => (
                        <View style={styles.mediaItem}>
                          {postType === "video" ? (
                            <Video
                              source={{ uri: item }}
                              style={styles.media}
                              useNativeControls
                              resizeMode={ResizeMode.COVER}
                            />
                          ) : (
                            <Pressable>
                              <Image
                                source={{ uri: item }}
                                style={styles.media}
                                resizeMode="cover"
                              />
                            </Pressable>
                          )}
                        </View>
                      )}
                    />

                    <View style={styles.dotsContainer}>
                      {media.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            i === currentMediaIndex && styles.activeDot,
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}

                  {/* Upload Button */}
                  {(postType === "image" || postType === "video") && (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handleUploadMedia}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={22}
                        color="#FFFFFF"
                      />
                      <Text style={styles.uploadButtonText}>
                        Upload {postType}
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setModalVisible(false);
                      setPostType(null);
                      setMedia([]);
                      setCaption("");
                    }}
                  >
                    <Ionicons
                      name="close-outline"
                      size={20}
                      color={theme.colors.dark}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  {loading ? (
                    <View style={styles.postButton}>
                      <ActivityIndicator color="#FFFFFF" />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.postButton}
                      onPress={handlePost}
                    >
                      <Ionicons
                        name="send-outline"
                        size={20}
                        color="#FFFFFF"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.postButtonText}>Post</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
});

CustomPostModal.displayName = "CustomPostModal";

export default CustomPostModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  inputIcon: {
    marginTop: 16,
    marginRight: 8,
  },
  dash: {
    width: 60,
    height: 6,
    backgroundColor: "#000000",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    color: theme.colors.dark,
    letterSpacing: 0.5,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: theme.colors.secondPrimary,
    backgroundColor: "transparent",
    minWidth: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.secondPrimary,
    borderColor: theme.colors.secondPrimary,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  optionButtonText: {
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
    fontSize: 15,
  },
  optionButtonTextSelected: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 15,
  },
  captionInput: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "rgba(151, 71, 255, 0.2)",
    fontFamily: theme.fonts.regular,
    color: theme.colors.dark,
    minHeight: 120,
    flex: 1,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  mediaItem: {
    width: screenWidth - 80,
    height: 280,
    borderRadius: 20,
    marginHorizontal: 10,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "rgba(151, 71, 255, 0.2)",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.secondPrimary,
    width: 10,
    height: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#67C694",
    padding: 14,
    borderRadius: 25,
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  cancelButton: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 25,
    flex: 1,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: theme.colors.dark,
    textAlign: "center",
    fontFamily: theme.fonts.medium,
    fontSize: 16,
  },
  postButton: {
    padding: 14,
    backgroundColor: "#67C694",
    borderRadius: 25,
    flex: 1,
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
});
