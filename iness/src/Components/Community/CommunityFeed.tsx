import React, { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Alert,
  Share,
  Platform,
  ImageBackground,
  Modal,
  ScrollView,
  Animated,
  RefreshControl,
  PanResponder,
} from "react-native";
let _commentLanguageFilter: any = null;
const getCommentLanguageFilter = () => {
  if (!_commentLanguageFilter) {
    const { Filter } = require("bad-words");
    _commentLanguageFilter = new Filter();
  }
  return _commentLanguageFilter;
};
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "@/src/modules/AppVideo";

import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { captureRef } from "react-native-view-shot";


import { communityService } from "@/src/services/community.service";
import { useFocusEffect } from "expo-router";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import ImageViewerModal from "@/src/Modals/ImageViewerModal";
import VideoViewerModal from "@/src/Modals/VideoViewerModal";
import MemberProfileModal, { MemberProfileData } from "@/src/Modals/MemberProfileModal";
import { safeRouter } from "@/src/utils/safeRouter";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/src/services/user.service";
import { Post } from "@/src/interfaces/communityService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  FeedFeatureHeader,
  FeedFilter,
  RichPostContent,
} from "./FeedFeatureLayer";

dayjs.extend(relativeTime);

const screenWidth = Dimensions.get("window").width;
const COMMENTS_PAGE_SIZE = 10;
const FEED_FRESHNESS_MS = 30 * 1000;
const FEED_VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 35 };
const COMMENT_REPORT_REASONS = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "threat_or_violence", label: "Threat or violence" },
  { value: "sexual_content", label: "Sexual content" },
  { value: "spam_or_scam", label: "Spam or scam" },
  { value: "personal_information", label: "Personal information" },
  { value: "child_safety", label: "Child safety" },
  { value: "other", label: "Something else" },
] as const;
const VIDEO_KEY_SEPARATOR = "::";
const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "mov",
  "m4v",
  "webm",
  "3gp",
  "mkv",
  "m3u8",
]);
const defaultFeedVideoState = {
  isPreparing: false,
  isBuffering: false,
  isPlaying: false,
};

const getMediaFileExtension = (value?: string | null) => {
  if (!value) return null;

  const cleanValue = value.split("?")[0]?.split("#")[0] ?? "";
  const match = cleanValue.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : null;
};

const isLikelyVideoSource = (value?: string | null) => {
  const extension = getMediaFileExtension(value);
  return (
    !!extension && VIDEO_EXTENSIONS.has(extension)
  ) || /\/video\//i.test(value ?? "") || /video/i.test(value ?? "");
};

const buildVideoKey = (postId: string, index: number) =>
  `${postId}${VIDEO_KEY_SEPARATOR}${index}`;

const getPostIdFromVideoKey = (videoKey: string) =>
  videoKey.split(VIDEO_KEY_SEPARATOR)[0] || null;

type FeedVideoPlayerProps = {
  videoKey: string;
  playbackUrl: string;
  posterUri?: string | null;
  isActive: boolean;
  showPreview: boolean;
  onActivate: (videoKey: string) => void;
  onDeactivate: (videoKey: string) => void;
  onExpand?: (url: string) => void;
  styles: any;
};

const FeedVideoPlayer = memo(function FeedVideoPlayer({
  videoKey,
  playbackUrl,
  posterUri,
  isActive,
  showPreview,
  onActivate,
  onDeactivate,
  onExpand,
  styles,
}: FeedVideoPlayerProps) {
  const [playbackState, setPlaybackState] = useState(defaultFeedVideoState);
  const [hasReadyFrame, setHasReadyFrame] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<any>(null);
  const shouldMountPlayer = isActive || showPreview;
  const videoFileExtension = getMediaFileExtension(playbackUrl);
  const previewResizeMode = isActive ? ResizeMode.CONTAIN : ResizeMode.COVER;

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleExpand = useCallback(async () => {
    try {
      if (videoRef.current?.enterFullscreen) {
        await videoRef.current.enterFullscreen();
      } else {
        onExpand?.(playbackUrl);
      }
    } catch {
      onExpand?.(playbackUrl);
    }
  }, [onExpand, playbackUrl]);

  const videoSource = useMemo(
    () => ({
      uri: playbackUrl,
      ...(videoFileExtension
        ? { overrideFileExtensionAndroid: videoFileExtension }
        : {}),
    }),
    [playbackUrl, videoFileExtension]
  );

  const updatePlaybackState = useCallback(
    (updates: Partial<typeof defaultFeedVideoState>) => {
      setPlaybackState((prev) => {
        const next = { ...prev, ...updates };

        if (
          prev.isPreparing === next.isPreparing &&
          prev.isBuffering === next.isBuffering &&
          prev.isPlaying === next.isPlaying
        ) {
          return prev;
        }

        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (!shouldMountPlayer) {
      setPlaybackState(defaultFeedVideoState);
      setHasReadyFrame(false);
      setIsPaused(false);
    }
  }, [shouldMountPlayer, playbackUrl, posterUri]);

  if (!shouldMountPlayer) {
    return (
      <Pressable
        style={styles.videoPlaceholder}
        onPress={() => onActivate(videoKey)}
      >
        {posterUri ? (
          <>
            <Image
              source={{ uri: posterUri }}
              style={[styles.videoPosterImage, styles.videoPosterImageCover]}
              resizeMode="cover"
            />
            <View style={styles.videoPosterScrim} />
          </>
        ) : null}
        <View style={styles.playButtonCircle}>
          <Ionicons name="play" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.videoPlaceholderText}>Tap to play video</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.activeVideoWrapper}>
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.mediaImage}
        resizeMode={previewResizeMode}
        usePoster={!!posterUri && !hasReadyFrame}
        posterSource={posterUri ? { uri: posterUri } : undefined}
        posterStyle={styles.videoPosterImageCover}
        useNativeControls={false}
        shouldPlay={isActive && !isPaused}
        isLooping={true}
        progressUpdateIntervalMillis={750}
        onLoadStart={() => {
          if (!hasReadyFrame) {
            updatePlaybackState({
              isPreparing: true,
              isBuffering: true,
              isPlaying: false,
            });
          }
        }}
        onLoad={() => {
          setHasReadyFrame(true);
          updatePlaybackState({
            isPreparing: false,
            isBuffering: false,
          });
        }}
        onReadyForDisplay={() => {
          setHasReadyFrame(true);
          updatePlaybackState({
            isPreparing: false,
            isBuffering: false,
          });
        }}
        onPlaybackStatusUpdate={(status) => {
          if (!status.isLoaded) {
            return;
          }

          if (status.positionMillis >= 0) {
            setHasReadyFrame(true);
          }

          updatePlaybackState({
            isPreparing: false,
            isBuffering: status.isBuffering,
            isPlaying: status.isPlaying,
          });

          if (status.didJustFinish && !status.isLooping) {
            onDeactivate(videoKey);
          }
        }}
        onError={(error) => {
          console.error("Feed video error:", error);
          updatePlaybackState({
            isPreparing: false,
            isBuffering: false,
            isPlaying: false,
          });
        }}
      />
      {isActive && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={togglePause}
        >
          {isPaused ? (
            <View style={styles.videoPlayOverlay}>
              <View style={styles.playButtonCircle}>
                <Ionicons name="play" size={44} color="#FFFFFF" />
              </View>
            </View>
          ) : null}

          {/* Floating On-Video Action Buttons */}
          <View style={styles.videoControlsBottomBar}>
            <TouchableOpacity
              style={styles.videoControlBtn}
              onPress={togglePause}
              accessibilityRole="button"
              accessibilityLabel={isPaused ? "Play video" : "Pause video"}
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.videoControlBtn}
              onPress={handleExpand}
              accessibilityRole="button"
              accessibilityLabel="Expand video fullscreen"
            >
              <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
      {!isActive && (
        <Pressable
          style={styles.videoPreviewTapTarget}
          onPress={() => onActivate(videoKey)}
        >
          {!hasReadyFrame && (
            <View style={styles.videoPreviewLoadingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.videoPreviewLoadingText}>
                Preparing preview...
              </Text>
            </View>
          )}
          <View style={styles.videoPlayOverlay}>
            <View style={styles.playButtonCircle}>
              <Ionicons name="play" size={48} color="#FFFFFF" />
            </View>
          </View>
        </Pressable>
      )}
      {isActive && !hasReadyFrame && (playbackState.isPreparing || playbackState.isBuffering) && (
        <View style={styles.videoBufferingOverlay}>
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.bufferingText}>Loading video...</Text>
          </View>
        </View>
      )}
      {isActive && hasReadyFrame && playbackState.isBuffering && (
        <View style={styles.videoPlaybackBufferIndicator}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      )}
    </View>
  );
});

export const FEED_REACTIONS = [
  { id: "heart", emoji: "❤️", label: "Love", color: "#FF3040" },
  { id: "fire", emoji: "🔥", label: "Fire", color: "#FF7A00" },
  { id: "strong", emoji: "💪", label: "Strong", color: "#9747FF" },
  { id: "clap", emoji: "👏", label: "Clap", color: "#FFD700" },
  { id: "energy", emoji: "⚡", label: "Energy", color: "#00E5FF" },
] as const;

export const getWorkoutStats = (post: any) => {
  const metadata = post?.metadata || {};
  const stats: Array<{ icon: string; label: string; value: string; color: string }> = [];

  const duration = metadata.duration || metadata.workoutDuration || metadata.time;
  if (duration) {
    const val = String(duration);
    stats.push({
      icon: "time-outline",
      label: "Time",
      value: val.includes("m") || val.includes("min") ? val : `${val}m`,
      color: "#00E5FF",
    });
  }

  const calories = metadata.calories || metadata.burnedCalories || metadata.kcal;
  if (calories) {
    const val = String(calories);
    stats.push({
      icon: "flame",
      label: "Burn",
      value: val.toLowerCase().includes("kcal") ? val : `${val} kcal`,
      color: "#FF7A00",
    });
  }

  const distanceOrSteps =
    metadata.steps ||
    metadata.distance ||
    (metadata.metric && metadata.change ? `${metadata.metric}: ${metadata.change}` : metadata.metric);
  if (distanceOrSteps) {
    const isSteps = /step/i.test(String(distanceOrSteps));
    stats.push({
      icon: isSteps ? "footsteps" : "speedometer-outline",
      label: isSteps ? "Steps" : "Distance",
      value: String(distanceOrSteps),
      color: "#10B981",
    });
  }

  const streakOrIntensity = metadata.streak ? `${metadata.streak}d streak` : metadata.intensity;
  if (streakOrIntensity) {
    stats.push({
      icon: "flash",
      label: metadata.streak ? "Streak" : "Intensity",
      value: String(streakOrIntensity),
      color: "#FFD700",
    });
  }

  return stats;
};

type BeforeAfterSplitSliderProps = {
  beforeUri: string;
  afterUri: string;
  beforeLabel?: string;
  afterLabel?: string;
  onDoubleTap?: () => void;
  styles: any;
};

const BeforeAfterSplitSlider = memo(function BeforeAfterSplitSlider({
  beforeUri,
  afterUri,
  beforeLabel,
  afterLabel,
  onDoubleTap,
  styles,
}: BeforeAfterSplitSliderProps) {
  const [sliderX, setSliderX] = useState(screenWidth * 0.5);
  const sliderWidth = screenWidth;
  const sliderHeight = Math.round(screenWidth * 1.15);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 2,
        onPanResponderGrant: () => {
          try {
            void Haptics.selectionAsync();
          } catch {}
        },
        onPanResponderMove: (evt) => {
          const x = evt.nativeEvent.locationX;
          const clamped = Math.max(20, Math.min(sliderWidth - 20, x));
          setSliderX(clamped);
        },
      }),
    [sliderWidth]
  );

  return (
    <Pressable onPress={onDoubleTap} style={[styles.beforeAfterWrapper, { height: sliderHeight }]}>
      {/* Background layer: AFTER Image */}
      <Image
        source={{ uri: afterUri }}
        style={[styles.beforeAfterBaseImage, { width: sliderWidth, height: sliderHeight }]}
        resizeMode="cover"
      />

      {/* Foreground clipped layer: BEFORE Image */}
      <View
        style={[
          styles.beforeClippedOverlay,
          { width: sliderX, height: sliderHeight },
        ]}
      >
        <Image
          source={{ uri: beforeUri }}
          style={[styles.beforeAfterBaseImage, { width: sliderWidth, height: sliderHeight }]}
          resizeMode="cover"
        />
      </View>

      {/* Interactive Divider Bar & Handle */}
      <View
        style={[styles.beforeAfterDividerBar, { left: sliderX - 18, height: sliderHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.beforeAfterDividerLine} />
        <View style={styles.beforeAfterHandlePill}>
          <Ionicons name="swap-horizontal" size={17} color="#FFFFFF" />
        </View>
      </View>

      {/* Floating Labels */}
      <View style={styles.beforeBadgePill} pointerEvents="none">
        <Text style={styles.beforeBadgePillText}>{beforeLabel || "BEFORE"}</Text>
      </View>
      <View style={styles.afterBadgePill} pointerEvents="none">
        <Text style={styles.afterBadgePillText}>{afterLabel || "AFTER"}</Text>
      </View>

      {/* Helper drag prompt */}
      <View style={styles.beforeAfterHintContainer} pointerEvents="none">
        <Text style={styles.beforeAfterHintText}>◀ Drag to compare ▶</Text>
      </View>
    </Pressable>
  );
});


const CommunityPosts = ({
  communityId,
  posts,
  communityName,
  setPosts,
  onCreatePost,
}: {
  communityId: string;
  communityName: string;
  posts: any[];
  setPosts: any;
  onCreatePost?: () => void;
}) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const isFetchingPage1Ref = useRef(false);
  const fetchRequestIdRef = useRef(0);
  const feedSearchQueryRef = useRef("");
  const isSearchMountedRef = useRef(false);
  const [visibleComments, setVisibleComments] = useState<
    Record<string, boolean>
  >({});
  const [deleteloading, setDeleteLoading] = useState<any>({
    _id: null,
    loading: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentsPagination, setCommentsPagination] = useState<
    Record<string, { page: number; hasMore: boolean; loading: boolean }>
  >({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [likeLoadingMap, setLikeLoadingMap] = useState<Record<string, boolean>>(
    {}
  );
  const [commentSubmittingMap, setCommentSubmittingMap] = useState<
    Record<string, boolean>
  >({});
  const [commentAction, setCommentAction] = useState<{
    postId: string;
    comment: any;
  } | null>(null);
  const [commentReport, setCommentReport] = useState<{
    postId: string;
    comment: any;
    targetType: "comment" | "user";
  } | null>(null);
  const [commentReportReason, setCommentReportReason] = useState("");
  const [commentReportDetails, setCommentReportDetails] = useState("");
  const [commentActionLoading, setCommentActionLoading] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState<
    Record<string, number>
  >({});
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);
  const [visiblePostIds, setVisiblePostIds] = useState<Record<string, boolean>>(
    {}
  );
  const [revealedSensitivePostIds, setRevealedSensitivePostIds] = useState<Record<string, boolean>>({});
  const [showMenuForPost, setShowMenuForPost] = useState<string | null>(null);
  const [showTooltipForPost, setShowTooltipForPost] = useState<string | null>(
    null
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState("All Posts"); // default
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("explore");
  const [feedSort, setFeedSort] = useState<"latest" | "trending" | "top_streaks">("latest");
  const [achievementPosting, setAchievementPosting] = useState(false);
  const [feedSearchQuery, setFeedSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [sharePostText, setSharePostText] = useState<string>("");
  const [sharePostItem, setSharePostItem] = useState<any>(null);
  const [saveTarget, setSaveTarget] = useState<Post | null>(null);
  const [customCollection, setCustomCollection] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(
    null
  );
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<MemberProfileData | null>(null);
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);
  const [transformationMode, setTransformationMode] = useState<Record<string, "slider" | "carousel">>({});
  const reactionAnim = useRef(new Animated.Value(0)).current;

  const handleLongPressLike = useCallback((postId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setActiveReactionPostId(postId);
    reactionAnim.setValue(0);
    Animated.spring(reactionAnim, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [reactionAnim]);

  const handleUserPress = useCallback((user: any) => {
    if (!user) return;
    const targetUserId = String(user.userId || user._id || "");
    if (!targetUserId) return;
    if (currentUserId && targetUserId === currentUserId) {
      safeRouter.navigate("/dashboard/profile");
    } else {
      setSelectedMemberProfile({
        userId: targetUserId,
        name: user.name || "Member",
        profilePic: user.profilePic || null,
        role: user.role || "Community Member",
        isVerified: !!user.isVerified,
        totalStreak:
          typeof user.totalStreak === "number"
            ? user.totalStreak
            : typeof user.metadata?.streak === "number"
            ? user.metadata.streak
            : 0,
      });
    }
  }, [currentUserId]);
  const sharePreviewRef = useRef<View>(null);
  const trackedImpressionIdsRef = useRef<Set<string>>(new Set());
  const lastSuccessfulFetchRef = useRef<{ scope: string; at: number } | null>(
    null
  );
  const [heartPopPostId, setHeartPopPostId] = useState<string | null>(null);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const lastTapMap = useRef<Record<string, number>>({});
  const mediaListRefs = useRef<Record<string, any>>({});

  const triggerHeartPop = useCallback((postId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics optional on unsupported devices
    }
    setHeartPopPostId(postId);
    heartScale.setValue(0.3);
    heartOpacity.setValue(1);
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1.25,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 700,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setHeartPopPostId(null);
    });
  }, [heartOpacity, heartScale]);

  const handleToggleLikeRef = useRef<(post: Post) => void>(() => {});

  const handleMediaDoubleTap = useCallback((post: Post) => {
    const postId = post._id || "";
    const now = Date.now();
    const lastTap = lastTapMap.current[postId] || 0;
    if (now - lastTap < 350) {
      triggerHeartPop(postId);
      if (!post.likedByUser) {
        handleToggleLikeRef.current(post);
      }
      lastTapMap.current[postId] = 0;
    } else {
      lastTapMap.current[postId] = now;
    }
  }, [triggerHeartPop]);

  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDark), [theme, isDark]);
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    const nextVisiblePostIds: Record<string, boolean> = {};

    viewableItems.forEach(({ item }: any) => {
      if (item?._id) {
        nextVisiblePostIds[item._id] = true;
        if (!trackedImpressionIdsRef.current.has(item._id)) {
          trackedImpressionIdsRef.current.add(item._id);
          void communityService.trackEngagement({ targetType: "post", targetId: item._id, kind: "impression", source: "community_feed" }).catch(() => undefined);
        }
      }
    });

    setVisiblePostIds((previousVisiblePostIds) => {
      const previousIds = Object.keys(previousVisiblePostIds);
      const nextIds = Object.keys(nextVisiblePostIds);
      const unchanged =
        previousIds.length === nextIds.length &&
        nextIds.every((postId) => previousVisiblePostIds[postId]);

      return unchanged ? previousVisiblePostIds : nextVisiblePostIds;
    });
    setActiveVideoKey((currentVideoKey) => {
      if (!currentVideoKey) {
        return currentVideoKey;
      }

      const postId = getPostIdFromVideoKey(currentVideoKey);
      return postId && nextVisiblePostIds[postId] ? currentVideoKey : null;
    });
  }, []);

  const deactivateVideo = useCallback((finishedVideoKey: string) => {
    setActiveVideoKey((currentKey) =>
      currentKey === finishedVideoKey ? null : currentKey
    );
  }, []);

  const options = ["All Posts", "My Posts"];

  const handleSelect = (option: string) => {
    setSelected(option);
    setOpen(false);
  };
  const [toolTipActionType, setToolTipActionType] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);
  async function handleDelete(_id: any) {
    try {
      setShowMenuForPost(null);
      setDeleteConfirmPostId(null);
      setDeleteLoading({ _id: _id, loading: true });
      const response = await communityService.deletePost(_id);

      if (response.success) {
        setPosts((prevPosts: any[]) =>
          prevPosts.filter((post) => post._id !== _id)
        );
      } else {
        alert("Unable to delete the post");
      }
    } catch (error) {
      alert("Unable to delete the post");
    } finally {
      setDeleteLoading({ _id: null, loading: false });
    }
  }

  const fetchPosts = useCallback(
    async (
      pageToFetch: number = 1,
      append: boolean = false,
      searchParam?: string
    ) => {
      const currentRequestId = ++fetchRequestIdRef.current;
      try {
        if (!communityId) {
          setPosts([]);
          setHasMore(false);
          setPage(1);
          return;
        }

        if (append) {
          setLoadingMore(true);
        } else {
          isFetchingPage1Ref.current = true;
          setIsLoading(true);
        }

        let allPost = showMyPosts ? false : true;
        const queryToUse =
          typeof searchParam === "string"
            ? searchParam
            : feedSearchQueryRef.current;
        const response = await communityService.getCommunityPosts(
          communityId,
          pageToFetch,
          10,
          allPost,
          queryToUse ? queryToUse.trim() : undefined,
          feedSort
        );

        if (currentRequestId !== fetchRequestIdRef.current && !append) {
          // A newer refresh/fetch superseded this request; avoid overriding with stale data
          return;
        }

        if (response && response.success) {
          const incomingData = Array.isArray(response.data) ? response.data : [];
          if (append) {
            setPosts((prev: any[]) => {
              const seenPostIds = new Set<string>();
              return [...prev, ...incomingData].filter((post) => {
                if (seenPostIds.has(post._id)) return false;
                seenPostIds.add(post._id);
                return true;
              });
            });
          } else {
            setPosts(incomingData);
            lastSuccessfulFetchRef.current = {
              scope: `${communityId}:${showMyPosts}:${queryToUse || ""}:${feedSort}`,
              at: Date.now(),
            };
          }
          const totalPages = response.pagination?.totalPages;
          const returnedLength = incomingData.length;
          const hasNextPage =
            typeof totalPages === "number" && totalPages > 0
              ? pageToFetch < totalPages
              : returnedLength >= 10;
          setHasMore(hasNextPage);
          setPage(pageToFetch);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        if (!append) {
          isFetchingPage1Ref.current = false;
        }
        setIsLoading(false);
        setLoadingMore(false);
        isLoadingMoreRef.current = false;
      }
    },
    [communityId, showMyPosts, setPosts, feedSort]
  );

  const handleQuickShareAchievement = useCallback(async (preset: any) => {
    if (!communityId || achievementPosting) return;
    setAchievementPosting(true);
    try {
      const response = await communityService.createPost({
        communityId,
        type: "text",
        contentType: "achievement",
        text: preset.text,
        metadata: {
          metric: preset.metric,
          value: preset.value,
          unit: preset.unit,
          badge: preset.badge,
          highlight: preset.title,
          streak: preset.metric === "streak" ? Number(preset.value) : 1,
        },
        commentsEnabled: true,
        sharingEnabled: true,
        isApproved: true,
        isActive: true,
        createdBy: currentUserId,
      } as any);

      if (response && (response.success || (response as any).status === "success")) {
        try {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // ignore
        }
        Alert.alert("Achievement Shared! 🎉", "Your win is now posted on the community feed!");
        await fetchPosts(1, false);
      } else {
        Alert.alert("Unable to share", (response as any)?.message || "Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error sharing achievement", err?.message || "Please try again.");
    } finally {
      setAchievementPosting(false);
    }
  }, [communityId, achievementPosting, currentUserId, fetchPosts]);

  useEffect(() => {
    feedSearchQueryRef.current = feedSearchQuery;
  }, [feedSearchQuery]);

  useEffect(() => {
    if (!isSearchMountedRef.current) {
      isSearchMountedRef.current = true;
      return;
    }
    if (!communityId) return;

    const timer = setTimeout(() => {
      fetchPosts(1, false, feedSearchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [feedSearchQuery, communityId, fetchPosts]);

  useEffect(() => {
    setCommentsMap({});
    setCommentsPagination({});
    setVisibleComments({});
    setNewComments({});
    setCommentAction(null);
    setCommentReport(null);
    setActiveVideoKey(null);
    setVisiblePostIds({});
    setPage(1);
    setHasMore(true);
    lastSuccessfulFetchRef.current = null;
  }, [communityId]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const userResponse =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      setCurrentUserId(userResponse.exists ? userResponse.data?._id ?? null : null);
    };

    loadCurrentUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!communityId) {
        setPosts([]);
        setIsLoading(false);
        return () => {
          setActiveVideoKey(null);
        };
      }

      const fetchScope = `${communityId}:${showMyPosts}:${feedSearchQueryRef.current || ""}:${feedSort}`;
      const lastFetch = lastSuccessfulFetchRef.current;
      const hasFreshData =
        lastFetch?.scope === fetchScope &&
        Date.now() - lastFetch.at < FEED_FRESHNESS_MS;

      if (hasFreshData) {
        return () => {
          setActiveVideoKey(null);
        };
      }

      fetchPosts(1, false);
      return () => {
        setActiveVideoKey(null);
      };
    }, [communityId, showMyPosts, fetchPosts, setPosts, feedSort])
  );

  const postsRef = useRef(posts);
  postsRef.current = posts;

  // Poll for background video optimization completion
  useEffect(() => {
    if (!communityId) return;

    const pollTimer = setInterval(async () => {
      const currentPosts = postsRef.current;
      const hasPendingVideo = currentPosts.some(
        (p: any) =>
          p?.type === "video" &&
          p?.processingStatus !== "ready" &&
          p?.processingStatus !== "failed"
      );

      if (!hasPendingVideo) return;

      try {
        const allPost = showMyPosts ? false : true;
        const response = await communityService.getCommunityPosts(
          communityId,
          1,
          10,
          allPost
        );

        if (response?.success && Array.isArray(response.data)) {
          setPosts((prevPosts: any[]) => {
            const updatedMap = new Map<string, any>(
              response.data.map((p: any) => [p._id, p])
            );
            return prevPosts.map((existingPost: any) => {
              const fresh = updatedMap.get(existingPost._id);
              if (!fresh) return existingPost;
              return {
                ...existingPost,
                ...fresh,
                localMediaUri: existingPost.localMediaUri,
                previewImage: fresh.previewImage || existingPost.previewImage,
              };
            });
          });
        }
      } catch {
        // silent polling error
      }
    }, 4000);

    return () => clearInterval(pollTimer);
  }, [communityId, showMyPosts, setPosts]);


  const loadMorePosts = useCallback(() => {
    if (
      isLoadingMoreRef.current ||
      loadingMore ||
      !hasMore ||
      isLoading ||
      isFetchingPage1Ref.current ||
      posts.length === 0
    ) {
      return;
    }
    isLoadingMoreRef.current = true;
    fetchPosts(page + 1, true, feedSearchQueryRef.current);
  }, [page, hasMore, loadingMore, isLoading, fetchPosts, posts.length]);

  const handleEndReached = useCallback(() => {
    if (
      !hasMore ||
      isLoading ||
      loadingMore ||
      isLoadingMoreRef.current ||
      isFetchingPage1Ref.current ||
      posts.length === 0
    ) {
      return;
    }
    loadMorePosts();
  }, [hasMore, isLoading, loadingMore, loadMorePosts, posts.length]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchPosts(1, false, feedSearchQueryRef.current);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPosts]);
  async function toolTipAction(postDetails: any, type: string) {
    try {
      if (type === "complain") {
        setShowTooltipForPost(postDetails._id);

        let complainerId;
        setToolTipActionType(type);
        let loggedUser =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (loggedUser.exists) {
          complainerId = loggedUser.data._id;
        }
        if (!postDetails?.createdBy?._id) {
          throw new Error("Post owner is unavailable");
        }
        const response = await userService.addUserComplain({
          complainType: "feed",
          complainedId: postDetails.createdBy._id,
          complainerId: complainerId,
          postId: postDetails._id,
        });
        if (!response?.success) {
          throw new Error(response?.message || "Unable to submit complaint");
        }
        setShowTooltipForPost(null);
        alert("Your complaint has been received. We will review it.");
        setShowMenuForPost(null);
      } else {
        setBlockLoading(true);

        if (!postDetails?.createdBy?._id) {
          throw new Error("Post owner is unavailable");
        } else {
          //// Blocking the user -------------------------/
          setShowTooltipForPost(postDetails._id);
          let response = await userService.blockUser({
            blockedUserId: postDetails.createdBy._id || null,
          });
          if (!response?.success) {
            throw new Error(response?.message || "Unable to block this user");
          }

          setShowTooltipForPost(null);
          alert("You have successfully blocked this user");
          setBlockLoading(false);
          setShowMenuForPost(null);
          fetchPosts(page);
        }
      }

      return;
    } catch (error) {
      setShowTooltipForPost(null);
      alert(
        type === "complain"
          ? "Unable to submit your complaint. Please try again."
          : "Unable to block this user. Please try again."
      );
      setShowMenuForPost(null);
    } finally {
      setBlockLoading(false);
    }
  }

  const fetchComments = async (
    postId: string,
    pageToFetch: number = 1,
    append: boolean = false
  ) => {
    try {
      setCommentsPagination((prev) => ({
        ...prev,
        [postId]: {
          page: prev[postId]?.page || 0,
          hasMore: prev[postId]?.hasMore ?? false,
          loading: true,
        },
      }));

      const response = await communityService.getPostComment(
        postId,
        pageToFetch,
        COMMENTS_PAGE_SIZE
      );
      if (response.success) {
        setCommentsMap((prev) => {
          const previousComments = append ? prev[postId] || [] : [];
          const nextComments = Array.isArray(response.data) ? response.data : [];
          const merged = [...previousComments, ...nextComments];
          const seenCommentIds = new Set<string>();

          return {
            ...prev,
            [postId]: merged.filter((comment) => {
              if (seenCommentIds.has(comment._id)) return false;
              seenCommentIds.add(comment._id);
              return true;
            }),
          };
        });

        const totalPages = response.pagination?.totalPages || 0;
        setCommentsPagination((prev) => ({
          ...prev,
          [postId]: {
            page: pageToFetch,
            hasMore: pageToFetch < totalPages,
            loading: false,
          },
        }));
      } else {
        setCommentsPagination((prev) => ({
          ...prev,
          [postId]: {
            page: prev[postId]?.page || 0,
            hasMore: prev[postId]?.hasMore ?? false,
            loading: false,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      Alert.alert("Comments unavailable", "Please try loading the comments again.");
      setCommentsPagination((prev) => ({
        ...prev,
        [postId]: {
          page: prev[postId]?.page || 0,
          hasMore: prev[postId]?.hasMore ?? false,
          loading: false,
        },
      }));
    }
  };

  const openModal = (url: string, type: "image" | "video") => {
    setSelectedMedia({ url, type });
    setModalVisible(true);
  };
  const toggleCommentSection = async (postId: string) => {
    const isOpening = !visibleComments[postId];
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: isOpening,
    }));
    if (isOpening && !commentsMap[postId]) {
      await fetchComments(postId, 1, false);
    }
  };

  const handleLoadMoreComments = async (postId: string) => {
    const currentPagination = commentsPagination[postId];
    if (!currentPagination || currentPagination.loading || !currentPagination.hasMore) {
      return;
    }

    await fetchComments(postId, currentPagination.page + 1, true);
  };

  const handleCommentAdd = async (postId: string) => {
    let text = newComments[postId];
    if (!text?.trim() || commentSubmittingMap[postId]) return;

    text = text.trim();
    if (getCommentLanguageFilter().isProfane(text)) {
      Alert.alert(
        "Comment not posted",
        "Please remove abusive or inappropriate language before posting."
      );
      return;
    }

    try {
      setCommentSubmittingMap((prev) => ({ ...prev, [postId]: true }));
      const response = await communityService.createPostComment(postId, text);
      if (response.success) {
        await fetchComments(postId, 1, false);
        setPosts((prevPosts: any) =>
          prevPosts.map((post: any) =>
            post._id === postId
              ? { ...post, commentCount: Number(post.commentCount || 0) + 1 }
              : post
          )
        );
        setNewComments((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (error: any) {
      console.error("Failed to add comment:", error);
      Alert.alert(
        "Comment not posted",
        error?.message || "Please try again in a moment."
      );
    } finally {
      setCommentSubmittingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId: string, comment: any) => {
    if (commentActionLoading) return;
    setCommentActionLoading(true);
    try {
      const response = await communityService.deletePostComment(comment._id);
      if (!response?.success) {
        throw new Error(response?.message || "Unable to delete comment");
      }
      setCommentsMap((previous) => ({
        ...previous,
        [postId]: (previous[postId] || []).filter(
          (existingComment) => existingComment._id !== comment._id
        ),
      }));
      setPosts((previousPosts: any[]) =>
        previousPosts.map((post: any) =>
          post._id === postId
            ? {
                ...post,
                commentCount: Math.max(Number(post.commentCount || 0) - 1, 0),
              }
            : post
        )
      );
      setCommentAction(null);
    } catch (error: any) {
      Alert.alert("Unable to delete comment", error?.message || "Please try again.");
    } finally {
      setCommentActionLoading(false);
    }
  };

  const beginCommentReport = (targetType: "comment" | "user") => {
    if (!commentAction) return;
    setCommentReport({ ...commentAction, targetType });
    setCommentAction(null);
    setCommentReportReason("");
    setCommentReportDetails("");
  };

  const submitCommentReport = async () => {
    if (
      !commentReport ||
      !commentReportReason ||
      (commentReportReason === "other" && !commentReportDetails.trim()) ||
      commentActionLoading
    ) {
      return;
    }
    setCommentActionLoading(true);
    try {
      const response = await communityService.reportPostComment(
        commentReport.comment._id,
        commentReportReason,
        commentReportDetails.trim(),
        commentReport.targetType
      );
      if (!response?.success) {
        throw new Error(response?.message || "Unable to submit report");
      }
      if (response?.data?.autoHidden && commentReport.targetType === "comment") {
        const { postId, comment } = commentReport;
        setCommentsMap((previous) => ({
          ...previous,
          [postId]: (previous[postId] || []).filter(
            (existingComment) => existingComment._id !== comment._id
          ),
        }));
        setPosts((previousPosts: any[]) =>
          previousPosts.map((post: any) =>
            post._id === postId
              ? {
                  ...post,
                  commentCount: Math.max(Number(post.commentCount || 0) - 1, 0),
                }
              : post
          )
        );
      }
      setCommentReport(null);
      Alert.alert("Report received", response.message);
    } catch (error: any) {
      Alert.alert("Unable to submit report", error?.message || "Please try again.");
    } finally {
      setCommentActionLoading(false);
    }
  };

  const handleBlockCommentAuthor = async () => {
    const blockedUserId = commentAction?.comment?.user?._id;
    if (!blockedUserId || commentActionLoading) return;
    setCommentActionLoading(true);
    try {
      const response = await userService.blockUser({ blockedUserId });
      if (!response?.success) {
        throw new Error(response?.message || "Unable to block user");
      }
      setCommentAction(null);
      setCommentsMap({});
      await fetchPosts(1, false);
      Alert.alert("User blocked", "Their posts and comments are now hidden from you.");
    } catch (error: any) {
      Alert.alert("Unable to block user", error?.message || "Please try again.");
    } finally {
      setCommentActionLoading(false);
    }
  };

  const handleShareFromPreview = async (platform?: "instagram" | "whatsapp") => {
    try {
      if (!sharePreviewRef.current) {
        Alert.alert("Error", "Unable to capture card. Please try again.");
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      const uri = await captureRef(sharePreviewRef.current, {
        format: "png",
        quality: 1.0,
        result: "tmpfile",
      });

      if (!uri) {
        Alert.alert("Error", "Failed to capture story card. Please try again.");
        return;
      }

      const instagramHandle = "https://www.instagram.com/iness_wellness360_app";
      const shareText = sharePostText 
        ? `🔥 ${sharePostText}\n\n💪 Track daily wins with Iness: ${instagramHandle}`
        : `🔥 Celebrating wellness on Iness!\n\n💪 Follow us: ${instagramHandle}`;

      setSharePreviewVisible(false);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: platform === "whatsapp" ? "Share to WhatsApp Status" : "Share to Instagram Story",
          UTI: "public.png",
        });
      } else {
        await Share.share({
          message: shareText,
          title: "Share from Iness",
          url: Platform.OS === "ios" ? uri : undefined,
        });
      }
    } catch (error: any) {
      console.error("Error capturing and sharing:", error);
      Alert.alert("Error", "Failed to share story card. Please try again.");
      setSharePreviewVisible(false);
    }
  };

  const handleSharePost = async (post: any) => {
    try {
      void communityService.trackEngagement({ targetType: "post", targetId: post._id, kind: "share", source: "community_feed" }).catch(() => undefined);
      setSharePostItem(post);
      setShareImageUrl(post.media && post.media.length > 0 ? post.media[0] : null);
      setSharePostText(post.text || "");
      setSharePreviewVisible(true);
    } catch (error: any) {
      console.error("Error sharing post:", error);
      Alert.alert("Error", "Failed to prepare story card.");
    }
  };

  const handleSelectReaction = useCallback(
    async (post: Post, reactionId: string) => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      setActiveReactionPostId(null);

      const postId = post._id;
      if (!postId) return;

      const previousReaction = post.userReaction;
      const isRemoving = previousReaction === reactionId;
      const nextReaction = isRemoving ? null : reactionId;

      setPosts((currentPosts: any[]) =>
        currentPosts.map((p) => {
          if (p._id !== postId) return p;
          const counts = { ...(p.reactionCounts || {}) };
          if (previousReaction && counts[previousReaction]) {
            counts[previousReaction] = Math.max(0, counts[previousReaction] - 1);
            if (counts[previousReaction] === 0) delete counts[previousReaction];
          }
          if (nextReaction) {
            counts[nextReaction] = (counts[nextReaction] || 0) + 1;
          }
          const willBeLiked = !!nextReaction;
          const wasLiked = !!p.likedByUser;
          let newLikeCount = Number(p.likeCount) || 0;
          if (willBeLiked && !wasLiked) newLikeCount += 1;
          else if (!willBeLiked && wasLiked) newLikeCount = Math.max(0, newLikeCount - 1);

          return {
            ...p,
            userReaction: nextReaction,
            reactionCounts: counts,
            likedByUser: willBeLiked,
            likeCount: newLikeCount,
          };
        })
      );

      try {
        await communityService.feedAction({
          kind: "reaction",
          postId,
          value: nextReaction || previousReaction,
          enabled: !isRemoving,
        });

        const loggedUser = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage<any>("user");
        if (!isRemoving && !post.likedByUser) {
          void communityService
            .togglePostLike(postId, {
              reciverId: post.createdBy?._id || null,
              senderId: loggedUser.exists ? loggedUser.data._id : null,
            })
            .catch(() => {});
        } else if (isRemoving && post.likedByUser) {
          void communityService
            .togglePostLike(postId, {
              reciverId: post.createdBy?._id || null,
              senderId: loggedUser.exists ? loggedUser.data._id : null,
            })
            .catch(() => {});
        }
      } catch (err) {
        console.warn("Reaction action failed:", err);
      }
    },
    [setPosts]
  );

  const handleToggleLike = async (post: Post) => {
    const postId = post._id;
    if (!postId) {
      alert("Some error has happened");
      return;
    }

    if (post.likedByUser || post.userReaction) {
      await handleSelectReaction(post, post.userReaction || "heart");
      return;
    }

    await handleSelectReaction(post, "heart");
  };
  handleToggleLikeRef.current = handleToggleLike;

  const handleSavePost = async (post: Post, collection = "Saved") => {
    if (!post._id) return;
    const nextSaved = !post.savedByUser;
    setSaveLoading(true);
    setPosts((current: Post[]) => current.map((item) => item._id === post._id ? { ...item, savedByUser: nextSaved } : item));
    try {
      const response = await communityService.feedAction({ kind: "save", postId: post._id, enabled: nextSaved, collection });
      if (!response?.success) throw new Error(response?.message);
      setSaveTarget(null);
      setCustomCollection("");
    } catch (error: any) {
      setPosts((current: Post[]) => current.map((item) => item._id === post._id ? { ...item, savedByUser: !nextSaved } : item));
      Alert.alert("Unable to save", error?.message || "Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFeedPreference = async (
    post: Post,
    kind: "follow" | "mute" | "restrict" | "not_interested"
  ) => {
    if (!post._id || (kind !== "not_interested" && !post.createdBy?._id)) return;
    setShowMenuForPost(null);
    try {
      const response = await communityService.feedAction(
        kind === "not_interested"
          ? { kind, postId: post._id }
          : {
              kind,
              targetUserId: post.createdBy._id,
              ...(kind === "follow" ? { enabled: !post.followedByUser } : {}),
            }
      );
      if (!response?.success) throw new Error(response?.message);
      if (["mute", "restrict", "not_interested"].includes(kind)) {
        setPosts((current: Post[]) => current.filter((item) =>
          kind === "not_interested"
            ? item._id !== post._id
            : item.createdBy?._id !== post.createdBy?._id
        ));
      } else {
        const following = !post.followedByUser;
        setPosts((current: Post[]) => current.map((item) =>
          item.createdBy?._id === post.createdBy?._id
            ? { ...item, followedByUser: following }
            : item
        ));
        Alert.alert(following ? "Following" : "Unfollowed", following
          ? `You are now following ${post.createdBy?.name || "this member"}.`
          : `You unfollowed ${post.createdBy?.name || "this member"}.`);
      }
    } catch (error: any) {
      Alert.alert("Unable to update feed", error?.message || "Please try again.");
    }
  };


  const renderVideoStatusCard = (post: Post) => {
    const status = post.processingStatus || "pending";
    const title =
      status === "failed"
        ? "Video processing failed"
        : status === "processing"
          ? "Optimizing video..."
          : "Video queued";
    const description =
      status === "failed"
        ? post.processingError ||
          "The optimized video could not be prepared yet. Please try uploading again."
        : status === "processing"
          ? "We are creating the faster playback version in the background."
          : "Upload finished. The optimized video will appear here shortly.";

    return (
      <View style={styles.videoPlaceholder}>
        {post.previewImage ? (
          <>
            <Image
              source={{ uri: post.previewImage }}
              style={[styles.videoPosterImage, styles.videoPosterImageCover]}
              resizeMode="cover"
            />
            <View style={styles.videoPosterScrim} />
          </>
        ) : null}
        {status === "failed" ? (
          <Ionicons name="alert-circle-outline" size={52} color="#FFFFFF" />
        ) : (
          <ActivityIndicator size="large" color="#FFFFFF" />
        )}
        <Text style={styles.videoPlaceholderText}>{title}</Text>
        <Text style={styles.videoStatusText}>{description}</Text>
      </View>
    );
  };

  const renderMedia = (post: Post) => {
    const postId = post._id || "";
    const media = post.media || [];
    const type = post.type;

    if (!postId) {
      return null;
    }

    if (!media.length) {
      if (type === "video" && post.processingStatus !== "ready") {
        return renderVideoStatusCard(post);
      }

      return null;
    }

    if (post.isSensitive && !revealedSensitivePostIds[postId]) {
      return (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Reveal sensitive media"
          style={styles.sensitiveMediaCover}
          onPress={() => setRevealedSensitivePostIds((current) => ({ ...current, [postId]: true }))}
        >
          <Ionicons name="eye-off-outline" size={34} color={theme.colors.textSecondary} />
          <Text style={styles.sensitiveMediaTitle}>Sensitive media hidden</Text>
          <Text style={styles.sensitiveMediaText}>Tap to view this media. You can report the post from its menu.</Text>
        </TouchableOpacity>
      );
    }

    const handleScroll = (event: any) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
      setActiveMediaIndex((prev) => ({ ...prev, [postId]: index }));

      const nextVideoKey = buildVideoKey(postId, index);
      if (
        activeVideoKey &&
        getPostIdFromVideoKey(activeVideoKey) === postId &&
        activeVideoKey !== nextVideoKey
      ) {
        setActiveVideoKey(null);
      }
    };

    const isTransformation =
      media.length >= 2 &&
      (post.contentType === "transformation" ||
        post.contentType === "progress" ||
        (Array.isArray(post.hashtags) &&
          post.hashtags.some((t: string) => t.toLowerCase().includes("transform"))));

    const currentMode = transformationMode[postId] || (isTransformation ? "slider" : "carousel");
    const workoutStats = getWorkoutStats(post);

    if (isTransformation && currentMode === "slider") {
      return (
        <View style={styles.mediaContainer}>
          <View style={styles.transformationHeaderRow}>
            <View style={styles.transformationBadge}>
              <Ionicons name="sparkles" size={13} color="#FF7A00" />
              <Text style={styles.transformationBadgeText}>TRANSFORMATION</Text>
            </View>
            <TouchableOpacity
              style={styles.transformationToggleBtn}
              onPress={() =>
                setTransformationMode((prev) => ({
                  ...prev,
                  [postId]: "carousel",
                }))
              }
            >
              <Ionicons name="images-outline" size={13} color={theme.colors.textSecondary} />
              <Text style={styles.transformationToggleBtnText}>Carousel</Text>
            </TouchableOpacity>
          </View>

          <BeforeAfterSplitSlider
            beforeUri={media[0]}
            afterUri={media[1]}
            beforeLabel={post.metadata?.beforeLabel || "BEFORE"}
            afterLabel={post.metadata?.afterLabel || "AFTER"}
            onDoubleTap={() => handleMediaDoubleTap(post)}
            styles={styles}
          />

          {workoutStats.length > 0 && (
            <View style={styles.workoutStatOverlay} pointerEvents="box-none">
              <View style={styles.workoutStatHeader}>
                <Ionicons name="fitness" size={12} color="#00E5FF" />
                <Text style={styles.workoutStatBrand}>INESS STATS</Text>
              </View>
              <View style={styles.workoutStatPillsRow}>
                {workoutStats.map((stat, i) => (
                  <View key={i} style={styles.workoutStatPill}>
                    <Ionicons name={stat.icon as any} size={11} color={stat.color} />
                    <Text style={styles.workoutStatPillText}>{stat.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {heartPopPostId === postId ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heartPopOverlay,
                {
                  opacity: heartOpacity,
                  transform: [{ scale: heartScale }],
                },
              ]}
            >
              <Ionicons name="heart" size={100} color="#FF3040" />
            </Animated.View>
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        {isTransformation && (
          <View style={styles.transformationHeaderRow}>
            <View style={styles.transformationBadge}>
              <Ionicons name="sparkles" size={13} color="#FF7A00" />
              <Text style={styles.transformationBadgeText}>TRANSFORMATION</Text>
            </View>
            <TouchableOpacity
              style={styles.transformationToggleBtn}
              onPress={() =>
                setTransformationMode((prev) => ({
                  ...prev,
                  [postId]: "slider",
                }))
              }
            >
              <Ionicons name="swap-horizontal" size={13} color={theme.colors.textSecondary} />
              <Text style={styles.transformationToggleBtnText}>Split Slider</Text>
            </TouchableOpacity>
          </View>
        )}
        <FlatList
          ref={(ref) => {
            if (ref) mediaListRefs.current[postId] = ref;
          }}
          data={media}
          keyExtractor={(uri, idx) => `${uri}-${idx}`}
          horizontal
          pagingEnabled
          snapToInterval={screenWidth}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={3}
          removeClippedSubviews={false}
          renderItem={({ item: mediaUrl, index }) => {
            const isVideo = type === "video" || isLikelyVideoSource(mediaUrl);
            const videoKey = buildVideoKey(postId, index);
            const currentMediaIndex = activeMediaIndex[postId] || 0;
            const shouldShowPreview =
              !!visiblePostIds[postId] && currentMediaIndex === index;

            return (
              <Pressable
                onPress={() => handleMediaDoubleTap(post)}
                style={styles.mediaItemWrapper}
              >
                {isVideo ? (
                  <FeedVideoPlayer
                    videoKey={videoKey}
                    playbackUrl={post.localMediaUri || post.streamUrl || mediaUrl}
                    posterUri={post.previewImage}
                    isActive={activeVideoKey === videoKey}
                    showPreview={shouldShowPreview}
                    onActivate={setActiveVideoKey}
                    onDeactivate={deactivateVideo}
                    onExpand={(url) => openModal(url, "video")}
                    styles={styles}
                  />
                ) : (
                  <Image
                    source={{ uri: mediaUrl }}
                    resizeMode="cover"
                    style={styles.mediaImage}
                  />
                )}
                {isTransformation && (index === 0 || index === 1) ? (
                  <View style={styles.beforeAfterBadge}>
                    <Text style={styles.beforeAfterBadgeText}>{index === 0 ? "BEFORE" : "AFTER"}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />

        {workoutStats.length > 0 && (
          <View style={styles.workoutStatOverlay} pointerEvents="box-none">
            <View style={styles.workoutStatHeader}>
              <Ionicons name="fitness" size={12} color="#00E5FF" />
              <Text style={styles.workoutStatBrand}>INESS STATS</Text>
            </View>
            <View style={styles.workoutStatPillsRow}>
              {workoutStats.map((stat, i) => (
                <View key={i} style={styles.workoutStatPill}>
                  <Ionicons name={stat.icon as any} size={11} color={stat.color} />
                  <Text style={styles.workoutStatPillText}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {media.length > 1 && (
          <View style={styles.carouselCounterBadge} pointerEvents="none">
            <Text style={styles.carouselCounterText}>
              {(activeMediaIndex[postId] || 0) + 1}/{media.length}
            </Text>
          </View>
        )}

        {heartPopPostId === postId ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heartPopOverlay,
              {
                opacity: heartOpacity,
                transform: [{ scale: heartScale }],
              },
            ]}
          >
            <Ionicons name="heart" size={100} color="#FF3040" />
          </Animated.View>
        ) : null}
        {media.length > 1 && (
          <View style={styles.dotsContainer}>
            {media.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  (activeMediaIndex[postId] || 0) === idx && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderReactionsSummary = (post: any) => {
    const counts = post.reactionCounts || {};
    const reactionEntries = Object.entries(counts).filter(([_, count]) => Number(count) > 0);
    const totalReactions = reactionEntries.reduce((sum, [_, count]) => sum + Number(count), 0);
    const likeCount = Number(post.likeCount) || 0;
    const displayTotal = Math.max(totalReactions, likeCount);

    if (displayTotal === 0) return null;

    const topReactions = FEED_REACTIONS.filter((r) => Number(counts[r.id]) > 0).slice(0, 3);

    return (
      <View style={styles.reactionsSummaryRow}>
        {topReactions.length > 0 && (
          <View style={styles.reactionsEmojiStack}>
            {topReactions.map((r, idx) => (
              <Text
                key={r.id}
                style={[
                  styles.reactionStackEmoji,
                  { zIndex: 3 - idx, marginLeft: idx > 0 ? -4 : 0 },
                ]}
              >
                {r.emoji}
              </Text>
            ))}
          </View>
        )}
        <Text style={styles.likesText}>
          {displayTotal} {displayTotal === 1 ? "reaction" : "reactions"}
        </Text>
      </View>
    );
  };

  const renderPost = ({ item }: { item: any }) => {
    const isOwnPost = !!currentUserId && item.createdBy?._id === currentUserId;

    return (
    <View style={styles.card}>
      {/* Header - Instagram style */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          activeOpacity={0.8}
          onPress={() => handleUserPress(item.createdBy)}
          accessibilityRole="button"
          accessibilityLabel={`View ${item.createdBy?.name || "member"}'s profile`}
        >
          {item.createdBy?.profilePic ? (
            <Image
              source={{ uri: item.createdBy.profilePic }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color={theme.colors.textMuted} />
            </View>
          )}
          <View>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>
                {item.createdBy?.name || "Anonymous"}
              </Text>
              {item.createdBy?.isVerified ? <Ionicons accessibilityLabel="Verified account" name="checkmark-circle" size={15} color={theme.colors.secondPrimary} /> : null}
              {item.contentType === "workout" || item.contentType === "progress" || item.contentType === "transformation" || item.metadata?.streak ? (
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={12} color="#FF7A00" />
                  <Text style={styles.streakBadgeText}>
                    {typeof item.metadata?.streak === "number" ? `${item.metadata.streak}d` : "Active"}
                  </Text>
                </View>
              ) : null}
              {item.challengeBadge ? (
                <View style={styles.headerChallengeBadge}>
                  <Ionicons name="trophy" size={11} color="#FFD700" />
                  <Text style={styles.headerChallengeBadgeText} numberOfLines={1}>
                    {item.challengeBadge.title || "Challenge"}
                  </Text>
                </View>
              ) : null}
            </View>
            {item.createdAt && (
              <Text style={styles.timeText}>
                {dayjs(item.createdAt).fromNow()}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setShowMenuForPost((prev) =>
              prev === item._id ? null : item._id
            );
          }}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={isDark ? theme.colors.textWhite : theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {item.text && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{item.text}</Text>
        </View>
      )}

      <RichPostContent
        post={item}
        onChanged={(updates) => setPosts((current: any[]) => current.map((post) => post._id === item._id ? { ...post, ...updates } : post))}
      />

      {/* Media - Full width Instagram style */}
      {renderMedia(item)}

      {/* Floating Reaction Picker Bar */}
      {activeReactionPostId === item._id && (
        <View style={styles.floatingReactionsContainer}>
          <Pressable
            style={styles.floatingReactionsBackdrop}
            onPress={() => setActiveReactionPostId(null)}
          />
          <Animated.View
            style={[
              styles.floatingReactionsBar,
              { transform: [{ scale: reactionAnim }] },
            ]}
          >
            {FEED_REACTIONS.map((reaction) => {
              const isSelected = item.userReaction === reaction.id;
              return (
                <TouchableOpacity
                  key={reaction.id}
                  activeOpacity={0.7}
                  style={[
                    styles.reactionPillItem,
                    isSelected && styles.reactionPillItemSelected,
                  ]}
                  onPress={() => handleSelectReaction(item, reaction.id)}
                >
                  <Text style={styles.reactionEmojiText}>{reaction.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </View>
      )}

      {/* Actions Row */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity 
            onPress={() => handleToggleLike(item)}
            onLongPress={() => handleLongPressLike(item._id)}
            delayLongPress={280}
            style={styles.actionButton}
            disabled={!!likeLoadingMap[item._id]}
            accessibilityLabel="Like or react to post"
          >
            {item.userReaction && item.userReaction !== "heart" ? (
              <View style={styles.userReactionPill}>
                <Text style={styles.userReactionEmoji}>
                  {FEED_REACTIONS.find((r) => r.id === item.userReaction)?.emoji || "❤️"}
                </Text>
              </View>
            ) : (
              <Ionicons
                name={item.likedByUser ? "heart" : "heart-outline"}
                size={28}
                color={item.likedByUser ? "#FF3040" : (isDark ? theme.colors.textWhite : theme.colors.text)}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => toggleCommentSection(item._id)}
            style={styles.actionButton}
            disabled={item.commentsEnabled === false}
          >
            <Ionicons
              name="chatbubble-outline"
              size={26}
              color={item.commentsEnabled === false ? theme.colors.textMuted : (isDark ? theme.colors.textWhite : theme.colors.text)}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleSharePost(item)}
            style={styles.actionButton}
            disabled={item.sharingEnabled === false}
          >
            <Ionicons name="paper-plane-outline" size={26} color={item.sharingEnabled === false ? theme.colors.textMuted : (isDark ? theme.colors.textWhite : theme.colors.text)} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={() => item.savedByUser ? void handleSavePost(item) : setSaveTarget(item)}>
          <Ionicons name={item.savedByUser ? "bookmark" : "bookmark-outline"} size={26} color={item.savedByUser ? theme.colors.secondPrimary : (isDark ? theme.colors.textWhite : theme.colors.text)} />
        </TouchableOpacity>
      </View>

      {/* Reactions & Likes summary */}
      {renderReactionsSummary(item)}

      {/* View Comments */}
      {item.commentCount > 0 && (
        <TouchableOpacity 
          onPress={() => toggleCommentSection(item._id)}
          style={styles.viewCommentsButton}
        >
          <Text style={styles.viewCommentsText}>
            View all {item.commentCount} {item.commentCount === 1 ? "comment" : "comments"}
          </Text>
        </TouchableOpacity>
      )}

      {item.commentsEnabled !== false && visibleComments[item._id] && (
        <View style={styles.commentSection}>
          {commentsMap[item._id]?.map((comment) => (
            <View key={comment._id} style={styles.commentItem}>
              <Text style={[styles.commentText, { flex: 1 }]}>
                <Text style={styles.commentUser}>
                  {comment.user?.name || "User"}{" "}
                </Text>
                {comment.text}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Options for ${comment.user?.name || "user"}'s comment`}
                onPress={() => {
                  if (comment.user?._id === currentUserId) {
                    Alert.alert(
                      "Delete comment?",
                      "This comment will be removed from the Feed.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => handleDeleteComment(item._id, comment),
                        },
                      ]
                    );
                  } else {
                    setCommentAction({ postId: item._id, comment });
                  }
                }}
                style={{ paddingLeft: 12, paddingVertical: 4 }}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          ))}
          {commentsPagination[item._id]?.hasMore && (
            <TouchableOpacity 
              onPress={() => handleLoadMoreComments(item._id)}
              style={styles.viewAllComments}
              disabled={commentsPagination[item._id]?.loading}
            >
              <Text style={styles.viewAllCommentsText}>
                {commentsPagination[item._id]?.loading
                  ? "Loading comments..."
                  : "Load more comments"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.commentInputWrapper}>
            <TextInput
              value={newComments[item._id] || ""}
              maxLength={2000}
              onChangeText={(text) =>
                setNewComments((prev) => ({ ...prev, [item._id]: text }))
              }
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              style={styles.commentInput}
            />
            <TouchableOpacity 
              onPress={() => handleCommentAdd(item._id)}
              disabled={
                !newComments[item._id]?.trim() ||
                !!commentSubmittingMap[item._id]
              }
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={
                  newComments[item._id]?.trim() && !commentSubmittingMap[item._id]
                    ? "#67C694"
                    : "#999"
                } 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showMenuForPost === item._id && (
        <View
          style={{
            position: "absolute",
            right: "10%",
            top: "5%",
            backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
            borderRadius: 12,
            ...(isDark ? {} : {
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 6,
              elevation: 5,
            }),
            paddingVertical: 8,
            width: 210,
            zIndex: 1300,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          {isOwnPost ? (
            <TouchableOpacity
              onPress={() => {
                setShowMenuForPost(null);
                setDeleteConfirmPostId(item._id);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
              disabled={deleteloading.loading && deleteloading._id === item._id}
            >
              {deleteloading.loading && deleteloading._id === item._id ? (
                <ActivityIndicator color="red" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="red" />
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: theme.fontSizes.regular,
                      color: "red",
                      fontWeight: "600",
                    }}
                  >
                    Delete
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <>
              {[
                ["follow", item.followedByUser ? "Unfollow member" : "Follow member", item.followedByUser ? "person-remove-outline" : "person-add-outline"],
                ["not_interested", "Not interested", "eye-off-outline"],
                ["mute", "Mute member", "volume-mute-outline"],
                ["restrict", "Restrict member", "shield-outline"],
              ].map(([kind, label, icon]) => (
                <TouchableOpacity
                  key={kind}
                  onPress={() => handleFeedPreference(item, kind as any)}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 9, paddingHorizontal: 16 }}
                >
                  <Ionicons name={icon as any} size={18} color={theme.colors.textSecondary} />
                  <Text style={{ marginLeft: 10, fontSize: theme.fontSizes.regularSmall, color: theme.colors.text, fontWeight: "500" }}>{label}</Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: 1, backgroundColor: theme.colors.border, marginHorizontal: 10 }} />
              {showTooltipForPost === item._id ? (
                <ActivityIndicator style={{ paddingVertical: 12 }} color={isDark ? theme.colors.textWhite : theme.colors.secondPrimary} />
              ) : (
                <TouchableOpacity
                  onPress={() => toolTipAction(item, "complain")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                >
                  <Ionicons name="alert-circle-outline" size={20} color="#FF9800" />
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: theme.fontSizes.regular,
                      color: isDark ? theme.colors.textWhite : theme.colors.text,
                      fontWeight: "500",
                    }}
                  >
                    Complain
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={{
                  height: 1,
                  backgroundColor: theme.colors.border,
                  marginHorizontal: 10,
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Block User",
                    "Are you sure you want to block this user? You won't be able to see their content from now on.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Yes, Block",
                        onPress: () => toolTipAction(item, "block"),
                      },
                    ]
                  );
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                {blockLoading ? (
                  <ActivityIndicator color={isDark ? theme.colors.textWhite : "red"} />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="red" />
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: theme.fontSizes.regular,
                        color: "red",
                        fontWeight: "600",
                      }}
                    >
                      Block User
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

    </View>
  );
  };

  const normalizedSearchQuery = feedSearchQuery.trim().replace(/^[@#]/, "").toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesFilter =
      feedFilter === "saved"
        ? post.savedByUser
        : feedFilter === "workouts"
        ? (post.contentType === "workout" ||
           post.contentType === "transformation" ||
           post.contentType === "progress" ||
           Boolean(
             post.metadata?.duration ||
             post.metadata?.calories ||
             post.metadata?.steps ||
             post.metadata?.metric
           ))
        : feedFilter === "following"
        ? post.followedByUser
        : feedFilter === "company"
        ? post.audience === "company"
        : true;
    if (!matchesFilter) return false;
    if (!normalizedSearchQuery) return true;

    // Search author/people name thoroughly
    const authorName = (
      post.createdBy?.name ||
      post.createdBy?.userName ||
      post.createdBy?.username ||
      post.createdByUser?.name ||
      post.user?.name ||
      post.author?.name ||
      post.name ||
      ""
    ).toLowerCase();

    const nameMatches =
      authorName.includes(normalizedSearchQuery) ||
      (post.createdBy?.firstName &&
        String(post.createdBy.firstName).toLowerCase().includes(normalizedSearchQuery)) ||
      (post.createdBy?.lastName &&
        String(post.createdBy.lastName).toLowerCase().includes(normalizedSearchQuery)) ||
      (post.createdByUser?.userName &&
        String(post.createdByUser.userName).toLowerCase().includes(normalizedSearchQuery));

    if (nameMatches) return true;

    const searchableText = [
      post.text,
      post.contentType,
      ...(Array.isArray(post.hashtags) ? post.hashtags : []),
      ...(Array.isArray(post.mentions) ? post.mentions : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchQuery);
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {isLoading && posts.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item._id}
            renderItem={renderPost}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.6}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={FEED_VIEWABILITY_CONFIG}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews={Platform.OS === "android" ? false : true}
            ListHeaderComponent={
              <FeedFeatureHeader
                communityId={communityId}
                selectedFilter={feedFilter}
                onFilterChange={setFeedFilter}
                onCreatePost={onCreatePost}
                searchValue={feedSearchQuery}
                onSearchChange={setFeedSearchQuery}
                posts={posts}
                onSelectUser={handleUserPress}
                selectedSort={feedSort}
                onSortChange={(sort) => {
                  setFeedSort(sort);
                  void fetchPosts(1, false, undefined);
                }}
                onQuickShareAchievement={handleQuickShareAchievement}
              />
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Loading more posts...</Text>
                </View>
              ) : !hasMore && posts.length > 5 ? (
                <View style={styles.endOfFeedContainer}>
                  <View style={styles.endOfFeedLine} />
                  <Text style={styles.endOfFeedText}>You're all caught up</Text>
                  <View style={styles.endOfFeedLine} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Ionicons name="leaf-outline" size={34} color={theme.colors.textMuted} />
                <Text style={styles.noPostText}>
                  {normalizedSearchQuery ? "No posts match your search" :
                    feedFilter === "saved" ? "No saved posts yet" :
                    feedFilter === "workouts" ? "No workout posts yet" :
                    feedFilter === "following" ? "Follow members to build this feed" :
                    feedFilter === "company" ? "No company posts yet" :
                    "No posts available yet"}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
      )}
      <Modal visible={!!saveTarget} transparent animationType="fade" onRequestClose={() => setSaveTarget(null)}>
        <Pressable style={styles.saveModalOverlay} onPress={() => setSaveTarget(null)}>
          <Pressable style={styles.saveModalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.saveModalHeader}>
              <View>
                <Text style={styles.saveModalTitle}>Save post</Text>
                <Text style={styles.saveModalSubtitle}>Choose a collection to find it later.</Text>
              </View>
              <TouchableOpacity onPress={() => setSaveTarget(null)}><Ionicons name="close" size={23} color={theme.colors.text} /></TouchableOpacity>
            </View>
            {[
              ["Saved", "bookmark-outline"],
              ["Try later", "time-outline"],
              ["Meals", "restaurant-outline"],
              ["Workouts", "barbell-outline"],
            ].map(([collection, icon]) => (
              <TouchableOpacity key={collection} disabled={saveLoading} style={styles.saveCollectionRow} onPress={() => saveTarget && void handleSavePost(saveTarget, collection)}>
                <View style={styles.saveCollectionIcon}><Ionicons name={icon as any} size={18} color={theme.colors.secondPrimary} /></View>
                <Text style={styles.saveCollectionText}>{collection}</Text>
                <Ionicons name="chevron-forward" size={17} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
            <View style={styles.customCollectionRow}>
              <TextInput
                value={customCollection}
                onChangeText={setCustomCollection}
                maxLength={80}
                placeholder="New collection name"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.customCollectionInput}
              />
              <TouchableOpacity disabled={!customCollection.trim() || saveLoading} style={[styles.customCollectionButton, (!customCollection.trim() || saveLoading) && { opacity: 0.45 }]} onPress={() => saveTarget && void handleSavePost(saveTarget, customCollection.trim())}>
                {saveLoading ? <ActivityIndicator size="small" color={theme.colors.dark} /> : <Text style={styles.customCollectionButtonText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {selectedMedia?.type === "image" && (
        <ImageViewerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          imageUrl={selectedMedia.url}
        />
      )}

      {selectedMedia?.type === "video" && (
        <VideoViewerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          videoUrl={selectedMedia.url}
        />
      )}

      <MemberProfileModal
        visible={!!selectedMemberProfile}
        onClose={() => setSelectedMemberProfile(null)}
        member={selectedMemberProfile}
      />

      <Modal
        visible={!!deleteConfirmPostId}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmPostId(null)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalIconWrap}>
              <Ionicons
                name="trash-outline"
                size={24}
                color={theme.colors.error}
              />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Post?</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setDeleteConfirmPostId(null)}
                disabled={
                  deleteloading.loading &&
                  deleteloading._id === deleteConfirmPostId
                }
              >
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={() => handleDelete(deleteConfirmPostId)}
                disabled={
                  deleteloading.loading &&
                  deleteloading._id === deleteConfirmPostId
                }
              >
                {deleteloading.loading &&
                deleteloading._id === deleteConfirmPostId ? (
                  <ActivityIndicator color={theme.colors.textWhite} />
                ) : (
                  <Text style={styles.deleteConfirmButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!commentAction}
        transparent
        animationType="fade"
        onRequestClose={() => setCommentAction(null)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>Comment options</Text>
            <Text style={styles.deleteModalText} numberOfLines={3}>
              {commentAction?.comment?.text}
            </Text>
            <TouchableOpacity
              style={[styles.deleteCancelButton, { width: "100%", marginBottom: 10 }]}
              onPress={() => beginCommentReport("comment")}
              disabled={commentActionLoading}
            >
              <Text style={styles.deleteCancelButtonText}>Report comment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteCancelButton, { width: "100%", marginBottom: 10 }]}
              onPress={() => beginCommentReport("user")}
              disabled={commentActionLoading}
            >
              <Text style={styles.deleteCancelButtonText}>Report user</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteConfirmButton, { width: "100%", marginBottom: 10 }]}
              onPress={() =>
                Alert.alert(
                  "Block user?",
                  "Their posts and comments will be hidden from you. You can manage blocked users from your privacy settings.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Block",
                      style: "destructive",
                      onPress: handleBlockCommentAuthor,
                    },
                  ]
                )
              }
              disabled={commentActionLoading}
            >
              {commentActionLoading ? (
                <ActivityIndicator color={theme.colors.textWhite} />
              ) : (
                <Text style={styles.deleteConfirmButtonText}>Block user</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingVertical: 10, alignItems: "center" }}
              onPress={() => setCommentAction(null)}
              disabled={commentActionLoading}
            >
              <Text style={styles.deleteCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!commentReport}
        transparent
        animationType="slide"
        onRequestClose={() => !commentActionLoading && setCommentReport(null)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={[styles.deleteModalContainer, { maxHeight: "85%" }]}> 
            <Text style={styles.deleteModalTitle}>
              Report {commentReport?.targetType === "user" ? "user" : "comment"}
            </Text>
            <Text style={styles.deleteModalText}>Select the best reason.</Text>
            <ScrollView style={{ width: "100%" }}>
              {COMMENT_REPORT_REASONS.map((reason) => {
                const selectedReason = commentReportReason === reason.value;
                return (
                  <TouchableOpacity
                    key={reason.value}
                    onPress={() => setCommentReportReason(reason.value)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    }}
                  >
                    <Ionicons
                      name={selectedReason ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={selectedReason ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={{
                        marginLeft: 10,
                        color: isDark ? theme.colors.textWhite : theme.colors.text,
                        fontFamily: theme.fonts.regular,
                      }}
                    >
                      {reason.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TextInput
                value={commentReportDetails}
                onChangeText={setCommentReportDetails}
                placeholder={
                  commentReportReason === "other"
                    ? "Tell us what happened (required)"
                    : "Additional details (optional)"
                }
                placeholderTextColor={theme.colors.textMuted}
                multiline
                maxLength={1000}
                style={[
                  styles.commentInput,
                  {
                    minHeight: 88,
                    width: "100%",
                    marginTop: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 10,
                    textAlignVertical: "top",
                  },
                ]}
              />
            </ScrollView>
            <View style={[styles.deleteModalActions, { marginTop: 16 }]}> 
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setCommentReport(null)}
                disabled={commentActionLoading}
              >
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={submitCommentReport}
                disabled={
                  commentActionLoading ||
                  !commentReportReason ||
                  (commentReportReason === "other" && !commentReportDetails.trim())
                }
              >
                {commentActionLoading ? (
                  <ActivityIndicator color={theme.colors.textWhite} />
                ) : (
                  <Text style={styles.deleteConfirmButtonText}>Submit report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Preview Modal with Logo and Instagram Handle Overlay */}
      {/* Branded Instagram Story / WhatsApp Status Export Modal */}
      <Modal
        visible={sharePreviewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSharePreviewVisible(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContainer}>
            <View style={styles.shareModalHeaderRow}>
              <View>
                <Text style={styles.shareModalTitle}>Export Story Card</Text>
                <Text style={styles.shareModalSubtitle}>
                  Formatted for Instagram Stories & WhatsApp status
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSharePreviewVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* The 9:16 / 4:5 Branded Story Graphic Card */}
            <View 
              ref={sharePreviewRef}
              collapsable={false}
              style={styles.sharePreviewContainer}
            >
              {shareImageUrl ? (
                <ImageBackground
                  source={{ uri: shareImageUrl }}
                  style={styles.shareImageBackground}
                  resizeMode="cover"
                >
                  <View style={styles.storyCardTopBar}>
                    <View style={styles.storyBrandPill}>
                      <Image
                        source={require("@/assets/images/logowithoutbackground.png")}
                        style={styles.storyBrandLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.storyBrandName}>INESS 360</Text>
                    </View>
                    <View style={styles.storyStreakPill}>
                      <Ionicons name="flame" size={13} color="#FF7A00" />
                      <Text style={styles.storyStreakText}>
                        {sharePostItem?.metadata?.streak || 7}d Streak
                      </Text>
                    </View>
                  </View>

                  <View style={styles.storyBottomOverlay}>
                    <View style={styles.storyAuthorRow}>
                      <View style={styles.storyAuthorAvatar}>
                        {sharePostItem?.createdBy?.profilePic ? (
                          <Image
                            source={{ uri: sharePostItem.createdBy.profilePic }}
                            style={styles.storyAuthorAvatarImg}
                          />
                        ) : (
                          <Ionicons name="person" size={16} color="#FFF" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.storyAuthorName}>
                          {sharePostItem?.createdBy?.name || "Iness Athlete"}
                        </Text>
                        <Text style={styles.storyWinSubtext}>
                          Community Milestone
                        </Text>
                      </View>
                    </View>
                    {sharePostText ? (
                      <Text numberOfLines={3} style={styles.storyCaptionText}>
                        "{sharePostText}"
                      </Text>
                    ) : null}
                    <View style={styles.storyFooterRow}>
                      <Text style={styles.storyHandleText}>@iness_wellness360_app</Text>
                      <Text style={styles.storyAppTag}>Transform Daily</Text>
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={styles.storyGraphicCard}>
                  <View style={styles.storyCardTopBar}>
                    <View style={styles.storyBrandPill}>
                      <Image
                        source={require("@/assets/images/logowithoutbackground.png")}
                        style={styles.storyBrandLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.storyBrandName}>INESS 360</Text>
                    </View>
                    <View style={styles.storyStreakPill}>
                      <Ionicons name="flame" size={13} color="#FF7A00" />
                      <Text style={styles.storyStreakText}>
                        {sharePostItem?.metadata?.streak || 7}d Streak
                      </Text>
                    </View>
                  </View>

                  <View style={styles.storyGraphicCenter}>
                    <View style={styles.storyTrophyCircle}>
                      <Ionicons
                        name={
                          sharePostItem?.metadata?.metric === "water"
                            ? "water"
                            : sharePostItem?.metadata?.metric === "steps"
                            ? "footsteps"
                            : "trophy"
                        }
                        size={36}
                        color="#FFD700"
                      />
                    </View>
                    <Text style={styles.storyGraphicBadge}>
                      {sharePostItem?.metadata?.badge || "DAILY MILESTONE"}
                    </Text>
                    {sharePostItem?.metadata?.value ? (
                      <View style={{ alignItems: "center", marginVertical: 4 }}>
                        <Text style={styles.storyBigStat}>
                          {sharePostItem.metadata.value}
                        </Text>
                        <Text style={styles.storyStatUnit}>
                          {sharePostItem.metadata.unit || "completed"}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={styles.storyGraphicQuote} numberOfLines={4}>
                      {sharePostText || "Consistent daily action creates unstoppable momentum. Never miss a win with Iness!"}
                    </Text>
                  </View>

                  <View style={styles.storyGraphicBottom}>
                    <View style={styles.storyAuthorRow}>
                      <View style={styles.storyAuthorAvatar}>
                        {sharePostItem?.createdBy?.profilePic ? (
                          <Image
                            source={{ uri: sharePostItem.createdBy.profilePic }}
                            style={styles.storyAuthorAvatarImg}
                          />
                        ) : (
                          <Ionicons name="person" size={16} color="#FFF" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.storyAuthorName}>
                          {sharePostItem?.createdBy?.name || "Iness Athlete"}
                        </Text>
                        <Text style={styles.storyWinSubtext}>Community Leaderboard</Text>
                      </View>
                    </View>
                    <View style={styles.storyFooterRow}>
                      <Text style={styles.storyHandleText}>@iness_wellness360_app</Text>
                      <Text style={styles.storyAppTag}>Join Community</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Quick 1-Tap Export Buttons */}
            <View style={styles.shareActionGrid}>
              <TouchableOpacity
                style={styles.storyInstagramBtn}
                activeOpacity={0.85}
                onPress={() => handleShareFromPreview("instagram")}
              >
                <Ionicons name="logo-instagram" size={18} color="#FFFFFF" />
                <Text style={styles.storyActionBtnText}>Instagram Story</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.storyWhatsAppBtn}
                activeOpacity={0.85}
                onPress={() => handleShareFromPreview("whatsapp")}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                <Text style={styles.storyActionBtnText}>WhatsApp Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  // Before & After Split Slider Styles
  beforeAfterWrapper: {
    position: "relative",
    width: screenWidth,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  beforeAfterBaseImage: {
    backgroundColor: "#000000",
  },
  beforeClippedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    zIndex: 2,
    borderRightWidth: 1.5,
    borderRightColor: "rgba(255, 255, 255, 0.9)",
  },
  beforeAfterDividerBar: {
    position: "absolute",
    top: 0,
    width: 36,
    zIndex: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  beforeAfterDividerLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
  beforeAfterHandlePill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(17, 24, 39, 0.92)",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 6,
  },
  beforeBadgePill: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(0, 0, 0, 0.68)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 4,
  },
  beforeBadgePillText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  afterBadgePill: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0, 0, 0, 0.68)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 4,
  },
  afterBadgePillText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  beforeAfterHintContainer: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    zIndex: 4,
  },
  beforeAfterHintText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: theme.fonts.medium,
    fontSize: 10,
  },
  transformationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
  },
  transformationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 122, 0, 0.14)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 122, 0, 0.3)",
  },
  transformationBadgeText: {
    color: "#FF7A00",
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  transformationToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  transformationToggleBtnText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
    fontSize: 11,
  },

  // Workout Stat Overlay Sticker
  workoutStatOverlay: {
    position: "absolute",
    bottom: 14,
    left: 14,
    backgroundColor: "rgba(9, 14, 26, 0.82)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    zIndex: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  workoutStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  workoutStatBrand: {
    color: "#00E5FF",
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  workoutStatPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  workoutStatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  workoutStatPillText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 11,
  },

  // Carousel Counter Badge
  carouselCounterBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 6,
  },
  carouselCounterText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Floating Reaction Bar Styles
  floatingReactionsContainer: {
    position: "relative",
    zIndex: 90,
  },
  floatingReactionsBackdrop: {
    position: "absolute",
    top: -1200,
    bottom: -1200,
    left: -1200,
    right: -1200,
  },
  floatingReactionsBar: {
    position: "absolute",
    bottom: 4,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 95,
  },
  reactionPillItem: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 18,
  },
  reactionPillItemSelected: {
    backgroundColor: theme.colors.primary + "30",
    transform: [{ scale: 1.15 }],
  },
  reactionEmojiText: {
    fontSize: 22,
  },
  userReactionPill: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
  userReactionEmoji: {
    fontSize: 24,
  },
  reactionsSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  reactionsEmojiStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionStackEmoji: {
    fontSize: 13,
  },

  listContent: {
    paddingBottom: 100,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  endOfFeedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 12,
  },
  endOfFeedLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  endOfFeedText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
  },
  card: {
    backgroundColor: theme.colors.background,
    marginBottom: 0,
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  noPostText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  username: {
    fontWeight: "600",
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  usernameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: isDark ? "#3A2A1A" : "#FFF4E5",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: isDark ? "#5A3A1A" : "#FFE0B2",
  },
  streakBadgeText: {
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    color: "#FF7A00",
  },
  headerChallengeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 215, 0, 0.14)",
    borderColor: "rgba(255, 215, 0, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
    maxWidth: 120,
  },
  headerChallengeBadgeText: {
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    color: "#FFD700",
  },
  timeText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  mediaContainer: {
    width: "100%",
    backgroundColor: theme.colors.black,
    position: "relative",
  },
  beforeAfterBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
  },
  beforeAfterTab: {
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  beforeAfterTabActive: {
    backgroundColor: theme.colors.secondPrimary,
    borderColor: theme.colors.secondPrimary,
  },
  beforeAfterTabText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
  },
  beforeAfterTabTextActive: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
  },
  beforeAfterBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  beforeAfterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    letterSpacing: 0.8,
  },
  heartPopOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    pointerEvents: "none",
  },
  sensitiveMediaCover: { alignItems: "center", backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, justifyContent: "center", marginHorizontal: 14, minHeight: 230, padding: 24 },
  sensitiveMediaTitle: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: theme.fontSizes.regular, marginTop: 10 },
  sensitiveMediaText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular, fontSize: theme.fontSizes.small, lineHeight: 18, marginTop: 5, maxWidth: 260, textAlign: "center" },
  mediaItemWrapper: {
    width: screenWidth,
    height: screenWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaImage: {
    width: screenWidth,
    height: screenWidth,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  activeVideoWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  videoPreviewTapTarget: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: theme.colors.black,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  videoPosterImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  videoPosterImageCover: {
    resizeMode: "cover",
  },
  videoPosterScrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  videoPlaceholderText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.regular,
    fontFamily: theme.fonts.medium,
    textAlign: "center",
    zIndex: 1,
  },
  videoStatusText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
    zIndex: 1,
    lineHeight: 20,
  },
  videoPreviewLoadingOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  videoPreviewLoadingText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.medium,
  },
  videoPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    pointerEvents: "none",
  },
  playButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    zIndex: 1,
  },
  videoControlsBottomBar: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  videoControlBtn: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 20,
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  videoBufferingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    pointerEvents: "none",
    zIndex: 100,
  },
  bufferingContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
  },
  bufferingText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.regularLarge,
    marginTop: 16,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    textAlign: "center",
  },
  videoPlaybackBufferIndicator: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: theme.colors.background,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  likesText: {
    fontWeight: "600",
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
    paddingHorizontal: 12,
    marginTop: 4,
    fontFamily: theme.fonts.bold,
  },
  captionContainer: {
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  caption: {
    fontSize: theme.fontSizes.regularSmall,
    lineHeight: 20,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  viewCommentsButton: {
    paddingHorizontal: 12,
    marginTop: 4,
  },
  viewCommentsText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  commentSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  commentItem: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: theme.fontSizes.regularSmall,
    lineHeight: 18,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  commentUser: {
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  viewAllComments: {
    marginTop: 4,
    marginBottom: 8,
  },
  viewAllCommentsText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  commentInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  commentInput: {
    flex: 1,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    paddingVertical: 4,
    marginRight: 8,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 8,
  },
  activeToggleButton: {
    backgroundColor: theme.colors.link,
    borderColor: theme.colors.link,
  },
  toggleButtonText: {
    color: theme.colors.textWhite,
    fontWeight: "bold",
  },
  menuDropdown: {
    position: "absolute",
    right: 12,
    top: 50,
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    zIndex: 10,
  },

  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
  },

  tooltipBox: {
    backgroundColor: theme.colors.textSecondary,
    padding: 8,
    marginTop: 4,
    borderRadius: 6,
    alignSelf: "center", // center horizontally
    maxWidth: "50%",
  },
  tooltipText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.small,
  },
  saveModalOverlay: { alignItems: "center", backgroundColor: theme.colors.overlay, flex: 1, justifyContent: "center", padding: 22 },
  saveModalCard: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: 22, borderWidth: 1, maxWidth: 390, padding: 18, width: "100%" },
  saveModalHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  saveModalTitle: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: theme.fontSizes.medium },
  saveModalSubtitle: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: theme.fontSizes.small, marginTop: 3 },
  saveCollectionRow: { alignItems: "center", borderBottomColor: theme.colors.border, borderBottomWidth: 1, flexDirection: "row", minHeight: 52 },
  saveCollectionIcon: { alignItems: "center", backgroundColor: theme.colors.backgroundCardLight, borderRadius: 10, height: 34, justifyContent: "center", marginRight: 10, width: 34 },
  saveCollectionText: { color: theme.colors.text, flex: 1, fontFamily: theme.fonts.medium, fontSize: theme.fontSizes.regularSmall },
  customCollectionRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 14 },
  customCollectionInput: { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 12, borderWidth: 1, color: theme.colors.text, flex: 1, minHeight: 44, paddingHorizontal: 12 },
  customCollectionButton: { alignItems: "center", backgroundColor: theme.colors.primary, borderRadius: 12, justifyContent: "center", minHeight: 44, minWidth: 64, paddingHorizontal: 12 },
  customCollectionButtonText: { color: theme.colors.dark, fontFamily: theme.fonts.bold, fontSize: theme.fontSizes.small },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  deleteModalContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark
      ? {}
      : {
          shadowColor: "#000",
          shadowOpacity: 0.16,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 18,
          elevation: 10,
        }),
  },
  deleteModalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: isDark ? theme.colors.errorLight : "#FFF1F1",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  deleteModalTitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    marginBottom: 10,
  },
  deleteModalText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  deleteCancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteCancelButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.regular,
    fontWeight: "600",
    fontFamily: theme.fonts.medium,
  },
  deleteConfirmButton: {
    flex: 1,
    padding: 14,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteConfirmButtonText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regular,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  shareModalContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    padding: 18,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shareModalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 14,
  },
  shareModalTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  shareModalSubtitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontFamily: theme.fonts.regular,
  },
  sharePreviewContainer: {
    width: Math.min(screenWidth * 0.82, 340),
    height: Math.min(screenWidth * 0.82, 340) * 1.35,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  shareImageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  storyCardTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  storyBrandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  storyBrandLogo: {
    width: 22,
    height: 22,
  },
  storyBrandName: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  storyStreakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 122, 0, 0.22)",
    borderColor: "#FF7A00",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  storyStreakText: {
    color: "#FF7A00",
    fontFamily: theme.fonts.bold,
    fontSize: 11,
  },
  storyBottomOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    padding: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  storyAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 6,
  },
  storyAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundCardLight,
    borderWidth: 1.5,
    borderColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  storyAuthorAvatarImg: {
    width: "100%",
    height: "100%",
  },
  storyAuthorName: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 13,
  },
  storyWinSubtext: {
    color: "rgba(255, 255, 255, 0.65)",
    fontFamily: theme.fonts.regular,
    fontSize: 10,
  },
  storyCaptionText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    marginVertical: 4,
  },
  storyFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  storyHandleText: {
    color: "#FF7A00",
    fontFamily: theme.fonts.bold,
    fontSize: 10,
  },
  storyAppTag: {
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: theme.fonts.medium,
    fontSize: 10,
  },
  storyGraphicCard: {
    flex: 1,
    backgroundColor: "#0B0F19",
    justifyContent: "space-between",
  },
  storyGraphicCenter: {
    alignItems: "center",
    paddingHorizontal: 18,
    marginVertical: "auto",
  },
  storyTrophyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 215, 0, 0.14)",
    borderColor: "#FFD700",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  storyGraphicBadge: {
    color: "#FFD700",
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  storyBigStat: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 34,
    letterSpacing: 0.5,
  },
  storyStatUnit: {
    color: "rgba(255, 255, 255, 0.75)",
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    textTransform: "uppercase",
  },
  storyGraphicQuote: {
    color: "rgba(255, 255, 255, 0.88)",
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 6,
  },
  storyGraphicBottom: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  shareActionGrid: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 16,
  },
  storyInstagramBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#E1306C",
    borderRadius: 14,
    paddingVertical: 12,
  },
  storyWhatsAppBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#25D366",
    borderRadius: 14,
    paddingVertical: 12,
  },
  storyActionBtnText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 12,
  },
});

export default CommunityPosts;
