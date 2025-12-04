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
    const itemWidth = screenWidth - 40;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / itemWidth);
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

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
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

  const handleClose = () => {
    setModalVisible(false);
    setPostType(null);
    setMedia([]);
    setCaption("");
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
                {/* Top Handle Bar */}
                <View style={styles.handleBar} />

                {/* Header with Close Button */}
                <View style={styles.headerContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="create-outline" size={24} color="#9747FF" />
                  </View>
                  <Text style={styles.modalTitle}>Create a Post</Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={20} color="#000" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.scrollContent}
                  nestedScrollEnabled={true}
                  bounces={true}
                  scrollEnabled={true}
                >
                  {/* Post Type Options */}
                  <View style={styles.optionContainer}>
                    {[
                      { type: "text", icon: "text-outline", label: "Text" },
                      { type: "image", icon: "image-outline", label: "Image" },
                      { type: "video", icon: "videocam-outline", label: "Video" },
                    ].map(({ type, icon, label }) => (
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
                        <View
                          style={[
                            styles.optionIconContainer,
                            postType === type && styles.optionIconContainerSelected,
                          ]}
                        >
                          <Ionicons
                            name={icon as any}
                            size={20}
                            color={postType === type ? "#9747FF" : "#666"}
                          />
                        </View>
                        <Text
                          style={[
                            styles.optionButtonText,
                            postType === type && styles.optionButtonTextSelected,
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Caption Input */}
                  {postType && (
                    <View style={styles.inputContainer}>
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
                        <View style={styles.mediaScrollWrapper}>
                          <ScrollView
                            horizontal
                            pagingEnabled={false}
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            nestedScrollEnabled={true}
                            bounces={true}
                            decelerationRate={0.9}
                            snapToInterval={screenWidth - 40}
                            snapToAlignment="start"
                            directionalLockEnabled={true}
                            contentContainerStyle={styles.mediaListContent}
                            style={styles.mediaFlatList}
                            scrollEnabled={true}
                          >
                            {media.map((item, index) => (
                              <View key={index} style={styles.mediaItem}>
                                {postType === "video" ? (
                                  <Video
                                    source={{ uri: item }}
                                    style={styles.media}
                                    useNativeControls
                                    resizeMode={ResizeMode.COVER}
                                  />
                                ) : (
                                  <Image
                                    source={{ uri: item }}
                                    style={styles.media}
                                    resizeMode="cover"
                                  />
                                )}
                                <TouchableOpacity
                                  onPress={() => handleRemoveMedia(index)}
                                  style={styles.removeMediaButton}
                                >
                                  <Ionicons name="close-circle" size={24} color="#fff" />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </ScrollView>
                        </View>

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
                        {media.length > 0 ? "Add More" : `Upload ${postType}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  {loading ? (
                    <View style={styles.postButton}>
                      <ActivityIndicator color="#FFFFFF" />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.postButton,
                        (!postType || (!caption && media.length === 0)) && styles.postButtonDisabled,
                      ]}
                      onPress={handlePost}
                      disabled={!postType || (!caption && media.length === 0)}
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "92%",
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D0D0D0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mediaListContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonSelected: {
    borderWidth: 2,
    borderColor: "#9747FF",
    backgroundColor: "#FFFFFF",
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  optionIconContainerSelected: {
    backgroundColor: "#F3E8FF",
  },
  optionButtonText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  optionButtonTextSelected: {
    color: "#9747FF",
    fontWeight: "700",
  },
  inputContainer: {
    marginBottom: 16,
  },
  captionInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#000",
    minHeight: 120,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  mediaScrollWrapper: {
    width: "100%",
  },
  mediaFlatList: {
    flexGrow: 0,
  },
  mediaItem: {
    width: screenWidth - 40,
    height: 280,
    borderRadius: 16,
    marginRight: 0,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#F5F5F5",
    position: "relative",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  removeMediaButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: "#D0D0D0",
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#9747FF",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#67C694",
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    marginTop: 8,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 30,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  postButton: {
    paddingVertical: 16,
    backgroundColor: "#67C694",
    borderRadius: 30,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonDisabled: {
    backgroundColor: "#D0D0D0",
    opacity: 0.6,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
