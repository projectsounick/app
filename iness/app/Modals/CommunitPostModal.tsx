import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  NativeEventEmitter,
  NativeModules,
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
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "expo-av";
import { isValidFile, showEditor } from "react-native-video-trim";

import {
  CommunityDraftMediaItem,
  CommunityPostDraftPayload,
} from "../interfaces/communityComposer";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const screenWidth = Dimensions.get("window").width;

type SelectedMediaMeta = {
  kind: "image" | "video";
  fileName?: string | null;
  mimeType?: string | null;
  previewUri?: string | null;
};

const EXTENSION_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  webm: "video/webm",
  "3gp": "video/3gpp",
};

const getFileExtension = (value?: string | null) => {
  if (!value) return null;

  const cleanValue = value.split("?")[0]?.split("#")[0] ?? "";
  const match = cleanValue.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : null;
};

const normalizeLocalFileUri = (value: string) => {
  if (!value) return value;
  if (value.startsWith("file://") || value.startsWith("content://")) {
    return value;
  }

  return `file://${value}`;
};

const loadVideoThumbnailsModule = () => {
  try {
    return require("expo-video-thumbnails") as {
      getThumbnailAsync: (
        uri: string,
        options: { quality?: number; time?: number }
      ) => Promise<{ uri: string }>;
    };
  } catch {
    return null;
  }
};

interface CustomPostModalProps {
  communityId: any;
  onSubmitDraft: (draft: CommunityPostDraftPayload) => void;
}

const CustomPostModal = React.forwardRef<{ openModal: () => void }, CustomPostModalProps>(
  ({ communityId, onSubmitDraft }, ref) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme);
  const mediaRef = useRef<string[]>([]);
  const editingSourceUriRef = useRef<string | null>(null);
  const videoThumbnailsModuleRef = useRef(loadVideoThumbnailsModule());
  const videoTrimEmitterRef = useRef<NativeEventEmitter | null>(
    NativeModules.VideoTrim ? new NativeEventEmitter(NativeModules.VideoTrim) : null
  );
  const [modalVisible, setModalVisible] = useState(false);

  React.useImperativeHandle(ref, () => ({
    openModal: () => setModalVisible(true),
  }));
  const [postType, setPostType] = useState<"text" | "image" | "video" | null>(
    null
  );
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [mediaMetadata, setMediaMetadata] = useState<
    Record<string, SelectedMediaMeta>
  >({});
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [isPickingMedia, setIsPickingMedia] = useState(false);
  const [videoPreviewLoading, setVideoPreviewLoading] = useState<
    Record<string, boolean>
  >({});
  const canGenerateVideoThumbnails =
    !!videoThumbnailsModuleRef.current?.getThumbnailAsync;

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
    mediaRef.current = media;
  }, [media]);

  const resetComposer = useCallback(() => {
    setModalVisible(false);
    setPostType(null);
    setMedia([]);
    setMediaMetadata({});
    setCaption("");
    setCurrentMediaIndex(0);
    setIsEditingVideo(false);
    setIsPickingMedia(false);
    setVideoPreviewLoading({});
    editingSourceUriRef.current = null;
  }, []);

  const generateVideoPreview = useCallback(async (videoUri: string) => {
    const normalizedUri = normalizeLocalFileUri(videoUri);
    const videoThumbnailsModule = videoThumbnailsModuleRef.current;

    if (!videoThumbnailsModule?.getThumbnailAsync) {
      setVideoPreviewLoading((prev) => ({
        ...prev,
        [normalizedUri]: false,
      }));
      return;
    }

    setVideoPreviewLoading((prev) => ({
      ...prev,
      [normalizedUri]: true,
    }));

    try {
      let previewUri: string | null = null;
      let lastError: unknown = null;

      for (const time of [500, 0]) {
        try {
          const { uri } = await videoThumbnailsModule.getThumbnailAsync(
            normalizedUri,
            {
              quality: 0.7,
              time,
            }
          );
          previewUri = uri;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!previewUri) {
        throw lastError || new Error("Unable to build preview thumbnail.");
      }

      setMediaMetadata((prev) => {
        const existing = prev[normalizedUri];

        if (!existing || existing.kind !== "video") {
          return prev;
        }

        return {
          ...prev,
          [normalizedUri]: {
            ...existing,
            previewUri,
          },
        };
      });
    } catch (error) {
      console.warn("Failed to generate community video preview", error);
      setMediaMetadata((prev) => {
        const existing = prev[normalizedUri];

        if (!existing || existing.kind !== "video") {
          return prev;
        }

        return {
          ...prev,
          [normalizedUri]: {
            ...existing,
            previewUri: null,
          },
        };
      });
    } finally {
      setVideoPreviewLoading((prev) => ({
        ...prev,
        [normalizedUri]: false,
      }));
    }
  }, []);

  const replaceSingleVideoUri = useCallback((nextUri: string) => {
    const normalizedUri = normalizeLocalFileUri(nextUri);
    const previousUri =
      editingSourceUriRef.current || mediaRef.current[0] || null;

    setMedia([normalizedUri]);
    setCurrentMediaIndex(0);
    setVideoPreviewLoading({ [normalizedUri]: true });
    setMediaMetadata((prev) => {
      const next = { ...prev };

      if (previousUri && previousUri !== normalizedUri) {
        delete next[previousUri];
      }

      next[normalizedUri] = {
        kind: "video",
        fileName:
          normalizedUri.split("/").pop()?.split("?")[0] ||
          `edited-video-${Date.now()}.mp4`,
        mimeType:
          EXTENSION_MIME_MAP[getFileExtension(normalizedUri) || ""] ||
          "video/mp4",
        previewUri: null,
      };

      return next;
    });
    void generateVideoPreview(normalizedUri);
  }, [generateVideoPreview]);

  useEffect(() => {
    const emitter = videoTrimEmitterRef.current;
    if (!emitter) {
      return;
    }

    const subscription = emitter.addListener("VideoTrim", (event: any) => {
      if (!event?.name) {
        return;
      }

      switch (event.name) {
        case "onFinishTrimming":
          if (event.outputPath) {
            replaceSingleVideoUri(event.outputPath);
          }
          setIsEditingVideo(false);
          editingSourceUriRef.current = null;
          break;
        case "onCancel":
        case "onHide":
          setIsEditingVideo(false);
          editingSourceUriRef.current = null;
          break;
        case "onError":
          setIsEditingVideo(false);
          editingSourceUriRef.current = null;
          Alert.alert(
            "Video edit failed",
            event.message || "Unable to edit this video right now."
          );
          break;
        default:
          break;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [replaceSingleVideoUri]);

  const handleScroll = (event: any) => {
    const itemWidth = screenWidth - 40 + 12; // width + gap
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / itemWidth);
    setCurrentMediaIndex(index);
  };

  const handleUploadMedia = async () => {
    setIsPickingMedia(true);

    try {
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
        allowsMultipleSelection: postType !== "video",
        quality: 1,
        ...(Platform.OS === "ios" && postType === "video"
          ? {
              preferredAssetRepresentationMode:
                ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
              videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
            }
          : {}),
      });

      if (result.canceled) {
        return;
      }

      const selectedAssets =
        postType === "video" ? result.assets.slice(0, 1) : result.assets;
      const normalizedAssets = selectedAssets.map((asset) => {
        const normalizedUri =
          asset.type === "video"
            ? normalizeLocalFileUri(asset.uri)
            : asset.uri;

        return {
          ...asset,
          normalizedUri,
        };
      });
      const selectedUris = normalizedAssets.map((asset) => asset.normalizedUri);
      setCurrentMediaIndex(0);
      setMedia((prev) =>
        postType === "video" ? selectedUris : [...prev, ...selectedUris]
      );
      if (postType === "video" && canGenerateVideoThumbnails) {
        setVideoPreviewLoading(
          selectedUris.reduce<Record<string, boolean>>((acc, uri) => {
            acc[uri] = true;
            return acc;
          }, {})
        );
      }
      setMediaMetadata((prev) => {
        const next = { ...prev };

        if (postType === "video") {
          mediaRef.current.forEach((uri) => {
            delete next[uri];
          });
        }

        normalizedAssets.forEach((asset) => {
          next[asset.normalizedUri] = {
            kind: asset.type === "video" ? "video" : "image",
            fileName: asset.fileName,
            mimeType: asset.mimeType ?? null,
            previewUri: asset.type === "video" ? null : asset.normalizedUri,
          };
        });

        return next;
      });

      const previewTasks = normalizedAssets
        .filter((asset) => asset.type === "video" && canGenerateVideoThumbnails)
        .map((asset) => generateVideoPreview(asset.normalizedUri));

      if (previewTasks.length > 0) {
        await Promise.all(previewTasks);
      }
    } finally {
      setIsPickingMedia(false);
    }
  };

  const handleEditVideo = async () => {
    const currentVideoUri = media[0];

    if (!currentVideoUri) {
      Alert.alert("Video missing", "Pick a video before opening the editor.");
      return;
    }

    if (!NativeModules.VideoTrim) {
      Alert.alert(
        "Rebuild required",
        "Video editing needs the new native package. Rebuild your development app once and then it will work here."
      );
      return;
    }

    try {
      const validation = await isValidFile(currentVideoUri);
      if (!validation?.isValid || validation.fileType !== "video") {
        Alert.alert(
          "Unsupported video",
          "This file could not be opened in the video editor."
        );
        return;
      }

      editingSourceUriRef.current = currentVideoUri;
      setIsEditingVideo(true);
      showEditor(currentVideoUri, {
        saveToPhoto: false,
        openDocumentsOnFinish: false,
        openShareSheetOnFinish: false,
        closeWhenFinish: true,
        enableCancelDialog: true,
        headerText: "Edit your clip",
        saveButtonText: "Done",
        cancelButtonText: "Cancel",
        trimmingText: "Applying your video changes...",
        enableCancelTrimming: true,
        cancelTrimmingButtonText: "Stop",
        theme: isDark ? "dark" : "light",
      });
    } catch (error: any) {
      setIsEditingVideo(false);
      editingSourceUriRef.current = null;
      Alert.alert(
        "Video editor unavailable",
        error?.message || "Unable to open the editor right now."
      );
    }
  };

  const handleRemoveMedia = (index: number) => {
    const removedUri = media[index];
    const nextMediaLength = Math.max(0, media.length - 1);
    if (nextMediaLength === 0) {
      setCurrentMediaIndex(0);
    } else if (currentMediaIndex >= nextMediaLength) {
      setCurrentMediaIndex(nextMediaLength - 1);
    }
    setMedia((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviewLoading((prev) => {
      if (!removedUri) {
        return prev;
      }

      const next = { ...prev };
      delete next[removedUri];
      return next;
    });
    setMediaMetadata((prev) => {
      if (!removedUri) {
        return prev;
      }

      const next = { ...prev };
      delete next[removedUri];
      return next;
    });
  };

  const handlePost = () => {
    if (!postType || (!trimmedCaption && media.length === 0)) return;

    if (!communityId) {
      Alert.alert(
        "Community unavailable",
        "Unable to create a post because no community is selected."
      );
      return;
    }

    const draftMedia: CommunityDraftMediaItem[] = media.map((uri) => {
      const metadata = mediaMetadata[uri];

      return {
        uri,
        kind:
          metadata?.kind || (postType === "video" ? "video" : "image"),
        fileName:
          metadata?.fileName ||
          uri.split("/").pop()?.split("?")[0] ||
          null,
        mimeType:
          metadata?.mimeType ||
          EXTENSION_MIME_MAP[getFileExtension(uri) || ""] ||
          null,
        previewUri: metadata?.previewUri || null,
      };
    });

    onSubmitDraft({
      communityId: String(communityId),
      type: postType,
      text: trimmedCaption,
      media: draftMedia,
    });
    resetComposer();
  };

  const handleClose = () => {
    resetComposer();
  };

  const trimmedCaption = caption.trim();
  const canSubmit =
    !!postType &&
    (trimmedCaption.length > 0 || media.length > 0) &&
    !isEditingVideo &&
    !isPickingMedia;

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
                          setMediaMetadata({});
                          setCurrentMediaIndex(0);
                          setVideoPreviewLoading({});
                          setIsEditingVideo(false);
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
                      {(postType === "image" || postType === "video") && (
                        <Text style={styles.uploadHintText}>
                          Nothing uploads yet. We only start uploading after you
                          tap Post, and the feed will keep showing progress while
                          you browse.
                        </Text>
                      )}
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
                                <View style={styles.videoPreviewFrame}>
                                  {mediaMetadata[item]?.previewUri ? (
                                    <Image
                                      source={{
                                        uri: mediaMetadata[item]?.previewUri || item,
                                      }}
                                      style={styles.media}
                                      resizeMode="contain"
                                    />
                                  ) : (
                                    <View
                                      style={[
                                        styles.media,
                                        styles.videoPreviewPlaceholder,
                                      ]}
                                    >
                                      <Ionicons
                                        name="videocam-outline"
                                        size={36}
                                        color={theme.colors.textMuted}
                                      />
                                      <Text style={styles.videoPreviewPlaceholderText}>
                                        {videoPreviewLoading[item]
                                          ? "Preparing preview..."
                                          : "Preview will appear here"}
                                      </Text>
                                    </View>
                                  )}

                                  {!mediaMetadata[item]?.previewUri &&
                                  !videoPreviewLoading[item] &&
                                  !canGenerateVideoThumbnails ? (
                                    <Video
                                      source={{ uri: item }}
                                      style={styles.media}
                                      useNativeControls
                                      resizeMode={ResizeMode.CONTAIN}
                                      shouldPlay={false}
                                      isLooping={false}
                                      isMuted
                                    />
                                  ) : null}

                                  <View style={styles.videoPreviewBadge}>
                                    <Ionicons
                                      name="play"
                                      size={18}
                                      color={theme.colors.textWhite}
                                    />
                                  </View>
                                </View>
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

                  {/* Media Actions */}
                  {(postType === "image" || postType === "video") && (
                    <View
                      style={[
                        styles.mediaActionGroup,
                        postType === "video" &&
                          media.length > 0 &&
                          styles.mediaActionGroupSplit,
                      ]}
                    >
                      {postType === "video" && media.length > 0 ? (
                        <View style={styles.videoActionIconRow}>
                          <TouchableOpacity
                            style={[
                              styles.videoToolButton,
                              styles.videoToolButtonPrimary,
                              (isEditingVideo || isPickingMedia) &&
                                styles.editVideoButtonDisabled,
                            ]}
                            onPress={handleUploadMedia}
                            disabled={isEditingVideo || isPickingMedia}
                            accessibilityRole="button"
                            accessibilityLabel="Replace clip"
                          >
                            {isPickingMedia ? (
                              <ActivityIndicator
                                size="small"
                                color={theme.colors.textWhite}
                              />
                            ) : (
                              <Ionicons
                                name="swap-horizontal"
                                size={20}
                                color={theme.colors.textWhite}
                              />
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.videoToolButton,
                              styles.videoToolButtonSecondary,
                              (isEditingVideo || isPickingMedia) &&
                                styles.editVideoButtonDisabled,
                            ]}
                            onPress={handleEditVideo}
                            disabled={isEditingVideo || isPickingMedia}
                            accessibilityRole="button"
                            accessibilityLabel={
                              isEditingVideo ? "Opening clip editor" : "Edit clip"
                            }
                          >
                            {isEditingVideo ? (
                              <ActivityIndicator
                                size="small"
                                color={theme.colors.secondPrimary}
                              />
                            ) : (
                              <Ionicons
                                name="cut-outline"
                                size={20}
                                color={theme.colors.secondPrimary}
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.uploadButton,
                            postType === "video" &&
                              media.length > 0 &&
                              styles.secondaryUploadButton,
                          ]}
                          onPress={handleUploadMedia}
                          disabled={isEditingVideo || isPickingMedia}
                        >
                          {isPickingMedia ? (
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.textWhite}
                            />
                          ) : (
                            <Ionicons
                              name={
                                postType === "video" && media.length > 0
                                  ? "swap-horizontal-outline"
                                  : "cloud-upload-outline"
                              }
                              size={22}
                              color={theme.colors.textWhite}
                            />
                          )}
                          <Text style={styles.uploadButtonText}>
                            {isPickingMedia
                              ? postType === "video"
                                ? "Preparing video..."
                                : "Opening gallery..."
                              : postType === "video"
                                ? media.length > 0
                                  ? "Replace clip"
                                  : "Pick video"
                                : media.length > 0
                                  ? "Add more photos"
                                  : "Pick images"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
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

                  <TouchableOpacity
                    style={[
                      styles.postButton,
                      !canSubmit && styles.postButtonDisabled,
                    ]}
                    onPress={handlePost}
                    disabled={!canSubmit}
                  >
                    <Ionicons
                      name="send-outline"
                      size={20}
                      color={theme.colors.textWhite}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.postButtonText}>
                      {postType === "video" || postType === "image"
                        ? "Post & upload"
                        : "Post"}
                    </Text>
                  </TouchableOpacity>
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
  uploadHintText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
    marginTop: 10,
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
  videoPreviewFrame: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  videoPreviewPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  videoPreviewPlaceholderText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.small,
    textAlign: "center",
  },
  videoPreviewBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    left: "50%",
    marginLeft: -22,
    marginTop: -22,
    position: "absolute",
    top: "50%",
    width: 44,
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
  mediaActionGroup: {
    gap: 10,
    marginTop: 8,
  },
  mediaActionGroupSplit: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
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
  secondaryUploadButton: {
    flex: 1,
  },
  uploadButtonText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.bold as "700",
    marginLeft: 8,
    fontSize: theme.fontSizes.regular,
  },
  videoActionIconRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    width: "100%",
  },
  videoToolButton: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  videoToolButtonPrimary: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  videoToolButtonSecondary: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.secondPrimary,
  },
  editVideoButton: {
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.secondPrimary,
    borderRadius: 30,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  editVideoButtonDisabled: {
    opacity: 0.7,
  },
  editVideoButtonText: {
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.regularSmall,
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
