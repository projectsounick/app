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
    const itemWidth = screenWidth - 40 + 12; // width + gap
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
                    <Ionicons name="create-outline" size={20} color="#9747FF" />
                  </View>
                  <Text style={styles.modalTitle}>Create a Post</Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={18} color="#1A1A1A" />
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
                            size={18}
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
                        <FlatList
                          data={media}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          onScroll={handleScroll}
                          scrollEventThrottle={16}
                          bounces={true}
                          decelerationRate="fast"
                          snapToInterval={screenWidth - 40 + 12}
                          snapToAlignment="start"
                          contentContainerStyle={styles.mediaListContent}
                          keyExtractor={(_, index) => index.toString()}
                          nestedScrollEnabled={true}
                          directionalLockEnabled={true}
                          renderItem={({ item, index }) => (
                            <View 
                              style={[
                                styles.mediaItem,
                                { marginRight: index === media.length - 1 ? 0 : 12 }
                              ]}
                            >
                              {postType === "video" ? (
                                <Video
                                  source={{ uri: item }}
                                  style={styles.media}
                                  useNativeControls
                                  resizeMode={ResizeMode.CONTAIN}
                                />
                              ) : (
                                <Image
                                  source={{ uri: item }}
                                  style={styles.media}
                                  resizeMode="contain"
                                />
                              )}
                              <TouchableOpacity
                                onPress={() => handleRemoveMedia(index)}
                                style={styles.removeMediaButton}
                              >
                                <Ionicons name="close-circle" size={32} color="#1A1A1A" />
                              </TouchableOpacity>
                            </View>
                          )}
                        />

                        {media.length > 1 && (
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
                        )}
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
    height: 3,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    borderColor: "#F5F5F5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionButtonSelected: {
    borderWidth: 2,
    borderColor: "#9747FF",
    backgroundColor: "#FFFFFF",
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  optionIconContainerSelected: {
    backgroundColor: "#F3EDFF",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    color: "#1A1A1A",
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sliderContainer: {
    marginBottom: 16,
    marginHorizontal: -20,
  },
  mediaListContent: {
    paddingHorizontal: 20,
  },
  mediaItem: {
    width: screenWidth - 40,
    height: 280,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#F5F5F5",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  media: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F9F9F9",
  },
  removeMediaButton: {
    position: "absolute",
    top: 10,
    right: 10,
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
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
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
    paddingVertical: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 15,
  },
  postButton: {
    paddingVertical: 14,
    backgroundColor: "#67C694",
    borderRadius: 30,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  postButtonDisabled: {
    backgroundColor: "#D0D0D0",
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
