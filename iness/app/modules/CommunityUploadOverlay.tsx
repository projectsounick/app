import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CommunityDraftMediaItem,
  CommunityUploadJob,
} from "@/app/interfaces/communityComposer";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

type CommunityUploadOverlayProps = {
  jobs: CommunityUploadJob[];
  onRetry: (jobId: string) => void;
  onDismiss: (jobId: string) => void;
};

const getUploadPresentation = (job: CommunityUploadJob) => {
  const isVideo = job.draft.type === "video";
  const isPhoto = job.draft.type === "image";
  const hasUploadedMedia = (job.uploadedUrls?.length || 0) > 0;

  switch (job.status) {
    case "queued":
      return {
        badge: "Queued",
        title: isVideo
          ? "Your clip is next"
          : isPhoto
            ? "Your photos are next"
            : "Your post is queued",
        meta: "Keep browsing. We will start this automatically.",
      };
    case "uploading":
      return {
        badge: "Uploading",
        title: isVideo
          ? "Sending your clip"
          : isPhoto
            ? "Uploading your photos"
            : "Uploading your post",
        meta: isVideo
          ? "The original video is on its way. You can keep browsing."
          : "Your post is uploading in the background.",
      };
    case "creating":
      return {
        badge: "Finishing",
        title: isVideo ? "Publishing your clip" : "Publishing your post",
        meta: isVideo
          ? "Post is being created and optimization starts next."
          : "Almost there. Wrapping up the post now.",
      };
    case "completed":
      return {
        badge: "Posted",
        title: isVideo ? "Your clip is posted" : "Your post is live",
        meta: isVideo
          ? "Playback optimization will keep running in the background."
          : "Ready in the feed.",
      };
    case "failed":
      return {
        badge: "Needs Retry",
        title: isVideo ? "Your clip did not finish" : "Your post did not finish",
        meta:
          job.error ||
          (hasUploadedMedia
            ? "Upload finished, but publishing did not complete."
            : "Check your connection and try again."),
      };
    default:
      return {
        badge: "Working",
        title: "Finishing your post",
        meta: "Please give it a moment.",
      };
  }
};

const getPrimaryJob = (jobs: CommunityUploadJob[]) => {
  const priorityOrder: CommunityUploadJob["status"][] = [
    "uploading",
    "creating",
    "queued",
    "failed",
    "completed",
  ];

  for (const status of priorityOrder) {
    const match = jobs.find((job) => job.status === status);
    if (match) {
      return match;
    }
  }

  return jobs[jobs.length - 1] || null;
};

const renderMediaPreview = (
  media: CommunityDraftMediaItem | undefined,
  styles: ReturnType<typeof getStyles>
) => {
  if (!media) {
    return (
      <View style={[styles.previewFallback, styles.previewFallbackText]}>
        <Ionicons name="document-text-outline" size={26} color="#FFFFFF" />
      </View>
    );
  }

  if (media.kind === "image") {
    return (
      <Image
        source={{ uri: media.previewUri || media.uri }}
        style={styles.previewImage}
      />
    );
  }

  if (media.previewUri) {
    return (
      <View style={styles.previewVideoWrapper}>
        <Image source={{ uri: media.previewUri }} style={styles.previewImage} />
        <View style={styles.videoBadge}>
          <Ionicons name="videocam" size={14} color="#FFFFFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.previewFallback, styles.previewFallbackVideo]}>
      <Ionicons name="videocam" size={20} color="#FFFFFF" />
      <View style={styles.videoBadge}>
        <Ionicons name="videocam" size={14} color="#FFFFFF" />
      </View>
    </View>
  );
};

const CommunityUploadOverlay = ({
  jobs,
  onRetry,
  onDismiss,
}: CommunityUploadOverlayProps) => {
  const theme = useGlobalTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const primaryJob = getPrimaryJob(jobs);

  if (!primaryJob) {
    return null;
  }

  const queuedCount = jobs.filter(
    (job) => job.status === "queued" && job.id !== primaryJob.id
  ).length;
  const previewMedia = primaryJob.draft.media[0];
  const caption = primaryJob.draft.text?.trim();
  const presentation = getUploadPresentation(primaryJob);
  const canDismiss =
    primaryJob.status === "completed" || primaryJob.status === "failed";
  const progressLabel =
    primaryJob.status === "uploading" || primaryJob.status === "creating"
      ? `${primaryJob.progress}%`
      : null;
  const pillStyles =
    primaryJob.status === "failed"
      ? {
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
        }
      : primaryJob.status === "completed"
        ? {
            backgroundColor: theme.colors.success,
            borderColor: theme.colors.success,
          }
        : primaryJob.status === "queued"
          ? {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
            }
          : {
              backgroundColor: theme.colors.backgroundCardLight,
              borderColor: theme.colors.border,
            };
  const pillTextColor =
    primaryJob.status === "completed" || primaryJob.status === "failed"
      ? theme.colors.textWhite
      : primaryJob.status === "queued"
        ? theme.colors.textSecondary
        : theme.colors.secondPrimary;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlayContainer,
        { bottom: Math.max(insets.bottom + 16, 28) },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.previewSlot}>
          {renderMediaPreview(previewMedia, styles)}
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={[styles.statusPill, pillStyles]}>
              <Text style={[styles.statusPillText, { color: pillTextColor }]}>
                {presentation.badge}
              </Text>
            </View>

            {canDismiss ? (
              <TouchableOpacity
                onPress={() => onDismiss(primaryJob.id)}
                style={styles.dismissButton}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            ) : progressLabel ? (
              <Text style={styles.progressValue}>{progressLabel}</Text>
            ) : null}
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {presentation.title}
          </Text>

          {caption ? (
            <Text style={styles.caption} numberOfLines={2}>
              {caption}
            </Text>
          ) : (
            <Text style={styles.captionMuted} numberOfLines={1}>
              {primaryJob.draft.type === "text"
                ? "Text post"
                : primaryJob.draft.type === "video"
                  ? "Video post"
                  : "Photo post"}
            </Text>
          )}

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, primaryJob.progress))}%`,
                  backgroundColor:
                    primaryJob.status === "failed"
                      ? theme.colors.error
                      : theme.colors.success,
                },
              ]}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.metaText}>
              {presentation.meta}
            </Text>

            {primaryJob.status === "failed" ? (
              <TouchableOpacity
                onPress={() => onRetry(primaryJob.id)}
                style={styles.retryButton}
              >
                <Ionicons
                  name="refresh"
                  size={14}
                  color={theme.colors.textWhite}
                />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {queuedCount > 0 ? (
            <Text style={styles.queueCount}>
              {queuedCount} more {queuedCount === 1 ? "post" : "posts"} in line
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default CommunityUploadOverlay;

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlayContainer: {
      left: 16,
      position: "absolute",
      right: 16,
      zIndex: 40,
    },
    card: {
      alignItems: "center",
      backgroundColor: theme.colors.backgroundCard,
      borderColor: theme.colors.border,
      borderRadius: 20,
      borderWidth: 1,
      elevation: 10,
      flexDirection: "row",
      padding: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
    },
    previewSlot: {
      borderRadius: 14,
      height: 72,
      marginRight: 12,
      overflow: "hidden",
      width: 72,
    },
    previewImage: {
      backgroundColor: theme.colors.backgroundSecondary,
      height: "100%",
      width: "100%",
    },
    previewFallback: {
      alignItems: "center",
      backgroundColor: theme.colors.secondPrimary,
      borderRadius: 14,
      height: "100%",
      justifyContent: "center",
      width: "100%",
    },
    previewFallbackText: {
      backgroundColor: theme.colors.primary,
    },
    previewFallbackVideo: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    previewVideoWrapper: {
      flex: 1,
    },
    videoBadge: {
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.55)",
      borderRadius: 12,
      bottom: 6,
      justifyContent: "center",
      paddingHorizontal: 7,
      paddingVertical: 4,
      position: "absolute",
      right: 6,
    },
    content: {
      flex: 1,
    },
    topRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      justifyContent: "space-between",
    },
    statusPill: {
      alignItems: "center",
      borderRadius: 999,
      borderWidth: 1,
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statusPillText: {
      fontFamily: theme.fonts.bold,
      fontSize: theme.fontSizes.small,
    },
    progressValue: {
      color: theme.colors.textMuted,
      fontFamily: theme.fonts.bold,
      fontSize: theme.fontSizes.small,
    },
    title: {
      color: theme.colors.text,
      flex: 1,
      fontFamily: theme.fonts.bold,
      fontSize: theme.fontSizes.regular,
      marginTop: 8,
    },
    dismissButton: {
      alignItems: "center",
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 12,
      height: 24,
      justifyContent: "center",
      width: 24,
    },
    caption: {
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.regular,
      fontSize: theme.fontSizes.small,
      marginTop: 2,
    },
    captionMuted: {
      color: theme.colors.textMuted,
      fontFamily: theme.fonts.medium,
      fontSize: theme.fontSizes.small,
      marginTop: 3,
    },
    progressTrack: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 999,
      height: 6,
      marginTop: 10,
      overflow: "hidden",
      width: "100%",
    },
    progressFill: {
      borderRadius: 999,
      height: "100%",
    },
    footerRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    metaText: {
      color: theme.colors.textMuted,
      flex: 1,
      fontFamily: theme.fonts.medium,
      fontSize: theme.fontSizes.small,
      paddingRight: 8,
    },
    retryButton: {
      alignItems: "center",
      backgroundColor: theme.colors.secondPrimary,
      borderRadius: 999,
      flexDirection: "row",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    retryButtonText: {
      color: theme.colors.textWhite,
      fontFamily: theme.fonts.bold,
      fontSize: theme.fontSizes.small,
    },
    queueCount: {
      color: theme.colors.textMuted,
      fontFamily: theme.fonts.medium,
      fontSize: theme.fontSizes.small,
      marginTop: 6,
    },
  });
