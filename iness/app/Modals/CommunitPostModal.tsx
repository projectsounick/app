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
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const screenWidth = Dimensions.get("window").width;

interface CustomPostModalProps {
  setPosts: any;
  communityId: any;
}

const CustomPostModal = React.forwardRef<{ openModal: () => void }, CustomPostModalProps>(
  ({ setPosts, communityId }, ref) => {
  const theme = useGlobalTheme();
  const styles = getStyles(theme);
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoPreviewLoading, setVideoPreviewLoading] = useState<
    Record<string, boolean>
  >({});

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

  useEffect(() => {
    if (postType !== "video") {
      setVideoPreviewLoading({});
      return;
    }

    setVideoPreviewLoading(
      media.reduce<Record<string, boolean>>((acc, uri) => {
        acc[uri] = true;
        return acc;
      }, {})
    );
  }, [media, postType]);

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
      mediaTypes: postType === "video" ? ["videos"] : ["images"],
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

    if (!communityId) {
      Alert.alert(
        "Community unavailable",
        "Unable to create a post because no community is selected."
      );
      return;
    }

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
        setIsUploading(true);
        setUploadProgress(0);

        // Upload files sequentially with progress tracking
        for (let i = 0; i < media.length; i++) {
          const fileUri = media[i];
          const type = fileUri.endsWith(".mp4") ? "video" : "image";
          const ext =
            fileUri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
          const originalFileName =
            fileUri.split("/").pop() || `file-${Date.now()}.${ext}`;
          const fileName = `${userId}_${originalFileName}`;

          console.log(`📤 Uploading ${i + 1}/${media.length}: ${type}`);

          try {
            const uploadedUrl = await uploadToAzureFromExpo(
              fileUri,
              fileName,
              sasToken,
              storageAccountName,
              "admin-data",
              "community",
              (fileProgress) => {
                const overallProgress = ((i + fileProgress / 100) / media.length) * 100;
                setUploadProgress(Math.max(1, Math.round(overallProgress)));
              }
            );

            uploadedUrls.push(uploadedUrl);
            setUploadProgress(Math.round(((i + 1) / media.length) * 100));
            console.log(`✅ Upload ${i + 1}/${media.length} complete`);
          } catch (uploadError: any) {
            console.error(`Failed to upload ${type}:`, uploadError);
            setIsUploading(false);
            Alert.alert(
              "Upload Failed",
              `Failed to upload ${type} ${i + 1}/${media.length}. ${uploadError.message || 'Please try again.'}`
            );
            throw uploadError; // Re-throw to stop the process
          }
        }

        setIsUploading(false);
      }

      const post: Post = {
        communityId: communityId,
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
                    <Ionicons name="create-outline" size={20} color={theme.colors.secondPrimary} />
                  </View>
                  <Text style={styles.modalTitle}>Create a Post</Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={18} color={theme.colors.text} />
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
                            color={postType === type ? theme.colors.secondPrimary : theme.colors.textSecondary}
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
                        placeholderTextColor={theme.colors.textMuted}
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
                                <>
                                  <Video
                                    source={{ uri: item }}
                                    style={styles.media}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    onLoadStart={() =>
                                      setVideoPreviewLoading((prev) => ({
                                        ...prev,
                                        [item]: true,
                                      }))
                                    }
                                    onLoad={() =>
                                      setVideoPreviewLoading((prev) => ({
                                        ...prev,
                                        [item]: false,
                                      }))
                                    }
                                    onReadyForDisplay={() =>
                                      setVideoPreviewLoading((prev) => ({
                                        ...prev,
                                        [item]: false,
                                      }))
                                    }
                                    onError={() =>
                                      setVideoPreviewLoading((prev) => ({
                                        ...prev,
                                        [item]: false,
                                      }))
                                    }
                                  />
                                </>
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
                                <Ionicons name="close-circle" size={32} color={theme.colors.text} />
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

                        {postType === "video" &&
                          Object.values(videoPreviewLoading).some(Boolean) && (
                            <View style={styles.videoPreviewStatus}>
                              <ActivityIndicator
                                size="small"
                                color={theme.colors.secondPrimary}
                              />
                              <Text style={styles.videoPreviewStatusText}>
                                Preparing video preview...
                              </Text>
                            </View>
                          )}
                      </View>
                    )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <View style={styles.uploadProgressContainer}>
                      <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                      </View>
                      <Text style={styles.uploadProgressText}>
                        Uploading... {uploadProgress}%
                        {postType === "video" && " (Large videos may take time)"}
                      </Text>
                    </View>
                  )}

                  {/* Upload Button */}
                  {(postType === "image" || postType === "video") && !isUploading && (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handleUploadMedia}
                      disabled={loading}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={22}
                        color={theme.colors.textWhite}
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
                      <ActivityIndicator color={theme.colors.textWhite} />
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
                        color={theme.colors.textWhite}
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

const getStyles = (theme: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "92%",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  handleBar: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.border,
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundSecondary,
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
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
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
    borderColor: theme.colors.secondPrimary,
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  optionIconContainerSelected: {
    backgroundColor: theme.colors.backgroundCardLight,
  },
  optionButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium as "500",
  },
  optionButtonTextSelected: {
    color: theme.colors.secondPrimary,
    fontWeight: theme.fontWeights.bold as "700",
  },
  inputContainer: {
    marginBottom: 16,
  },
  captionInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    textAlignVertical: "top",
    fontSize: theme.fontSizes.regular,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
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
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    backgroundColor: theme.colors.backgroundSecondary,
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
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.secondPrimary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  videoPreviewStatus: {
    marginTop: 12,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  videoPreviewStatusText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.medium,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: "center",
    marginTop: 8,
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  uploadButtonText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.bold as "700",
    marginLeft: 8,
    fontSize: theme.fontSizes.regular,
  },
  uploadProgressContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  uploadProgressText: {
    marginTop: 8,
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontFamily: theme.fonts.medium,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 14,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 30,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.medium as "500",
    fontSize: theme.fontSizes.regular,
  },
  postButton: {
    paddingVertical: 14,
    backgroundColor: theme.colors.success,
    borderRadius: 30,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  postButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  postButtonText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.bold as "700",
    fontSize: theme.fontSizes.regular,
  },
});
