import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { communityService } from "@/src/services/community.service";
import { userService } from "@/src/services/user.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { ResizeMode, Video } from "@/src/modules/AppVideo";
import { FeedExtrasModal, StoryViewersModal } from "./FeedExtrasModal";

export type FeedFilter = "explore" | "following" | "company" | "saved";
export type StoryAudience = "public" | "close_friends";

const STORY_STICKERS = [
  "🔥 500 kcal",
  "💪 Workout Done",
  "🎯 10k Steps",
  "🥗 Clean Diet",
  "💧 3L Water",
  "⚡ High Energy",
];

export const QUICK_ACHIEVEMENT_PRESETS = [
  { id: "steps_10k", emoji: "👟", title: "10k Steps", metric: "steps", value: "10,240", unit: "steps", badge: "Daily Goal Met", text: "🎯 Crushed my daily goal: 10,240 steps! Consistency wins." },
  { id: "cal_500", emoji: "🔥", title: "500 kcal", metric: "calories", value: "520", unit: "kcal", badge: "Calorie Burner", text: "🔥 Burned 520 kcal in an intense training session today!" },
  { id: "hiit_workout", emoji: "💪", title: "Workout Done", metric: "workout", value: "45", unit: "mins", badge: "Workout Finished", text: "💪 45-minute strength & conditioning workout completed!" },
  { id: "water_3l", emoji: "💧", title: "3L Water", metric: "water", value: "3.2", unit: "L", badge: "Hydration Master", text: "💧 Reached 3.2L hydration goal! Stay energized and hydrated." },
  { id: "streak_7d", emoji: "⚡", title: "7d Streak", metric: "streak", value: "7", unit: "days", badge: "Streak Milestone", text: "⚡ 7-Day workout streak unlocked! Momentum is unstoppable." },
];

type FeedFeatureHeaderProps = {
  communityId: string;
  selectedFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  onCreatePost?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  posts?: any[];
  onSelectUser?: (user: any) => void;
  selectedSort?: "latest" | "trending" | "top_streaks";
  onSortChange?: (sort: "latest" | "trending" | "top_streaks") => void;
  onQuickShareAchievement?: (preset: typeof QUICK_ACHIEVEMENT_PRESETS[0]) => void;
};

export function FeedFeatureHeader({
  communityId,
  selectedFilter,
  onFilterChange,
  onCreatePost,
  searchValue = "",
  onSearchChange,
  posts,
  onSelectUser,
  selectedSort = "latest",
  onSortChange,
  onQuickShareAchievement,
}: FeedFeatureHeaderProps) {
  const theme = useGlobalTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [hub, setHub] = useState<any>({ stories: [], challenges: [] });

  const topStreaks = useMemo(() => {
    if (hub?.topStreaks && Array.isArray(hub.topStreaks) && hub.topStreaks.length > 0) {
      return hub.topStreaks;
    }
    if (!posts || posts.length === 0) return [];
    const map = new Map<string, any>();
    for (const p of posts) {
      const u = p.createdBy;
      const s =
        typeof p.metadata?.streak === "number"
          ? p.metadata.streak
          : p.contentType === "workout" || p.contentType === "progress"
          ? 1
          : 0;
      if (u?._id && s > 0 && !map.has(u._id)) {
        map.set(u._id, {
          _id: u._id,
          userId: u._id,
          name: u.name || "Member",
          profilePic: u.profilePic || null,
          role: u.role || "Member",
          isVerified: !!u.isVerified,
          totalStreak: s,
        });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => (b.totalStreak || 0) - (a.totalStreak || 0))
      .slice(0, 12);
  }, [hub?.topStreaks, posts]);

  const [loading, setLoading] = useState(false);
  const [storyModal, setStoryModal] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [storyMedia, setStoryMedia] = useState<{ uri: string; type: "image" | "video"; fileName: string; mimeType?: string } | null>(null);
  const [submittingStory, setSubmittingStory] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [storyReply, setStoryReply] = useState("");
  const [storyActionBusy, setStoryActionBusy] = useState(false);
  const [challengeBusy, setChallengeBusy] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [feedCenterVisible, setFeedCenterVisible] = useState(false);
  const [feedCenterTab, setFeedCenterTab] = useState<"activity" | "archive" | "analytics">("activity");
  const [viewersVisible, setViewersVisible] = useState(false);
  const [viewersStoryId, setViewersStoryId] = useState("");
  const [storyIndex, setStoryIndex] = useState(0);

  const loadHub = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const response = await communityService.getFeedHub(communityId);
      if (response?.success) setHub(response.data || { stories: [], challenges: [] });
    } catch {
      // The classic feed remains usable if the new hub endpoint is unavailable.
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => { void loadHub(); }, [loadHub]);
  useEffect(() => {
    void asyncStorageUtils
      .checkIfKeyExistsInAsyncStorage<any>("user")
      .then((result) => {
        if (result.exists && result.data) {
          setCurrentUser(result.data);
          setCurrentUserId(String(result.data._id || ""));
        } else {
          setCurrentUser(null);
          setCurrentUserId("");
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setCurrentUserId("");
      });
  }, []);

  const publishStory = async () => {
    const text = storyText.trim();
    if ((!text && !storyMedia) || submittingStory) return;
    setSubmittingStory(true);
    try {
      let mediaUrl: string | undefined;
      if (storyMedia) {
        const safeName = storyMedia.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const uploadFolder = storyMedia.type === "video" ? "community/raw" : "community";
        const fileName = `${currentUserId || "user"}_story_${Date.now()}_${safeName}`;
        const storage = await userService.getStorageAccountDetails(uploadFolder, fileName);
        if (!storage?.success) throw new Error(storage?.message || "Unable to prepare story media");
        mediaUrl = await uploadToAzureFromExpo(
          storyMedia.uri,
          fileName,
          storage.data.sasToken,
          storage.data.storageAccountName,
          "admin-data",
          uploadFolder,
          undefined,
          storyMedia.mimeType
        );
      }
      const response = await communityService.createStory({
        communityId,
        text,
        audience: "public",
        mediaUrl,
        mediaType: storyMedia?.type,
        replyPermission: "everyone",
      });
      if (!response?.success) throw new Error(response?.message || "Unable to publish story");
      setStoryText("");
      setStoryMedia(null);
      setStoryModal(false);
      await loadHub();
      Alert.alert("Story Shared", "Your story is now visible to community members for 24 hours.");
    } catch (error: any) {
      Alert.alert("Story not published", error?.message || "Please try again.");
    } finally {
      setSubmittingStory(false);
    }
  };

  const pickStoryMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: false,
        quality: 0.85,
        videoMaxDuration: 60,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const type = asset.type === "video" ? "video" : "image";
      setStoryMedia({
        uri: asset.uri,
        type,
        fileName: asset.fileName || `story-${Date.now()}.${type === "video" ? "mp4" : "jpg"}`,
        mimeType: asset.mimeType || (type === "video" ? "video/mp4" : "image/jpeg"),
      });
      setStoryModal(true);
    } catch {
      Alert.alert("Media unavailable", "Unable to open your media library right now.");
    }
  };

  const openStory = async (story: any) => {
    setSelectedStory(story);
    setStoryIndex(Math.max(0, (hub.stories || []).findIndex((item: any) => item._id === story._id)));
    try {
      await communityService.feedAction({ entity: "story", storyId: story._id, action: "view" });
      setHub((current: any) => ({
        ...current,
        stories: (current.stories || []).map((item: any) =>
          item._id === story._id ? { ...item, viewedByUser: true } : item
        ),
      }));
    } catch {
      // Viewing must remain available if the analytics request fails.
    }
  };

  const storyAction = async (action: "react" | "reply" | "delete", value?: string) => {
    if (!selectedStory?._id || storyActionBusy) return;
    setStoryActionBusy(true);
    try {
      const response = await communityService.feedAction({
        entity: "story",
        storyId: selectedStory._id,
        action,
        value,
      });
      if (!response?.success) throw new Error(response?.message || "Unable to update story");
      if (action === "reply") {
        setStoryReply("");
        Alert.alert("Reply sent", "Your reply was sent privately to the story author.");
      } else if (action === "delete") {
        setSelectedStory(null);
        await loadHub();
      }
    } catch (error: any) {
      Alert.alert("Story not updated", error?.message || "Please try again.");
    } finally {
      setStoryActionBusy(false);
    }
  };

  const reportStory = async () => {
    if (!selectedStory?._id || !currentUserId || storyActionBusy) return;
    setStoryActionBusy(true);
    try {
      const response = await userService.addUserComplain({
        complainType: "story",
        complainerId: currentUserId,
        complainedId: selectedStory.createdBy?._id,
        postId: selectedStory._id,
      });
      if (!response?.success) throw new Error(response?.message || "Unable to report story");
      setSelectedStory(null);
      Alert.alert("Report received", "Our moderation team will review this story.");
    } catch (error: any) {
      Alert.alert("Report not sent", error?.message || "Please try again.");
    } finally {
      setStoryActionBusy(false);
    }
  };

  const activeChallenge = hub.challenges?.[0];
  const openFeedCenter = (tab: "activity" | "archive" | "analytics") => {
    setFeedCenterTab(tab);
    setFeedCenterVisible(true);
  };

  const storyProgressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startStoryProgress = useCallback(() => {
    storyProgressAnim.setValue(0);
    progressAnimationRef.current?.stop();
    progressAnimationRef.current = Animated.timing(storyProgressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    });
    progressAnimationRef.current.start(({ finished }) => {
      if (finished) {
        const stories = hub.stories || [];
        if (storyIndex < stories.length - 1) {
          const next = storyIndex + 1;
          setStoryIndex(next);
          void openStory(stories[next]);
        } else {
          setSelectedStory(null);
        }
      }
    });
  }, [hub.stories, storyIndex, storyProgressAnim]);

  useEffect(() => {
    if (selectedStory) {
      startStoryProgress();
    } else {
      progressAnimationRef.current?.stop();
      storyProgressAnim.setValue(0);
    }
    return () => {
      progressAnimationRef.current?.stop();
    };
  }, [selectedStory, storyIndex, startStoryProgress, storyProgressAnim]);

  const pauseStoryProgress = useCallback(() => {
    progressAnimationRef.current?.stop();
  }, []);

  const resumeStoryProgress = useCallback(() => {
    // Calculate remaining time based on current progress position
    let remainingDuration = 3000;
    (storyProgressAnim as any).__getValue && (() => {
      const currentValue = (storyProgressAnim as any).__getValue();
      remainingDuration = Math.max(500, (1 - currentValue) * 5000);
    })();
    progressAnimationRef.current = Animated.timing(storyProgressAnim, {
      toValue: 1,
      duration: remainingDuration,
      useNativeDriver: false,
    });
    progressAnimationRef.current.start(({ finished }) => {
      if (finished) {
        const stories = hub.stories || [];
        if (storyIndex < stories.length - 1) {
          const next = storyIndex + 1;
          setStoryIndex(next);
          void openStory(stories[next]);
        } else {
          setSelectedStory(null);
        }
      }
    });
  }, [hub.stories, storyIndex, storyProgressAnim]);

  const navigateStory = useCallback((direction: -1 | 1) => {
    const stories = hub.stories || [];
    const nextIndex = storyIndex + direction;
    if (nextIndex < 0) return;
    if (nextIndex >= stories.length) {
      setSelectedStory(null);
      return;
    }
    setStoryIndex(nextIndex);
    void openStory(stories[nextIndex]);
  }, [hub.stories, storyIndex]);

  const myStories = useMemo(() => {
    if (!currentUserId || !hub.stories) return [];
    return hub.stories.filter((item: any) => String(item.createdBy?._id || item.createdBy) === currentUserId);
  }, [currentUserId, hub.stories]);
  const hasMyStory = myStories.length > 0;

  return (
    <View style={styles.headerRoot}>
      <View style={styles.feedTools}>
        <Text style={styles.feedToolsTitle}>Community</Text>
        <View style={styles.feedToolActions}>
          <TouchableOpacity style={styles.feedToolButton} onPress={() => openFeedCenter("analytics")}>
            <Ionicons name="analytics-outline" size={19} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedToolButton} onPress={() => openFeedCenter("activity")}>
            <Ionicons name="notifications-outline" size={19} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        horizontal
        data={hub.stories || []}
        keyExtractor={(item: any) => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storyRail}
        ListHeaderComponent={(
          <View style={styles.storyItem}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (hasMyStory) {
                  void openStory(myStories[0]);
                } else {
                  void pickStoryMedia();
                }
              }}
            >
              <View style={[styles.storyRing, hasMyStory ? styles.storyRingActive : styles.storyRingMuted]}>
                <View style={styles.storyAvatarInner}>
                  {currentUser?.profilePic ? (
                    <Image source={{ uri: currentUser.profilePic }} style={styles.storyAvatarImage} />
                  ) : (
                    <Text style={styles.storyInitial}>
                      {currentUser?.name?.[0]?.toUpperCase() || "YOU"}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.addStoryBadge}
                activeOpacity={0.85}
                onPress={() => void pickStoryMedia()}
              >
                <Ionicons name="add" size={14} color="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.storyName}>Your story</Text>
          </View>
        )}
        ListEmptyComponent={loading ? <ActivityIndicator style={styles.hubLoader} color={theme.colors.secondPrimary} /> : null}
        renderItem={({ item }: any) => {
          if (String(item.createdBy?._id || item.createdBy) === currentUserId) {
            return null;
          }
          const isViewed = item.viewedByUser;
          return (
            <TouchableOpacity
              style={styles.storyItem}
              activeOpacity={0.8}
              onPress={() => void openStory(item)}
            >
              <View style={[styles.storyRing, isViewed ? styles.storyRingViewed : styles.storyRingActive]}>
                <View style={styles.storyAvatarInner}>
                  {item.createdBy?.profilePic ? (
                    <Image source={{ uri: item.createdBy.profilePic }} style={styles.storyAvatarImage} />
                  ) : (
                    <Text style={styles.storyInitial}>
                      {item.createdBy?.name?.[0]?.toUpperCase() || "M"}
                    </Text>
                  )}
                </View>
              </View>
              <Text numberOfLines={1} style={styles.storyName}>
                {item.createdBy?.name || "Member"}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {hub.highlights?.length ? (
        <View>
          <View style={styles.highlightHeader}><Text style={styles.highlightTitle}>Highlights</Text><TouchableOpacity onPress={() => openFeedCenter("archive")}><Text style={styles.highlightManage}>Manage</Text></TouchableOpacity></View>
          <FlatList horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightRail} data={hub.highlights} keyExtractor={(item: any) => item._id} renderItem={({ item }: any) => <TouchableOpacity style={styles.highlightItem} onPress={() => setSelectedStory({ ...item, _id: item.originalStoryId, isHighlight: true })}><View style={styles.highlightCircle}>{item.mediaUrl && item.mediaType === "image" ? <Image source={{ uri: item.mediaUrl }} style={styles.highlightImage} /> : <Ionicons name="star" size={22} color={theme.colors.secondPrimary} />}</View><Text numberOfLines={1} style={styles.highlightName}>{item.title}</Text></TouchableOpacity>} />
        </View>
      ) : null}

      {topStreaks.length > 0 ? (
        <View style={styles.topStreakContainer}>
          <View style={styles.topStreakHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Ionicons name="flame" size={17} color="#FF7A00" />
              <Text style={styles.topStreakSectionTitle}>Streak Champions</Text>
            </View>
            <Text style={styles.topStreakSectionSubtitle}>Leaderboard</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topStreakRail}
            data={topStreaks}
            keyExtractor={(item) => String(item.userId || item._id)}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.topStreakCard}
                activeOpacity={0.8}
                onPress={() => onSelectUser?.(item)}
              >
                <View style={styles.topStreakAvatarContainer}>
                  {item.profilePic ? (
                    <Image source={{ uri: item.profilePic }} style={styles.topStreakAvatar} />
                  ) : (
                    <View style={styles.topStreakAvatarFallback}>
                      <Text style={styles.topStreakInitial}>
                        {item.name?.[0]?.toUpperCase() || "M"}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.rankBadge,
                      index === 0
                        ? styles.rank1
                        : index === 1
                        ? styles.rank2
                        : index === 2
                        ? styles.rank3
                        : styles.rankOther,
                    ]}
                  >
                    <Text style={styles.rankBadgeText}>{index + 1}</Text>
                  </View>
                </View>
                <Text numberOfLines={1} style={styles.topStreakName}>
                  {item.name || "Member"}
                </Text>
                <View style={styles.streakBadgePill}>
                  <Ionicons name="flame" size={11} color="#FF7A00" />
                  <Text style={styles.streakBadgePillText}>{item.totalStreak}d</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
        <TextInput
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder="Search posts, people or topics"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchValue ? <TouchableOpacity onPress={() => onSearchChange?.("")}><Ionicons name="close-circle" size={18} color={theme.colors.textMuted} /></TouchableOpacity> : null}
      </View>

      {activeChallenge ? (
        <TouchableOpacity
          style={styles.challengeCard}
          disabled={challengeBusy}
          onPress={async () => {
            if (challengeBusy) return;
            setChallengeBusy(true);
            try {
              const response = await communityService.feedAction({ entity: "challenge", challengeId: activeChallenge._id, joined: !activeChallenge.joinedByUser });
              if (!response?.success) throw new Error(response?.message || "Unable to update challenge");
              await loadHub();
            } catch (error: any) {
              Alert.alert("Challenge not updated", error?.message || "Please try again.");
            } finally {
              setChallengeBusy(false);
            }
          }}
        >
          <View style={styles.challengeIcon}><Ionicons name="trophy" size={22} color="#FFD700" /></View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.challengeLabel}>COMMUNITY CHALLENGE</Text>
              <View style={styles.liveChallengePill}>
                <Text style={styles.liveChallengeText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.challengeTitle}>{activeChallenge.title}</Text>
            {activeChallenge.description ? <Text numberOfLines={1} style={styles.challengeDescription}>{activeChallenge.description}</Text> : null}
            <Text style={styles.challengeMeta}>
              {activeChallenge.target ? `${activeChallenge.target} ${activeChallenge.metric || "target"} · ` : ""}{activeChallenge.participantCount || 0} members joined
            </Text>
          </View>
          {challengeBusy ? <ActivityIndicator size="small" color={theme.colors.secondPrimary} /> : (
            <View style={[styles.challengeActionPill, activeChallenge.joinedByUser && styles.challengeActionPillJoined]}>
              <Text style={[styles.challengeAction, activeChallenge.joinedByUser && styles.challengeActionJoined]}>
                {activeChallenge.joinedByUser ? "Joined ✓" : "Join"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ) : null}

      {/* 1-Tap Share Workout / Goal Achieved Rail */}
      <View style={styles.quickWinSection}>
        <View style={styles.quickWinHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="sparkles" size={15} color="#FF7A00" />
            <Text style={styles.quickWinTitle}>1-Tap Share Win</Text>
          </View>
          <Text style={styles.quickWinSubtitle}>Tap to post card to feed</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickWinRail}
        >
          {QUICK_ACHIEVEMENT_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              activeOpacity={0.75}
              style={styles.quickWinChip}
              onPress={() => onQuickShareAchievement?.(preset)}
            >
              <Text style={styles.quickWinEmoji}>{preset.emoji}</Text>
              <View>
                <Text style={styles.quickWinName}>{preset.title}</Text>
                <Text style={styles.quickWinValue}>{preset.value} {preset.unit}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed Filters */}
      <FlatList
        horizontal
        data={[
          ["explore", "Explore", "compass-outline"],
          ["following", "Following", "people-outline"],
          ["company", "Company", "business-outline"],
          ["saved", "Saved", "bookmark-outline"],
        ]}
        keyExtractor={(item) => item[0]}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRail}
        renderItem={({ item }) => {
          const active = selectedFilter === item[0];
          return (
            <TouchableOpacity style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => onFilterChange(item[0] as FeedFilter)}>
              <Ionicons name={item[2] as any} size={15} color={active ? theme.colors.dark : theme.colors.textSecondary} />
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item[1]}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Feed Sorting Controls: Latest, Trending / Hot, Top Streaks */}
      <View style={styles.sortRailContainer}>
        <View style={styles.sortRail}>
          {[
            { id: "latest", label: "Latest", icon: "time-outline" },
            { id: "trending", label: "Trending 🔥", icon: "flame-outline" },
            { id: "top_streaks", label: "Top Streaks ⚡", icon: "trophy-outline" },
          ].map((item) => {
            const active = (selectedSort || "latest") === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={[styles.sortChip, active && styles.sortChipActive]}
                onPress={() => onSortChange?.(item.id as any)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={13}
                  color={active ? "#FFFFFF" : theme.colors.textSecondary}
                />
                <Text
                  style={[styles.sortText, active && styles.sortTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Modal transparent visible={storyModal} animationType="fade" onRequestClose={() => setStoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.storyComposer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Community Story</Text>
                <Text style={styles.modalSubtitle}>Visible to community members · 24 hours</Text>
              </View>
              <TouchableOpacity onPress={() => { setStoryModal(false); setStoryMedia(null); setStoryText(""); }}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {storyMedia ? (
              <View style={styles.storyMediaPreview}>
                {storyMedia.type === "image" ? (
                  <Image source={{ uri: storyMedia.uri }} style={styles.storyMediaImage} resizeMode="cover" />
                ) : (
                  <View style={styles.storyVideoPreview}>
                    <Ionicons name="videocam" size={28} color={theme.colors.secondPrimary} />
                    <Text style={styles.storyVideoText}>Video attached · ready to share</Text>
                  </View>
                )}
                <View style={styles.storyMediaOverlayBar}>
                  <TouchableOpacity style={styles.storyMediaOverlayBtn} onPress={() => void pickStoryMedia()}>
                    <Ionicons name="swap-horizontal" size={16} color="#FFF" />
                    <Text style={styles.storyMediaOverlayBtnText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.storyMediaOverlayBtn, { backgroundColor: "rgba(220,53,69,0.8)" }]} onPress={() => setStoryMedia(null)}>
                    <Ionicons name="trash-outline" size={16} color="#FFF" />
                    <Text style={styles.storyMediaOverlayBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            <TextInput
              autoFocus={!storyMedia}
              multiline
              maxLength={500}
              value={storyText}
              onChangeText={setStoryText}
              placeholder={storyMedia ? "Add a caption… (optional)" : "What are you working on today?"}
              placeholderTextColor={theme.colors.textMuted}
              style={storyMedia ? styles.storyCaptionInput : styles.storyInput}
            />

            <View style={styles.stickerSection}>
              <Text style={styles.stickerSectionTitle}>Quick Fitness Badges & Stickers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyStickerBar}>
                {STORY_STICKERS.map((sticker) => (
                  <TouchableOpacity
                    key={sticker}
                    style={styles.storyStickerChip}
                    onPress={() => {
                      setStoryText((prev) => (prev ? `${prev} ${sticker}` : sticker));
                    }}
                  >
                    <Text style={styles.storyStickerText}>{sticker}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {!storyMedia ? (
              <TouchableOpacity style={styles.storyMediaPicker} onPress={() => void pickStoryMedia()}>
                <Ionicons name="images-outline" size={20} color={theme.colors.secondPrimary} />
                <Text style={styles.storyMediaPickerText}>Add photo or short video</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.storyScopeNotice}>
              <Ionicons name="people-outline" size={15} color={theme.colors.secondPrimary} />
              <Text style={styles.storyScopeNoticeText}>Only members of this community can view your story.</Text>
            </View>

            <TouchableOpacity
              disabled={(!storyText.trim() && !storyMedia) || submittingStory}
              onPress={publishStory}
              style={[styles.publishButton, ((!storyText.trim() && !storyMedia) || submittingStory) && styles.disabledButton]}
            >
              {submittingStory ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator color={theme.colors.dark} size="small" />
                  <Text style={styles.publishText}>Sharing story…</Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="arrow-up-circle" size={20} color={theme.colors.dark} />
                  <Text style={styles.publishText}>Share to Community Story</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!selectedStory} animationType="fade" onRequestClose={() => { setViewersVisible(false); setSelectedStory(null); }}>
        <View style={styles.storyViewerOverlay}>
          <View style={styles.storyViewerCard}>
            {!selectedStory?.isHighlight ? (
              <View style={styles.storyProgressRow}>
                {(hub.stories || []).map((_: any, index: number) => {
                  const isPassed = index < storyIndex;
                  const isCurrent = index === storyIndex;
                  return (
                    <View key={index} style={styles.storyProgressTrack}>
                      {isPassed ? (
                        <View style={[styles.storyProgressFill, { width: "100%" }]} />
                      ) : isCurrent ? (
                        <Animated.View
                          style={[
                            styles.storyProgressFill,
                            {
                              width: storyProgressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                              }),
                            },
                          ]}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
            <View style={styles.storyViewerTop}>
              <View style={styles.storyViewerAuthor}>
                <View style={styles.storyViewerAvatar}>
                  {selectedStory?.createdBy?.profilePic ? (
                    <Image source={{ uri: selectedStory.createdBy.profilePic }} style={styles.storyViewerAvatarImg} />
                  ) : (
                    <Text style={styles.storyInitial}>{selectedStory?.createdBy?.name?.[0]?.toUpperCase() || "I"}</Text>
                  )}
                </View>
                <View>
                  <Text style={styles.storyViewerName}>{selectedStory?.createdBy?.name || "Member"}</Text>
                  <Text style={styles.storyViewerMeta}>
                    {selectedStory?.createdAt ? new Date(selectedStory.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Daily story"} · Community Story
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => { setViewersVisible(false); setSelectedStory(null); }}>
                <Ionicons name="close" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Pressable
              style={styles.storyBody}
              onPressIn={pauseStoryProgress}
              onPressOut={resumeStoryProgress}
            >
              {selectedStory?.mediaUrl && selectedStory?.mediaType === "image" ? (
                <Image source={{ uri: selectedStory.mediaUrl }} style={styles.storyViewerMedia} resizeMode="contain" />
              ) : null}
              {selectedStory?.mediaUrl && selectedStory?.mediaType === "video" ? (
                <Video source={{ uri: selectedStory.mediaUrl }} style={styles.storyViewerMedia} useNativeControls shouldPlay isLooping resizeMode={ResizeMode.CONTAIN} />
              ) : null}
              {selectedStory?.text ? (
                <Text style={[styles.storyBodyText, selectedStory?.mediaUrl && styles.storyBodyCaption]}>
                  {selectedStory.text}
                </Text>
              ) : null}

              {/* Invisible tap zones for quick prev/next navigation */}
              <TouchableOpacity
                style={styles.storyTapZoneLeft}
                activeOpacity={1}
                onPress={() => navigateStory(-1)}
              />
              <TouchableOpacity
                style={styles.storyTapZoneRight}
                activeOpacity={1}
                onPress={() => navigateStory(1)}
              />
            </Pressable>
            {!selectedStory?.isHighlight ? (
              <View style={styles.storyNavRow}>
                <TouchableOpacity disabled={storyIndex <= 0} onPress={() => navigateStory(-1)} style={[styles.storyNavButton, storyIndex <= 0 && styles.disabledButton]}>
                  <Ionicons name="chevron-back" size={19} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.storyNavText}>{storyIndex + 1} / {(hub.stories || []).length}</Text>
                <TouchableOpacity disabled={storyIndex >= (hub.stories || []).length - 1} onPress={() => navigateStory(1)} style={[styles.storyNavButton, storyIndex >= (hub.stories || []).length - 1 && styles.disabledButton]}>
                  <Ionicons name="chevron-forward" size={19} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : null}
            {!selectedStory?.isHighlight ? (
              <View style={styles.storyReactionRow}>
                {["💪", "🔥", "👏", "❤️", "😂"].map((emoji) => (
                  <TouchableOpacity key={emoji} disabled={storyActionBusy} style={styles.storyReactionButton} onPress={() => void storyAction("react", emoji)}>
                    <Text style={styles.storyReactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
                {String(selectedStory?.createdBy?._id || selectedStory?.createdBy) === currentUserId ? (
                  <TouchableOpacity
                    disabled={storyActionBusy}
                    style={styles.storyUtilityButton}
                    onPress={() => Alert.alert("Delete story?", "This removes your story for this community.", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => void storyAction("delete") },
                    ])}
                  >
                    <Ionicons name="trash-outline" size={19} color={theme.colors.error} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity disabled={storyActionBusy} style={styles.storyUtilityButton} onPress={() => void reportStory()}>
                    <Ionicons name="flag-outline" size={19} color="rgba(255, 255, 255, 0.8)" />
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
            {String(selectedStory?.createdBy?._id || selectedStory?.createdBy) === currentUserId && !selectedStory?.isHighlight ? (
              <TouchableOpacity style={styles.viewerButton} onPress={() => { setViewersStoryId(selectedStory._id); setSelectedStory(null); setViewersVisible(true); }}>
                <Ionicons name="eye-outline" size={17} color="#D1A7FF" />
                <Text style={styles.viewerButtonText}>{selectedStory?.viewerCount || 0} viewers · View list</Text>
              </TouchableOpacity>
            ) : null}
            {String(selectedStory?.createdBy?._id || selectedStory?.createdBy) === currentUserId && selectedStory?.replies?.length ? (
              <View style={styles.storyRepliesCard}>
                <Text style={styles.storyRepliesTitle}>Private replies</Text>
                {selectedStory.replies.slice(-3).map((reply: any, index: number) => (
                  <Text key={reply._id || index} numberOfLines={2} style={styles.storyReplyText}>
                    <Text style={styles.storyReplyAuthor}>{reply.user?.name || "Member"}: </Text>{reply.text}
                  </Text>
                ))}
              </View>
            ) : null}
            {String(selectedStory?.createdBy?._id || selectedStory?.createdBy) !== currentUserId ? (
              <View style={styles.storyReplyRow}>
                <TextInput
                  value={storyReply}
                  onChangeText={setStoryReply}
                  maxLength={500}
                  placeholder="Reply privately…"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  style={styles.storyReplyInput}
                />
                <TouchableOpacity disabled={!storyReply.trim() || storyActionBusy} style={[styles.storyReplySend, (!storyReply.trim() || storyActionBusy) && styles.disabledButton]} onPress={() => void storyAction("reply", storyReply.trim())}>
                  {storyActionBusy ? <ActivityIndicator size="small" color={theme.colors.dark} /> : <Ionicons name="send" size={18} color={theme.colors.dark} />}
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
      <FeedExtrasModal visible={feedCenterVisible} communityId={communityId} initialTab={feedCenterTab} onClose={() => setFeedCenterVisible(false)} />
      <StoryViewersModal visible={viewersVisible} communityId={communityId} storyId={viewersStoryId} onClose={() => { setViewersVisible(false); setViewersStoryId(""); }} />
    </View>
  );
}

export function RichPostContent({ post, onChanged }: { post: any; onChanged: (updates: any) => void }) {
  const theme = useGlobalTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const type = post.contentType || "regular";
  const options = Array.isArray(post.metadata?.pollOptions) ? post.metadata.pollOptions : [];
  const pollTotal = Object.values(post.pollVoteCounts || {}).reduce((total: number, count: any) => total + Number(count || 0), 0);
  const [busy, setBusy] = useState(false);
  const labelMap: Record<string, [string, string]> = {
    progress: ["Progress update", "trending-up-outline"], workout: ["Workout check-in", "barbell-outline"],
    poll: ["Community poll", "stats-chart-outline"], question: ["Trainer Q&A", "help-circle-outline"],
    exercise: ["Exercise demo", "fitness-outline"], recipe: ["Recipe & macros", "restaurant-outline"],
    milestone: ["Milestone", "trophy-outline"], session: ["Session highlight", "calendar-outline"],
    event: ["Community event", "people-outline"], weekly_recap: ["Weekly recap", "ribbon-outline"],
  };
  const descriptor = labelMap[type];
  const detailItems = (() => {
    const metadata = post.metadata || {};
    if (type === "progress") return [["Metric", metadata.metric], ["Result", metadata.change]];
    if (type === "workout" || type === "session") return [["Duration", metadata.duration], ["Intensity", metadata.intensity]];
    if (type === "exercise") return [["Sets", metadata.sets], ["Reps", metadata.reps]];
    if (type === "recipe") return [["Calories", metadata.calories], ["Protein", metadata.protein ? `${metadata.protein}g` : ""]];
    if (type === "event") return [["Starts", metadata.startsAt], ["Location", metadata.location]];
    if (type === "milestone" || type === "weekly_recap") return [["Highlight", metadata.highlight], ["Next goal", metadata.nextGoal]];
    return [];
  })().filter((item) => item[1]);

  const action = async (kind: string, value?: unknown) => {
    if (!post._id || busy) return;
    setBusy(true);
    try {
      const response = await communityService.feedAction({ kind, postId: post._id, value });
      if (!response?.success) throw new Error(response?.message);
      if (kind === "poll_vote") {
        const counts = { ...(post.pollVoteCounts || {}) };
        const previous = post.userPollVote;
        if (previous !== undefined && previous !== null) counts[String(previous)] = Math.max(0, Number(counts[String(previous)] || 0) - 1);
        counts[String(value)] = Number(counts[String(value)] || 0) + 1;
        onChanged({ userPollVote: value, pollVoteCounts: counts });
      }
      if (kind === "rsvp") onChanged({ userRsvp: value });
      if (kind === "reaction") {
        const previous = post.userReaction;
        const counts = { ...(post.reactionCounts || {}) };
        if (previous) counts[previous] = Math.max(0, Number(counts[previous] || 0) - 1);
        counts[String(value)] = Number(counts[String(value)] || 0) + 1;
        onChanged({ userReaction: value, reactionCounts: counts });
      }
    } catch (error: any) {
      Alert.alert("Unable to update", error?.message || "Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <View>
      {post.publishingStatus && post.publishingStatus !== "published" ? (
        <View style={styles.publishStatusBadge}>
          <Ionicons name={post.publishingStatus === "draft" ? "document-text-outline" : "time-outline"} size={14} color={theme.colors.textSecondary} />
          <Text style={styles.publishStatusText}>
            {post.publishingStatus === "draft" ? "Draft — only visible to you" : `Scheduled${post.scheduledAt ? ` · ${new Date(post.scheduledAt).toLocaleDateString()}` : ""}`}
          </Text>
        </View>
      ) : null}
      {post.challengeBadge ? (
        <View style={styles.challengePostBadge}>
          <Ionicons name="trophy" size={13} color="#FFD700" />
          <Text style={styles.challengePostBadgeText}>
            {post.challengeBadge.title || "Community Challenge"}
          </Text>
        </View>
      ) : null}
      {type === "achievement" ? (
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <View style={styles.achievementIconCircle}>
              <Ionicons
                name={
                  post.metadata?.metric === "steps"
                    ? "footsteps"
                    : post.metadata?.metric === "water"
                    ? "water"
                    : post.metadata?.metric === "calories"
                    ? "flame"
                    : "barbell"
                }
                size={22}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.achievementBadgeTitle}>
                {post.metadata?.badge || "GOAL COMPLETED"}
              </Text>
              <Text style={styles.achievementHeadline}>
                {post.metadata?.highlight || "Daily Achievement"}
              </Text>
            </View>
            {post.metadata?.streak ? (
              <View style={styles.achievementStreakPill}>
                <Ionicons name="flame" size={12} color="#FF7A00" />
                <Text style={styles.achievementStreakText}>
                  {post.metadata.streak}d Streak
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.achievementStatBox}>
            <Text style={styles.achievementStatNumber}>
              {post.metadata?.value || "10,240"}
            </Text>
            <Text style={styles.achievementStatUnit}>
              {post.metadata?.unit || "steps"}
            </Text>
          </View>
        </View>
      ) : null}
      {descriptor ? (
        <View style={styles.typeBadge}>
          <Ionicons name={descriptor[1] as any} size={14} color={theme.colors.secondPrimary} />
          <Text style={styles.typeBadgeText}>{descriptor[0]}</Text>
        </View>
      ) : null}
      {post.isSensitive ? (
        <View style={styles.warningCard}><Ionicons name="eye-off-outline" size={18} color={theme.colors.warning} /><Text style={styles.warningText}>Content warning — tap media only if you want to view it.</Text></View>
      ) : null}
      {options.length > 0 ? (
        <View style={styles.pollCard}>
          {options.map((option: string, index: number) => (
            <TouchableOpacity key={`${option}-${index}`} disabled={busy} onPress={() => action("poll_vote", index)} style={[styles.pollOption, post.userPollVote === index && styles.pollOptionSelected]}>
              {pollTotal > 0 ? <View style={[styles.pollResultFill, { width: `${Math.round((Number(post.pollVoteCounts?.[String(index)] || 0) / pollTotal) * 100)}%` as any }]} /> : null}
              <Text style={styles.pollOptionText}>{option}</Text>
              <View style={styles.pollResultMeta}>
                {pollTotal > 0 ? <Text style={styles.pollPercent}>{Math.round((Number(post.pollVoteCounts?.[String(index)] || 0) / pollTotal) * 100)}%</Text> : null}
                {post.userPollVote === index ? <Ionicons name="checkmark-circle" size={20} color={theme.colors.secondPrimary} /> : null}
              </View>
            </TouchableOpacity>
          ))}
          {pollTotal > 0 ? <Text style={styles.pollVotes}>{pollTotal} {pollTotal === 1 ? "vote" : "votes"}</Text> : null}
        </View>
      ) : null}
      {detailItems.length ? (
        <View style={styles.detailRow}>
          {detailItems.map(([label, value]) => (
            <View key={String(label)} style={styles.detailChip}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text numberOfLines={2} style={styles.detailValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {post.hashtags?.length ? <Text style={styles.hashtags}>{post.hashtags.map((tag: string) => `#${tag}`).join("  ")}</Text> : null}
      <View style={styles.reactionRow}>
        {[["strong", "💪"], ["inspired", "🔥"], ["support", "👏"]].map(([value, emoji]) => (
          <TouchableOpacity key={value} disabled={busy} style={[styles.reactionChip, post.userReaction === value && styles.reactionChipActive]} onPress={() => action("reaction", value)}>
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            {Number(post.reactionCounts?.[value] || 0) > 0 ? <Text style={styles.reactionCount}>{post.reactionCounts[value]}</Text> : null}
          </TouchableOpacity>
        ))}
      </View>
      {type === "event" && post.metadata?.startsAt ? (
        <TouchableOpacity style={styles.inlineAction} onPress={() => action("rsvp", "going")}><Ionicons name="calendar-outline" size={18} color={theme.colors.dark} /><Text style={styles.inlineActionText}>{post.userRsvp === "going" ? "Going" : "RSVP to event"}</Text></TouchableOpacity>
      ) : null}
      {type === "recipe" && post.metadata?.calories ? (
        <TouchableOpacity style={styles.inlineAction} onPress={() => Alert.alert("Added", "This recipe is ready to add to your diet plan.")}><Ionicons name="restaurant-outline" size={18} color={theme.colors.dark} /><Text style={styles.inlineActionText}>{post.metadata.calories} kcal · Add to diet plan</Text></TouchableOpacity>
      ) : null}
    </View>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  headerRoot: { backgroundColor: theme.colors.background, paddingBottom: 8 },
  feedTools: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10 },
  feedToolsTitle: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 19 },
  feedToolActions: { flexDirection: "row", gap: 8 },
  feedToolButton: { alignItems: "center", backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  storyRail: { gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  storyItem: { alignItems: "center", width: 72 },
  storyRing: { alignItems: "center", borderRadius: 34, height: 68, justifyContent: "center", width: 68, padding: 2.5 },
  storyRingActive: { borderColor: theme.colors.secondPrimary, borderWidth: 2.5 },
  storyRingViewed: { borderColor: theme.colors.border, borderWidth: 1.5 },
  storyRingMuted: { borderColor: theme.colors.border, borderWidth: 1.5, borderStyle: "dashed" },
  storyAvatarInner: { alignItems: "center", backgroundColor: theme.colors.backgroundCardLight, borderRadius: 28, height: 56, justifyContent: "center", overflow: "hidden", width: 56 },
  storyAvatarImage: { height: "100%", width: "100%" },
  addStoryBadge: { alignItems: "center", backgroundColor: theme.colors.secondPrimary, borderColor: theme.colors.background, borderRadius: 11, borderWidth: 2, bottom: -1, height: 22, justifyContent: "center", position: "absolute", right: -1, width: 22 },
  storyInitial: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold, fontSize: 18 },
  storyName: { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, fontSize: 11, marginTop: 5, maxWidth: 70, textAlign: "center" },
  hubLoader: { height: 68, justifyContent: "center", width: 50 },
  highlightHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
  highlightTitle: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 13 },
  highlightManage: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold, fontSize: 11 },
  highlightRail: { gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  highlightItem: { alignItems: "center", width: 64 },
  highlightCircle: { alignItems: "center", backgroundColor: theme.colors.backgroundCardLight, borderColor: theme.colors.border, borderRadius: 27, borderWidth: 1, height: 54, justifyContent: "center", overflow: "hidden", width: 54 },
  highlightImage: { height: "100%", width: "100%" },
  highlightName: { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, fontSize: 9, marginTop: 5, maxWidth: 64 },
  quickCard: { alignItems: "center", backgroundColor: theme.colors.backgroundCardLight, borderColor: theme.colors.secondPrimary + "35", borderRadius: 20, borderWidth: 1, flexDirection: "row", marginHorizontal: 16, padding: 16 },
  quickCopy: { flex: 1, paddingRight: 12 },
  quickEyebrow: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold, fontSize: 9, letterSpacing: 1.1 },
  quickTitle: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 17, marginTop: 4 },
  quickSubtitle: { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 3 },
  quickButton: { alignItems: "center", backgroundColor: theme.colors.primary, borderRadius: 24, height: 48, justifyContent: "center", width: 48 },
  challengeCard: { alignItems: "center", backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, marginHorizontal: 16, marginTop: 10, padding: 14 },
  challengeIcon: { alignItems: "center", backgroundColor: theme.colors.backgroundCardLight, borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  challengeLabel: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold, fontSize: 8, letterSpacing: 1 },
  challengeTitle: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 14, marginTop: 2 },
  challengeDescription: { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular, fontSize: 10, marginTop: 2 },
  challengeMeta: { color: theme.colors.textMuted, fontSize: 10, marginTop: 2 },
  challengeAction: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold, fontSize: 12 },
  filterRail: { gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  filterChip: { alignItems: "center", backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 6, paddingHorizontal: 13, paddingVertical: 9 },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, fontSize: 12 },
  filterTextActive: { color: theme.colors.dark, fontFamily: theme.fonts.bold },
  searchBar: { alignItems: "center", backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, marginHorizontal: 16, marginTop: 12, minHeight: 44, paddingHorizontal: 12 },
  searchInput: { color: theme.colors.text, flex: 1, fontFamily: theme.fonts.regular, fontSize: 12, paddingVertical: 10 },
  modalOverlay: { alignItems: "center", backgroundColor: theme.colors.overlay, flex: 1, justifyContent: "center", padding: 22 },
  storyComposer: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: 24, borderWidth: 1, padding: 18, width: "100%", maxHeight: "90%" },
  modalHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 18 },
  modalSubtitle: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: 11, marginTop: 2 },
  storyInput: { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 16, borderWidth: 1, color: theme.colors.text, fontFamily: theme.fonts.regular, marginVertical: 14, minHeight: 140, padding: 16, textAlignVertical: "top", fontSize: 14 },
  storyCaptionInput: { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, color: theme.colors.text, fontFamily: theme.fonts.regular, marginBottom: 12, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 },
  storyMediaPicker: { alignItems: "center", borderColor: theme.colors.secondPrimary + "55", borderRadius: 14, borderStyle: "dashed", borderWidth: 1.5, flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 14, padding: 14, backgroundColor: theme.colors.backgroundCardLight },
  storyMediaPickerText: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold, fontSize: 13 },
  storyMediaPreview: { borderRadius: 16, marginBottom: 12, overflow: "hidden", position: "relative" },
  storyMediaImage: { backgroundColor: theme.colors.backgroundSecondary, height: 220, width: "100%" },
  storyVideoPreview: { alignItems: "center", backgroundColor: theme.colors.backgroundSecondary, flexDirection: "row", gap: 12, height: 110, justifyContent: "center", padding: 16, width: "100%" },
  storyVideoText: { color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: 12 },
  storyMediaOverlayBar: { bottom: 10, flexDirection: "row", gap: 8, position: "absolute", right: 10 },
  storyMediaOverlayBtn: { alignItems: "center", backgroundColor: "rgba(0,0,0,0.72)", borderRadius: 14, flexDirection: "row", gap: 4, paddingHorizontal: 10, paddingVertical: 6 },
  storyMediaOverlayBtnText: { color: "#FFF", fontFamily: theme.fonts.bold, fontSize: 11 },
  storyScopeNotice: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, paddingHorizontal: 4 },
  storyScopeNoticeText: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: 11 },
  stickerSection: { marginVertical: 6 },
  stickerSectionTitle: { color: theme.colors.textMuted, fontFamily: theme.fonts.medium, fontSize: 11, marginBottom: 6 },
  storyStickerBar: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  storyStickerChip: { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  storyStickerText: { color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: 12 },
  publishButton: { alignItems: "center", backgroundColor: theme.colors.primary, borderRadius: 14, minHeight: 48, justifyContent: "center" },
  disabledButton: { opacity: 0.45 }, publishText: { color: theme.colors.dark, fontFamily: theme.fonts.bold, fontSize: 14 },
  storyViewerOverlay: { backgroundColor: "rgba(0, 0, 0, 0.94)", flex: 1, justifyContent: "center", padding: 14 },
  storyViewerCard: { backgroundColor: "#141416", borderColor: "rgba(255, 255, 255, 0.12)", borderRadius: 26, borderWidth: 1, overflow: "hidden", padding: 18 },
  storyProgressRow: { flexDirection: "row", gap: 4, marginBottom: 13 },
  storyProgressTrack: { backgroundColor: "rgba(255, 255, 255, 0.22)", borderRadius: 2, flex: 1, height: 3, overflow: "hidden" },
  storyProgressFill: { backgroundColor: theme.colors.secondPrimary, height: "100%" },
  storyProgress: { backgroundColor: "rgba(255, 255, 255, 0.22)", borderRadius: 2, flex: 1, height: 3 },
  storyProgressActive: { backgroundColor: theme.colors.secondPrimary },
  storyTapZoneLeft: { bottom: 0, left: 0, position: "absolute", top: 0, width: "35%", zIndex: 10 },
  storyTapZoneRight: { bottom: 0, position: "absolute", right: 0, top: 0, width: "65%", zIndex: 10 },
  storyViewerTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  storyViewerAuthor: { alignItems: "center", flexDirection: "row", gap: 10 },
  storyViewerAvatar: { alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.12)", borderColor: theme.colors.secondPrimary, borderRadius: 20, borderWidth: 1.5, height: 40, justifyContent: "center", overflow: "hidden", width: 40 },
  storyViewerAvatarImg: { height: "100%", width: "100%" },
  storyViewerName: { color: "#FFFFFF", fontFamily: theme.fonts.bold, fontSize: 14 },
  storyViewerMeta: { color: "rgba(255, 255, 255, 0.7)", fontFamily: theme.fonts.regular, fontSize: 10, marginTop: 2 },
  storyBody: { alignItems: "center", backgroundColor: "#09090B", borderRadius: 22, justifyContent: "center", marginVertical: 18, minHeight: 270, overflow: "hidden", padding: 14 },
  storyViewerMedia: { borderRadius: 16, height: 260, width: "100%" },
  storyBodyText: { color: "#FFFFFF", fontFamily: theme.fonts.bold, fontSize: 22, lineHeight: 30, textAlign: "center" },
  storyBodyCaption: { backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 10, color: "#FFFFFF", fontSize: 13, lineHeight: 18, marginTop: 8, paddingHorizontal: 12, paddingVertical: 6 },
  storyNavRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  storyNavButton: { alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.14)", borderColor: "rgba(255, 255, 255, 0.1)", borderRadius: 17, borderWidth: 1, height: 34, justifyContent: "center", width: 42 },
  storyNavText: { color: "rgba(255, 255, 255, 0.75)", fontFamily: theme.fonts.medium, fontSize: 10 },
  storyReactionRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  storyReactionButton: { alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.12)", borderColor: "rgba(255, 255, 255, 0.08)", borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 42 },
  storyReactionEmoji: { fontSize: 18 },
  storyUtilityButton: { alignItems: "center", borderColor: "rgba(255, 255, 255, 0.2)", borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", marginLeft: "auto", width: 40 },
  viewerButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "rgba(151, 71, 255, 0.24)", borderRadius: 14, flexDirection: "row", gap: 7, marginTop: 12, paddingHorizontal: 12, paddingVertical: 8 },
  viewerButtonText: { color: "#D1A7FF", fontFamily: theme.fonts.bold, fontSize: 11 },
  storyRepliesCard: { backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: 13, gap: 5, marginTop: 13, padding: 11 },
  storyRepliesTitle: { color: "rgba(255, 255, 255, 0.6)", fontFamily: theme.fonts.bold, fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase" },
  storyReplyText: { color: "rgba(255, 255, 255, 0.85)", fontFamily: theme.fonts.regular, fontSize: 11, lineHeight: 16 },
  storyReplyAuthor: { color: "#FFFFFF", fontFamily: theme.fonts.bold },
  storyReplyRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 14 },
  storyReplyInput: { backgroundColor: "rgba(255, 255, 255, 0.12)", borderColor: "rgba(255, 255, 255, 0.16)", borderRadius: 18, borderWidth: 1, color: "#FFFFFF", flex: 1, fontFamily: theme.fonts.regular, minHeight: 44, paddingHorizontal: 14 },
  storyReplySend: { alignItems: "center", backgroundColor: theme.colors.primary, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  typeBadge: { alignItems: "center", alignSelf: "flex-start", backgroundColor: theme.colors.backgroundCardLight, borderRadius: 12, flexDirection: "row", gap: 6, marginHorizontal: 14, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 6 },
  typeBadgeText: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.bold, fontSize: 11 },
  publishStatusBadge: { alignItems: "center", alignSelf: "flex-start", backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 11, borderWidth: 1, flexDirection: "row", gap: 6, marginHorizontal: 14, marginBottom: 8, paddingHorizontal: 10, paddingVertical: 6 },
  publishStatusText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, fontSize: 10 },
  warningCard: { alignItems: "center", backgroundColor: theme.colors.warningLight, flexDirection: "row", gap: 8, marginHorizontal: 14, marginBottom: 10, padding: 12, borderRadius: 12 },
  warningText: { color: theme.colors.text, flex: 1, fontFamily: theme.fonts.medium, fontSize: 11 },
  pollCard: { gap: 8, marginHorizontal: 14, marginBottom: 12 },
  pollOption: { alignItems: "center", borderColor: theme.colors.border, borderRadius: 13, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", overflow: "hidden", padding: 13, position: "relative" },
  pollOptionSelected: { backgroundColor: theme.colors.backgroundCardLight, borderColor: theme.colors.secondPrimary },
  pollResultFill: { backgroundColor: theme.colors.backgroundCardLight, bottom: 0, left: 0, position: "absolute", top: 0 },
  pollOptionText: { color: theme.colors.text, flex: 1, fontFamily: theme.fonts.medium, fontSize: 13 },
  pollResultMeta: { alignItems: "center", flexDirection: "row", gap: 6 },
  pollPercent: { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold, fontSize: 10 },
  pollVotes: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: 10, textAlign: "right" },
  detailRow: { flexDirection: "row", gap: 8, marginHorizontal: 14, marginBottom: 12 },
  detailChip: { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 12, borderWidth: 1, flex: 1, minHeight: 54, padding: 10 },
  detailLabel: { color: theme.colors.textMuted, fontFamily: theme.fonts.medium, fontSize: 9, textTransform: "uppercase" },
  detailValue: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 12, marginTop: 3 },
  hashtags: { color: theme.colors.secondPrimary, fontFamily: theme.fonts.medium, fontSize: 12, marginHorizontal: 14, marginBottom: 10 },
  reactionRow: { flexDirection: "row", gap: 7, marginHorizontal: 14, marginBottom: 8 },
  reactionChip: { alignItems: "center", backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 4, minHeight: 30, paddingHorizontal: 9 },
  reactionChipActive: { backgroundColor: theme.colors.backgroundCardLight, borderColor: theme.colors.secondPrimary },
  reactionEmoji: { fontSize: 14 }, reactionCount: { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, fontSize: 10 },
  inlineAction: { alignItems: "center", alignSelf: "flex-start", backgroundColor: theme.colors.primary, borderRadius: 12, flexDirection: "row", gap: 7, marginHorizontal: 14, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 10 },
  inlineActionText: { color: theme.colors.dark, fontFamily: theme.fonts.bold, fontSize: 11 },
  topStreakContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  topStreakHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  topStreakSectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 13,
  },
  topStreakSectionSubtitle: {
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
    fontSize: 11,
  },
  topStreakRail: {
    gap: 12,
    paddingHorizontal: 4,
  },
  topStreakCard: {
    alignItems: "center",
    width: 62,
  },
  topStreakAvatarContainer: {
    position: "relative",
    width: 46,
    height: 46,
  },
  topStreakAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#FF7A00",
  },
  topStreakAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.backgroundCardLight,
    borderWidth: 2,
    borderColor: "#FF7A00",
    justifyContent: "center",
    alignItems: "center",
  },
  topStreakInitial: {
    color: "#FF7A00",
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  rankBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rank1: { backgroundColor: "#FFD700" },
  rank2: { backgroundColor: "#C0C0C0" },
  rank3: { backgroundColor: "#CD7F32" },
  rankOther: { backgroundColor: theme.colors.textMuted },
  rankBadgeText: {
    color: "#000",
    fontFamily: theme.fonts.bold,
    fontSize: 9,
  },
  topStreakName: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    marginTop: 4,
    maxWidth: 60,
    textAlign: "center",
  },
  streakBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255, 122, 0, 0.14)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 2,
  },
  streakBadgePillText: {
    color: "#FF7A00",
    fontFamily: theme.fonts.bold,
    fontSize: 9,
  },
  liveChallengePill: {
    backgroundColor: "rgba(255, 215, 0, 0.16)",
    borderColor: "#FFD700",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  liveChallengeText: {
    color: "#FFD700",
    fontSize: 8,
    fontFamily: theme.fonts.bold,
    letterSpacing: 0.5,
  },
  challengeActionPill: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  challengeActionPillJoined: {
    backgroundColor: theme.colors.backgroundCardLight,
    borderWidth: 1,
    borderColor: theme.colors.secondPrimary,
  },
  challengeActionJoined: {
    color: theme.colors.secondPrimary,
  },
  quickWinSection: {
    marginTop: 10,
    marginBottom: 2,
  },
  quickWinHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickWinTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  quickWinSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 10,
  },
  quickWinRail: {
    gap: 8,
    paddingHorizontal: 16,
  },
  quickWinChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickWinEmoji: {
    fontSize: 18,
  },
  quickWinName: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 11,
  },
  quickWinValue: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
    fontSize: 10,
  },
  sortRailContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  sortRail: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    borderRadius: 11,
  },
  sortChipActive: {
    backgroundColor: theme.colors.primary,
  },
  sortText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
    fontSize: 11,
  },
  sortTextActive: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
  },
  challengePostBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 215, 0, 0.12)",
    borderColor: "rgba(255, 215, 0, 0.4)",
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  challengePostBadgeText: {
    color: "#FFD700",
    fontFamily: theme.fonts.bold,
    fontSize: 11,
  },
  achievementCard: {
    marginHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#111827",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 122, 0, 0.35)",
    padding: 16,
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  achievementIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
  },
  achievementBadgeTitle: {
    color: "#FF7A00",
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  achievementHeadline: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    marginTop: 2,
  },
  achievementStreakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 122, 0, 0.16)",
    borderColor: "#FF7A00",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  achievementStreakText: {
    color: "#FF7A00",
    fontFamily: theme.fonts.bold,
    fontSize: 11,
  },
  achievementStatBox: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  achievementStatNumber: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    letterSpacing: 0.5,
  },
  achievementStatUnit: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: theme.fonts.medium,
    fontSize: 13,
  },
});
