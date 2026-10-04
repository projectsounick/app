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
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "@/src/modules/AppVideo";
import { isValidFile, showEditor } from "react-native-video-trim";

import {
  CommunityContentType,
  CommunityDraftMediaItem,
  CommunityPostDraftPayload,
} from "../interfaces/communityComposer";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";

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
  const [contentType, setContentType] = useState<CommunityContentType>("regular");
  const [audience, setAudience] = useState<"public" | "followers" | "company" | "private">("public");
  const [publishingStatus, setPublishingStatus] = useState<"published" | "draft" | "scheduled">("published");
  const [hashtagsText, setHashtagsText] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [detailOne, setDetailOne] = useState("");
  const [detailTwo, setDetailTwo] = useState("");
  const [scheduleOffsetDays, setScheduleOffsetDays] = useState<1 | 7>(1);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [sharingEnabled, setSharingEnabled] = useState(true);
  const [isSensitive, setIsSensitive] = useState(false);
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
    setContentType("regular");
    setAudience("public");
    setPublishingStatus("published");
    setHashtagsText("");
    setPollOptions(["", ""]);
    setDetailOne("");
    setDetailTwo("");
    setScheduleOffsetDays(1);
    setCommentsEnabled(true);
    setSharingEnabled(true);
    setIsSensitive(false);
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

    const metadata: Record<string, unknown> = {};
    if (contentType === "poll") metadata.pollOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
    if (contentType === "transformation") {
      metadata.beforeLabel = detailOne.trim() || "Before";
      metadata.afterLabel = detailTwo.trim() || "After";
    }
    if (contentType === "progress") {
      metadata.metric = detailOne.trim();
      metadata.change = detailTwo.trim();
    }
    if (contentType === "workout" || contentType === "session") {
      metadata.duration = detailOne.trim();
      metadata.intensity = detailTwo.trim();
    }
    if (contentType === "exercise") {
      metadata.sets = detailOne.trim();
      metadata.reps = detailTwo.trim();
    }
    if (contentType === "recipe") {
      metadata.calories = detailOne.trim();
      metadata.protein = detailTwo.trim();
    }
    if (contentType === "event") {
      metadata.startsAt = detailOne.trim();
      metadata.location = detailTwo.trim();
    }
    if (contentType === "milestone" || contentType === "weekly_recap") {
      metadata.highlight = detailOne.trim();
      metadata.nextGoal = detailTwo.trim();
    }

    onSubmitDraft({
      communityId: String(communityId),
      type: postType,
      text: trimmedCaption,
      media: draftMedia,
      contentType,
      audience,
      publishingStatus,
      scheduledAt:
        publishingStatus === "scheduled"
          ? new Date(Date.now() + scheduleOffsetDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      hashtags: hashtagsText
        .split(/[\s,]+/)
        .map((tag) => tag.replace(/^#/, "").trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10),
      commentsEnabled,
      sharingEnabled,
      isSensitive,
      metadata,
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
    !isPickingMedia &&
    (contentType !== "poll" || pollOptions.filter((option) => option.trim()).length >= 2);

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            {/* Backdrop click to dismiss keyboard */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.backdropArea} />
            </TouchableWithoutFeedback>

            <View
              style={[
                styles.modalContainer,
                keyboardHeight > 0 && Platform.OS === "android" && {
                  marginBottom: Math.max(0, keyboardHeight - 100),
                  height: "85%",
                },
              ]}
            >
              {/* Top Handle Bar */}
              <View style={styles.handleBar} />

              {/* Instagram-style Top Header */}
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Close post modal"
                >
                  <Ionicons name="close" size={18} color={theme.colors.text} />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>New Post</Text>

                <TouchableOpacity
                  style={[styles.topShareButton, !canSubmit && styles.topShareButtonDisabled]}
                  onPress={handlePost}
                  disabled={!canSubmit}
                  accessibilityRole="button"
                  accessibilityLabel="Share post"
                >
                  <Text style={[styles.topShareButtonText, !canSubmit && styles.topShareButtonTextDisabled]}>
                    Share
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Main ScrollView */}
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
                bounces={true}
                scrollEnabled={true}
                scrollEventThrottle={16}
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

                {postType && (
                  <View style={styles.featureSection}>
                    <Text style={styles.featureTitle}>What are you sharing?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featureChips}>
                      {[
                        ["regular", "Post", "sparkles-outline"],
                        ["transformation", "Transformation", "swap-horizontal-outline"],
                        ["progress", "Progress", "trending-up-outline"],
                        ["workout", "Workout", "barbell-outline"],
                        ["poll", "Poll", "stats-chart-outline"],
                        ["question", "Q&A", "help-circle-outline"],
                        ["exercise", "Exercise", "fitness-outline"],
                        ["recipe", "Recipe", "restaurant-outline"],
                        ["milestone", "Milestone", "trophy-outline"],
                        ["session", "Session", "calendar-outline"],
                        ["event", "Event", "people-outline"],
                        ["weekly_recap", "Recap", "ribbon-outline"],
                      ].map(([value, label, icon]) => (
                        <TouchableOpacity
                          key={value}
                          style={[styles.featureChip, contentType === value && styles.featureChipActive]}
                          onPress={() => {
                            setContentType(value as CommunityContentType);
                            setDetailOne("");
                            setDetailTwo("");
                          }}
                        >
                          <Ionicons
                            name={icon as any}
                            size={15}
                            color={contentType === value ? theme.colors.dark : theme.colors.textSecondary}
                          />
                          <Text style={[styles.featureChipText, contentType === value && styles.featureChipTextActive]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

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
                    {contentType === "poll" && (
                      <View style={styles.pollEditor}>
                        {pollOptions.map((option, index) => (
                          <TextInput
                            key={index}
                            value={option}
                            onChangeText={(value) => setPollOptions((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
                            placeholder={`Option ${index + 1}`}
                            placeholderTextColor={theme.colors.textMuted}
                            style={styles.pollInput}
                            maxLength={80}
                          />
                        ))}
                        {pollOptions.length < 6 && (
                          <TouchableOpacity style={styles.addPollOption} onPress={() => setPollOptions((current) => [...current, ""])}>
                            <Ionicons name="add-circle-outline" size={18} color={theme.colors.secondPrimary} />
                            <Text style={styles.addPollOptionText}>Add option</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    {contentType !== "regular" && contentType !== "poll" && contentType !== "question" ? (
                      <View style={styles.detailEditor}>
                        <TextInput
                          value={detailOne}
                          onChangeText={setDetailOne}
                          placeholder={
                            contentType === "progress" ? "Metric (for example: weight or steps)" :
                            contentType === "workout" || contentType === "session" ? "Duration (for example: 45 min)" :
                            contentType === "exercise" ? "Sets" :
                            contentType === "recipe" ? "Calories" :
                            contentType === "event" ? "Start date and time" :
                            "Main highlight"
                          }
                          placeholderTextColor={theme.colors.textMuted}
                          style={styles.pollInput}
                          maxLength={100}
                        />
                        <TextInput
                          value={detailTwo}
                          onChangeText={setDetailTwo}
                          placeholder={
                            contentType === "progress" ? "Change or result" :
                            contentType === "workout" || contentType === "session" ? "Intensity" :
                            contentType === "exercise" ? "Reps" :
                            contentType === "recipe" ? "Protein (g)" :
                            contentType === "event" ? "Location or meeting link" :
                            "Next goal"
                          }
                          placeholderTextColor={theme.colors.textMuted}
                          style={styles.pollInput}
                          maxLength={160}
                        />
                      </View>
                    ) : null}
                    {contentType === "question" ? (
                      <View style={styles.helperCard}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.secondPrimary} />
                        <Text style={styles.helperText}>Trainer answers are identified in comments. Keep health questions general; do not include private medical information.</Text>
                      </View>
                    ) : null}
                    {contentType === "transformation" && (
                      <View style={styles.detailEditor}>
                        <View style={styles.helperCard}>
                          <Ionicons name="swap-horizontal-outline" size={18} color={theme.colors.secondPrimary} />
                          <Text style={styles.helperText}>
                            Upload 2 photos (1st = Before, 2nd = After). The interactive comparison switcher will be enabled for your post!
                          </Text>
                        </View>
                        <TextInput
                          value={detailOne}
                          onChangeText={setDetailOne}
                          placeholder="Before details (e.g. 85 kg · Jan 2024)"
                          placeholderTextColor={theme.colors.textMuted}
                          style={styles.pollInput}
                          maxLength={50}
                        />
                        <TextInput
                          value={detailTwo}
                          onChangeText={setDetailTwo}
                          placeholder="After details (e.g. 72 kg · Now)"
                          placeholderTextColor={theme.colors.textMuted}
                          style={styles.pollInput}
                          maxLength={50}
                        />
                      </View>
                    )}
                    <TextInput
                      value={hashtagsText}
                      onChangeText={setHashtagsText}
                      placeholder="#strength #wellness"
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.hashtagInput}
                      maxLength={250}
                    />
                    {/* Quick Fitness Hashtags */}
                    <View style={styles.quickTagsRow}>
                      {["#fitness", "#transformation", "#workout", "#motivation", "#cleanfood"].map((tag) => (
                        <TouchableOpacity
                          key={tag}
                          style={styles.quickTagChip}
                          onPress={() => {
                            setHashtagsText((prev) => (prev ? (prev.includes(tag) ? prev : `${prev} ${tag}`) : tag));
                          }}
                        >
                          <Text style={styles.quickTagText}>{tag}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {(postType === "image" || postType === "video") && (
                      <Text style={styles.uploadHintText}>
                        Nothing uploads yet. We only start uploading after you
                        tap Post, and the feed will keep showing progress while
                        you browse.
                      </Text>
                    )}
                  </View>
                )}

                {postType && (
                  <View style={styles.settingsCard}>
                    <Text style={styles.featureTitle}>Post settings</Text>
                    <View style={styles.segmentedRow}>
                      {(["public", "followers", "company", "private"] as const).map((value) => (
                        <TouchableOpacity key={value} style={[styles.segment, audience === value && styles.segmentActive]} onPress={() => setAudience(value)}>
                          <Text style={[styles.segmentText, audience === value && styles.segmentTextActive]}>{value === "public" ? "Everyone" : value[0].toUpperCase() + value.slice(1)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {publishingStatus === "scheduled" ? (
                      <View style={styles.scheduleRow}>
                        {([1, 7] as const).map((days) => (
                          <TouchableOpacity key={days} style={[styles.scheduleChip, scheduleOffsetDays === days && styles.scheduleChipActive]} onPress={() => setScheduleOffsetDays(days)}>
                            <Ionicons name="time-outline" size={14} color={scheduleOffsetDays === days ? theme.colors.secondPrimary : theme.colors.textSecondary} />
                            <Text style={[styles.scheduleText, scheduleOffsetDays === days && styles.scheduleTextActive]}>{days === 1 ? "Tomorrow" : "Next week"}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                    <View style={styles.segmentedRow}>
                      {(["published", "draft", "scheduled"] as const).map((value) => (
                        <TouchableOpacity key={value} style={[styles.segment, publishingStatus === value && styles.segmentActive]} onPress={() => setPublishingStatus(value)}>
                          <Text style={[styles.segmentText, publishingStatus === value && styles.segmentTextActive]}>{value === "published" ? "Now" : value === "scheduled" ? "Tomorrow" : "Draft"}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {[
                      ["Comments", commentsEnabled, setCommentsEnabled],
                      ["Sharing", sharingEnabled, setSharingEnabled],
                      ["Sensitive content warning", isSensitive, setIsSensitive],
                    ].map(([label, value, setter]) => (
                      <View style={styles.settingRow} key={label as string}>
                        <Text style={styles.settingLabel}>{label as string}</Text>
                        <Switch
                          value={value as boolean}
                          onValueChange={setter as (value: boolean) => void}
                          trackColor={{ false: theme.colors.border, true: theme.colors.secondPrimary }}
                          thumbColor={value ? theme.colors.textWhite : theme.colors.textMuted}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {/* Media Preview - Single item uses pure View to eliminate any gesture conflict */}
                {(postType === "image" || postType === "video") &&
                  media.length > 0 && (
                    <View style={styles.sliderContainer}>
                      {media.length === 1 ? (
                        <View style={styles.mediaItem}>
                          {postType === "video" ? (
                            <View style={styles.videoPreviewFrame}>
                              {mediaMetadata[media[0]]?.previewUri ? (
                                <Image
                                  source={{
                                    uri: mediaMetadata[media[0]]?.previewUri || media[0],
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
                                    {videoPreviewLoading[media[0]]
                                      ? "Preparing preview..."
                                      : "Preview will appear here"}
                                  </Text>
                                </View>
                              )}

                              {!mediaMetadata[media[0]]?.previewUri &&
                              !videoPreviewLoading[media[0]] &&
                              !canGenerateVideoThumbnails ? (
                                <Video
                                  source={{ uri: media[0] }}
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
                              source={{ uri: media[0] }}
                              style={styles.media}
                              resizeMode="contain"
                            />
                          )}
                          {contentType === "transformation" && (
                            <View style={styles.transformationSlideBadge}>
                              <Text style={styles.transformationSlideBadgeText}>
                                1. BEFORE
                              </Text>
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => handleRemoveMedia(0)}
                            style={styles.removeMediaButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="close" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <>
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
                            scrollEnabled={true}
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
                                {contentType === "transformation" && (index === 0 || index === 1) && (
                                  <View style={styles.transformationSlideBadge}>
                                    <Text style={styles.transformationSlideBadgeText}>
                                      {index === 0 ? "1. BEFORE" : "2. AFTER"}
                                    </Text>
                                  </View>
                                )}
                                <TouchableOpacity
                                  onPress={() => handleRemoveMedia(index)}
                                  style={styles.removeMediaButton}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                  <Ionicons name="close" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
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
                        </>
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
                            size={20}
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

                {/* Android UGC Policy notice */}
                <View style={styles.policyNotice}>
                  <Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.secondPrimary} />
                  <Text style={styles.policyNoticeText}>
                    Community Standards: Iness is a positive fitness space. Offensive, harassing, or sexually explicit content is prohibited and subject to immediate removal.
                  </Text>
                </View>
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
                    size={18}
                    color={theme.colors.dark}
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
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
});

CustomPostModal.displayName = "CustomPostModal";

export default CustomPostModal;

const getStyles = (theme: any) => StyleSheet.create({
  featureSection: {
    marginBottom: 18,
  },
  featureTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.regularSmall,
    marginBottom: 10,
  },
  featureChips: {
    gap: 8,
    paddingRight: 16,
  },
  featureChip: {
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  featureChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  featureChipText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.small,
  },
  featureChipTextActive: {
    color: theme.colors.dark,
    fontFamily: theme.fonts.bold,
  },
  pollEditor: { gap: 8, marginTop: 12 },
  detailEditor: { gap: 8, marginTop: 12 },
  pollInput: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addPollOption: { alignItems: "center", flexDirection: "row", gap: 6, paddingVertical: 6 },
  addPollOptionText: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.medium },
  helperCard: { alignItems: "flex-start", backgroundColor: theme.colors.backgroundCardLight, borderRadius: 12, flexDirection: "row", gap: 9, marginTop: 12, padding: 12 },
  helperText: { color: theme.colors.textSecondary, flex: 1, fontFamily: theme.fonts.regular, fontSize: 11, lineHeight: 16 },
  hashtagInput: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
    marginTop: 12,
    paddingTop: 12,
  },
  settingsCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
    padding: 14,
  },
  segmentedRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  scheduleRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  scheduleChip: { alignItems: "center", borderColor: theme.colors.border, borderRadius: 11, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 10, paddingVertical: 8 },
  scheduleChipActive: { backgroundColor: theme.colors.backgroundCardLight, borderColor: theme.colors.secondPrimary },
  scheduleText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, fontSize: 10 },
  scheduleTextActive: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold },
  segment: {
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 9,
  },
  segmentActive: { backgroundColor: theme.colors.backgroundCardLight, borderColor: theme.colors.secondPrimary },
  segmentText: { color: theme.colors.textMuted, fontFamily: theme.fonts.medium, fontSize: 10 },
  segmentTextActive: { color: theme.colors.secondPrimary },
  settingRow: {
    alignItems: "center",
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
  },
  settingLabel: { color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: theme.fontSizes.small },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  backdropArea: {
    flex: 1,
    width: "100%",
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 18,
    height: "92%",
    maxHeight: "94%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    display: "flex",
    flexDirection: "column",
  },
  handleBar: {
    width: 38,
    height: 4,
    backgroundColor: theme.colors.divider,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
    textAlign: "center",
  },
  topShareButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  topShareButtonDisabled: {
    opacity: 0.35,
  },
  topShareButtonText: {
    color: theme.colors.dark,
    fontFamily: theme.fonts.bold,
    fontSize: 13,
  },
  topShareButtonTextDisabled: {
    color: theme.colors.dark,
  },
  quickTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
    marginTop: 8,
  },
  quickTagChip: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  quickTagText: {
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
    fontSize: 11,
  },
  transformationSlideBadge: {
    backgroundColor: "rgba(0,0,0,0.72)",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    borderWidth: 1,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    position: "absolute",
    top: 12,
  },
  transformationSlideBadgeText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  policyNotice: {
    alignItems: "center",
    backgroundColor: theme.colors.backgroundCardLight,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    padding: 10,
  },
  policyNoticeText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonSelected: {
    borderWidth: 1.5,
    borderColor: theme.colors.secondPrimary,
    backgroundColor: theme.colors.backgroundCardLight,
  },
  optionIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  optionIconContainerSelected: {
    backgroundColor: theme.colors.background,
  },
  optionButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.medium,
  },
  optionButtonTextSelected: {
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
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
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 14,
    padding: 14,
    textAlignVertical: "top",
    fontSize: theme.fontSizes.regular,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 110,
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
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: "relative",
    alignSelf: "center",
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
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
    marginTop: 4,
    marginBottom: 12,
  },
  mediaActionGroupSplit: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondPrimary,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 24,
    justifyContent: "center",
  },
  secondaryUploadButton: {
    flex: 1,
  },
  uploadButtonText: {
    color: theme.colors.textWhite,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
    marginLeft: 8,
    fontSize: theme.fontSizes.regularSmall,
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
    backgroundColor: theme.colors.secondPrimary,
    borderColor: theme.colors.secondPrimary,
  },
  videoToolButtonSecondary: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.secondPrimary,
  },
  editVideoButton: {
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.secondPrimary,
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
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
    backgroundColor: theme.colors.secondPrimary,
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 13,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 24,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.regularSmall,
  },
  postButton: {
    paddingVertical: 13,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    flex: 1.3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.4,
  },
  postButtonText: {
    color: theme.colors.dark,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
    fontSize: theme.fontSizes.regularSmall,
  },
});
