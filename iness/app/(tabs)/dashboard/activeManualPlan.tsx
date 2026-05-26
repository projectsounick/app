import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { ResizeMode, Video } from "expo-av";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootState } from "@/store";
import {
  WorkoutPlanInterface,
  EachexerciseItem,
} from "@/app/interfaces/activeManualPlan";
import NormalHeader from "@/app/modules/NormalHeader";
import ImageViewerModal from "@/app/Modals/ImageViewerModal";
import VideoViewerModal from "@/app/Modals/VideoViewerModal";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const dayConfigs = [
  { key: "sun", short: "Sun", full: "Sunday" },
  { key: "mon", short: "Mon", full: "Monday" },
  { key: "tue", short: "Tue", full: "Tuesday" },
  { key: "wed", short: "Wed", full: "Wednesday" },
  { key: "thu", short: "Thu", full: "Thursday" },
  { key: "fri", short: "Fri", full: "Friday" },
  { key: "sat", short: "Sat", full: "Saturday" },
] as const;

type DayKey = (typeof dayConfigs)[number]["key"];
const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

const getTodayKey = (): DayKey => dayConfigs[new Date().getDay()].key;

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const formatDate = (value?: string) => {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const normalizeStringList = (values?: string[]) =>
  Array.isArray(values)
    ? values.map((value) => String(value || "").trim()).filter(Boolean)
    : [];

export default function ManualPlanViewer() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const activeManualPlan = useSelector(
    (state: RootState) => state.plan.activeManualPlan
  );
  const plan: WorkoutPlanInterface | undefined =
    activeManualPlan?.workoutPlanId;

  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayKey());
  const [expandedImages, setExpandedImages] = useState<number | null>(null);
  const [expandedVideos, setExpandedVideos] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setSelectedDay(getTodayKey());
    }
  }, [plan]);

  useEffect(() => {
    setExpandedImages(null);
    setExpandedVideos(null);
  }, [selectedDay]);

  const workoutSummary = useMemo(() => {
    if (!plan) {
      return {
        totalExercises: 0,
        totalSets: 0,
        activeDays: 0,
      };
    }

    return dayConfigs.reduce(
      (summary, { key }) => {
        const exercisesForDay = Array.isArray(plan[key]) ? plan[key] : [];

        return {
          totalExercises: summary.totalExercises + exercisesForDay.length,
          totalSets:
            summary.totalSets +
            exercisesForDay.reduce(
              (setTotal, exerciseItem) => setTotal + exerciseItem.sets.length,
              0
            ),
          activeDays:
            summary.activeDays + (exercisesForDay.length > 0 ? 1 : 0),
        };
      },
      { totalExercises: 0, totalSets: 0, activeDays: 0 }
    );
  }, [plan]);

  const planInfoSections = useMemo(() => {
    if (!plan) {
      return [];
    }

    const sections = [
      {
        key: "goals",
        title: "Goals",
        caption: "What this plan is designed to improve.",
        icon: "flag-outline" as const,
        items: normalizeStringList(plan.goals),
      },
      {
        key: "importantNotes",
        title: "Important notes",
        caption: "Guidance to follow while doing the workouts.",
        icon: "alert-circle-outline" as const,
        items: normalizeStringList(plan.importantNotes),
      },
      {
        key: "weekendRecommendations",
        title: "Weekend recommendations",
        caption: "Suggested activities outside the main training days.",
        icon: "sunny-outline" as const,
        items: normalizeStringList(plan.weekendRecommendations),
      },
    ];

    return sections.filter((section) => section.items.length > 0);
  }, [plan]);

  if (!plan) {
    return (
      <SafeAreaView style={styles.screen} edges={["left", "right"]}>
        <View style={styles.headerWrap}>
          <NormalHeader screenName="Workout Plan" />
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={28}
              color={theme.colors.success}
            />
          </View>
          <Text style={styles.emptyTitle}>No workout plan found</Text>
          <Text style={styles.emptyText}>
            Your assigned manual workout plan will appear here once it is
            available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedDayConfig =
    dayConfigs.find((config) => config.key === selectedDay) || dayConfigs[0];
  const exercises: EachexerciseItem[] = Array.isArray(plan[selectedDay])
    ? (plan[selectedDay] as EachexerciseItem[])
    : [];

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <NormalHeader screenName="Workout Plan" />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={16}
              color={theme.colors.success}
            />
            <Text style={styles.heroBadgeText}>Manual Plan</Text>
          </View>

          <Text style={styles.heroTitle}>{plan.planName}</Text>
          <Text style={styles.heroDescription}>
            {plan.description || "No description available for this workout plan."}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{workoutSummary.activeDays}</Text>
              <Text style={styles.statLabel}>Active days</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{workoutSummary.totalExercises}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{workoutSummary.totalSets}</Text>
              <Text style={styles.statLabel}>Total sets</Text>
            </View>
          </View>

          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Start date</Text>
              <Text style={styles.metaValue}>
                {formatDate(activeManualPlan?.startDate)}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>End date</Text>
              <Text style={styles.metaValue}>
                {formatDate(activeManualPlan?.endDate)}
              </Text>
            </View>
          </View>
        </View>

        {planInfoSections.length > 0 ? (
          <View style={styles.planInfoSection}>
            <View style={styles.planInfoSectionHeader}>
              <Text style={styles.planInfoSectionTitle}>Plan details</Text>
              <Text style={styles.planInfoSectionCaption}>
                Extra guidance imported with this workout plan.
              </Text>
            </View>

            {planInfoSections.map((section) => (
              <View key={section.key} style={styles.planInfoCard}>
                <View style={styles.planInfoCardHeader}>
                  <View style={styles.planInfoIconWrap}>
                    <Ionicons
                      name={section.icon}
                      size={18}
                      color={theme.colors.success}
                    />
                  </View>
                  <View style={styles.planInfoHeaderText}>
                    <Text style={styles.planInfoCardTitle}>{section.title}</Text>
                    <Text style={styles.planInfoCardCaption}>
                      {section.caption}
                    </Text>
                  </View>
                  <View style={styles.planInfoCountBadge}>
                    <Text style={styles.planInfoCountText}>
                      {section.items.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.planInfoList}>
                  {section.items.map((item, index) => (
                    <View
                      key={`${section.key}-${index}`}
                      style={styles.planInfoListItem}
                    >
                      <View style={styles.planInfoBullet} />
                      <Text style={styles.planInfoListText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.daySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Training days</Text>
            <Text style={styles.sectionCaption}>
              Open any day to view the full workout.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayTabsContent}
          >
            {dayConfigs.map((day) => {
              const isSelected = selectedDay === day.key;
              const dayExercises = Array.isArray(plan[day.key]) ? plan[day.key] : [];

              return (
                <TouchableOpacity
                  key={day.key}
                  onPress={() => setSelectedDay(day.key)}
                  style={[
                    styles.dayPill,
                    isSelected ? styles.dayPillActive : styles.dayPillInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayPillText,
                      isSelected
                        ? styles.dayPillTextActive
                        : styles.dayPillTextInactive,
                    ]}
                  >
                    {day.short}
                  </Text>
                  <Text
                    style={[
                      styles.dayPillCount,
                      isSelected
                        ? styles.dayPillCountActive
                        : styles.dayPillCountInactive,
                    ]}
                  >
                    {dayExercises.length}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.exerciseSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{selectedDayConfig.full}</Text>
              <Text style={styles.sectionCaption}>
                {exercises.length > 0
                  ? `${exercises.length} exercise${exercises.length === 1 ? "" : "s"} scheduled`
                  : "No exercises scheduled"}
              </Text>
            </View>
            <View style={styles.sectionChip}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={theme.colors.success}
              />
              <Text style={styles.sectionChipText}>Day plan</Text>
            </View>
          </View>

          {exercises.length === 0 ? (
            <View style={styles.emptyDayCard}>
              <Text style={styles.emptyDayTitle}>Rest or recovery day</Text>
              <Text style={styles.emptyDayText}>
                There are no workout items listed for {selectedDayConfig.full}.
              </Text>
            </View>
          ) : (
            exercises.map((item, idx) => {
              const images = item.exercise.images || [];
              const videos = item.exercise.videos || [];
              const totalReps = item.sets.reduce(
                (total, set) => total + (Number(set.repRange) || 0),
                0
              );

              return (
                <View
                  key={item.exercise._id || `${selectedDay}-${idx}`}
                  style={styles.exerciseCard}
                >
                  <View style={styles.exerciseHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.exerciseEyebrowRow}>
                        <Text style={styles.exerciseEyebrow}>
                          Exercise {idx + 1}
                        </Text>
                        <View style={styles.exerciseBadge}>
                          <Text style={styles.exerciseBadgeText}>
                            {item.sets.length} set
                            {item.sets.length === 1 ? "" : "s"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.exerciseName}>
                        {item.exercise.name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.exerciseSummaryRow}>
                    <View style={styles.summaryTile}>
                      <Text style={styles.summaryTileValue}>
                        {item.sets.length}
                      </Text>
                      <Text style={styles.summaryTileLabel}>Sets</Text>
                    </View>
                    <View style={styles.summaryTile}>
                      <Text style={styles.summaryTileValue}>{totalReps}</Text>
                      <Text style={styles.summaryTileLabel}>Rep total</Text>
                    </View>
                    <View style={styles.summaryTile}>
                      <Text style={styles.summaryTileValue}>
                        {images.length + videos.length}
                      </Text>
                      <Text style={styles.summaryTileLabel}>Media</Text>
                    </View>
                  </View>

                  <View style={styles.setsBlock}>
                    <Text style={styles.blockTitle}>Set details</Text>
                    {item.sets.map((set, setIndex) => (
                      <View
                        key={`${item.exercise._id || idx}-${setIndex}`}
                        style={styles.setRow}
                      >
                        <View style={styles.setIndexBadge}>
                          <Text style={styles.setIndexText}>{setIndex + 1}</Text>
                        </View>
                        <View style={styles.setInfoCard}>
                          <View style={styles.setInfoChunk}>
                            <Text style={styles.setInfoLabel}>Reps</Text>
                            <Text style={styles.setInfoValue}>
                              {set.repRange || 0}
                            </Text>
                          </View>
                          <View style={styles.setInfoChunk}>
                            <Text style={styles.setInfoLabel}>Timer</Text>
                            <Text style={styles.setInfoValue}>
                              {set.timer || "Not set"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  {images.length > 0 ? (
                    <View style={styles.mediaBlock}>
                      <TouchableOpacity
                        onPress={() => {
                          LayoutAnimation.configureNext(
                            LayoutAnimation.Presets.easeInEaseOut
                          );
                          setExpandedImages(expandedImages === idx ? null : idx);
                        }}
                        style={styles.mediaToggle}
                      >
                        <View style={styles.mediaToggleTitleWrap}>
                          <Ionicons
                            name="image-outline"
                            size={18}
                            color={theme.colors.success}
                          />
                          <Text style={styles.mediaToggleTitle}>
                            Exercise images
                          </Text>
                        </View>
                        <View style={styles.mediaToggleMeta}>
                          <Text style={styles.mediaToggleCount}>
                            {images.length}
                          </Text>
                          <Ionicons
                            name={
                              expandedImages === idx
                                ? "chevron-up"
                                : "chevron-forward"
                            }
                            size={18}
                            color={theme.colors.text}
                          />
                        </View>
                      </TouchableOpacity>

                      {expandedImages === idx ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.mediaRow}
                        >
                          {images.map((img, imageIndex) => (
                            <TouchableOpacity
                              key={`${img}-${imageIndex}`}
                              onPress={() => {
                                setSelectedImage(img);
                                setModalVisible(true);
                              }}
                            >
                              <Image
                                source={{ uri: img }}
                                style={styles.imagePreview}
                              />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      ) : null}
                    </View>
                  ) : null}

                  {videos.length > 0 ? (
                    <View style={styles.mediaBlock}>
                      <TouchableOpacity
                        onPress={() => {
                          LayoutAnimation.configureNext(
                            LayoutAnimation.Presets.easeInEaseOut
                          );
                          setExpandedVideos(expandedVideos === idx ? null : idx);
                        }}
                        style={styles.mediaToggle}
                      >
                        <View style={styles.mediaToggleTitleWrap}>
                          <Ionicons
                            name="play-circle-outline"
                            size={18}
                            color={theme.colors.success}
                          />
                          <Text style={styles.mediaToggleTitle}>
                            Exercise videos
                          </Text>
                        </View>
                        <View style={styles.mediaToggleMeta}>
                          <Text style={styles.mediaToggleCount}>
                            {videos.length}
                          </Text>
                          <Ionicons
                            name={
                              expandedVideos === idx
                                ? "chevron-up"
                                : "chevron-forward"
                            }
                            size={18}
                            color={theme.colors.text}
                          />
                        </View>
                      </TouchableOpacity>

                      {expandedVideos === idx ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.mediaRow}
                        >
                          {videos.map((vid, videoIndex) => (
                            <TouchableOpacity
                              key={`${vid}-${videoIndex}`}
                              style={styles.videoPreviewCard}
                              onPress={() => {
                                setSelectedVideoUrl(vid);
                                setVideoModalVisible(true);
                              }}
                            >
                              <Video
                                source={{ uri: vid }}
                                useNativeControls={false}
                                resizeMode={ResizeMode.COVER}
                                style={styles.videoPreview}
                                shouldPlay={false}
                                isMuted
                              />
                              <View style={styles.videoOverlay}>
                                <Ionicons
                                  name="play-circle"
                                  size={34}
                                  color={theme.colors.textWhite}
                                />
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      ) : null}
                    </View>
                  ) : null}

                  {images.length === 0 && videos.length === 0 ? (
                    <View style={styles.noMediaCard}>
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={theme.colors.textMuted}
                      />
                      <Text style={styles.noMediaText}>
                        No reference images or videos attached for this exercise.
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {modalVisible ? (
        <ImageViewerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          imageUrl={selectedImage}
        />
      ) : null}

      {videoModalVisible ? (
        <VideoViewerModal
          visible={videoModalVisible}
          videoUrl={selectedVideoUrl}
          onClose={() => setVideoModalVisible(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const getStyles = (theme: ReturnType<typeof useGlobalTheme>, isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    headerWrap: {
      paddingHorizontal: 16,
      marginTop: Platform.OS === "ios" ? topPadding : "4%",
    },
    heroCard: {
      marginHorizontal: 16,
      marginTop: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.15 : 0.08,
      shadowRadius: 18,
      elevation: 4,
    },
    heroBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.colors.greenLight,
      marginBottom: 14,
    },
    heroBadgeText: {
      color: theme.colors.success,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.large,
      fontFamily: theme.fonts.bold,
    },
    heroDescription: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.regular,
      lineHeight: 23,
      marginTop: 8,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 18,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark
        ? theme.colors.backgroundCard
        : theme.colors.backgroundSecondary,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: "center",
    },
    statValue: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.medium,
      fontFamily: theme.fonts.bold,
    },
    statLabel: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
      marginTop: 4,
      textAlign: "center",
    },
    metaBlock: {
      marginTop: 18,
      padding: 16,
      borderRadius: 18,
      backgroundColor: isDark
        ? theme.colors.backgroundCard
        : theme.colors.backgroundSecondary,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    metaLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
    },
    metaValue: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.bold,
    },
    metaDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 12,
    },
    planInfoSection: {
      marginTop: 22,
      paddingHorizontal: 16,
      gap: 12,
    },
    planInfoSectionHeader: {
      paddingHorizontal: 4,
    },
    planInfoSectionTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.medium,
      fontFamily: theme.fonts.bold,
    },
    planInfoSectionCaption: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.regular,
      marginTop: 4,
      lineHeight: 18,
    },
    planInfoCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 14,
    },
    planInfoCardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    planInfoIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.greenLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    planInfoHeaderText: {
      flex: 1,
      paddingRight: 10,
    },
    planInfoCardTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.bold,
    },
    planInfoCardCaption: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.regular,
      lineHeight: 18,
      marginTop: 2,
    },
    planInfoCountBadge: {
      minWidth: 32,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    planInfoCountText: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
    },
    planInfoList: {
      gap: 10,
    },
    planInfoListItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    planInfoBullet: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: theme.colors.success,
      marginRight: 10,
      marginTop: 7,
    },
    planInfoListText: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.regular,
      lineHeight: 21,
    },
    daySection: {
      marginTop: 22,
    },
    exerciseSection: {
      marginTop: 22,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.medium,
      fontFamily: theme.fonts.bold,
    },
    sectionCaption: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.regular,
      marginTop: 3,
    },
    dayTabsContent: {
      paddingHorizontal: 16,
      paddingBottom: 4,
      gap: 10,
    },
    dayPill: {
      minWidth: 80,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
    },
    dayPillActive: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    dayPillInactive: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    dayPillText: {
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.bold,
    },
    dayPillTextActive: {
      color: theme.colors.textWhite,
    },
    dayPillTextInactive: {
      color: theme.colors.text,
    },
    dayPillCount: {
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: "hidden",
    },
    dayPillCountActive: {
      color: theme.colors.success,
      backgroundColor: theme.colors.textWhite,
    },
    dayPillCountInactive: {
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    sectionChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.greenLight,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
    },
    sectionChipText: {
      color: theme.colors.success,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
    },
    emptyDayCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyDayTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.bold,
    },
    emptyDayText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.regular,
      lineHeight: 21,
      marginTop: 6,
    },
    exerciseCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    exerciseEyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    exerciseEyebrow: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
      textTransform: "uppercase",
    },
    exerciseBadge: {
      backgroundColor: theme.colors.greenLight,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    exerciseBadgeText: {
      color: theme.colors.success,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
    },
    exerciseName: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.medium,
      fontFamily: theme.fonts.bold,
      lineHeight: 24,
    },
    exerciseSummaryRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 16,
    },
    summaryTile: {
      flex: 1,
      backgroundColor: isDark
        ? theme.colors.backgroundCard
        : theme.colors.backgroundSecondary,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      alignItems: "center",
    },
    summaryTileValue: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.bold,
    },
    summaryTileLabel: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
      marginTop: 4,
    },
    setsBlock: {
      marginTop: 18,
    },
    blockTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.bold,
      marginBottom: 12,
    },
    setRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    setIndexBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.success,
      marginRight: 10,
    },
    setIndexText: {
      color: theme.colors.textWhite,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
    },
    setInfoCard: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: isDark
        ? theme.colors.backgroundCard
        : theme.colors.backgroundSecondary,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    setInfoChunk: {
      flex: 1,
    },
    setInfoLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
      marginBottom: 4,
    },
    setInfoValue: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.bold,
    },
    mediaBlock: {
      marginTop: 18,
    },
    mediaToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark
        ? theme.colors.backgroundCard
        : theme.colors.backgroundSecondary,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    mediaToggleTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    mediaToggleTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.bold,
    },
    mediaToggleMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    mediaToggleCount: {
      color: theme.colors.success,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
    },
    mediaRow: {
      paddingTop: 12,
      gap: 10,
    },
    imagePreview: {
      width: 132,
      height: 104,
      borderRadius: 16,
      backgroundColor: theme.colors.backgroundCard,
    },
    videoPreviewCard: {
      width: 180,
      height: 108,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.colors.black,
    },
    videoPreview: {
      width: "100%",
      height: "100%",
    },
    videoOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.22)",
    },
    noMediaCard: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: isDark
        ? theme.colors.backgroundCard
        : theme.colors.backgroundSecondary,
    },
    noMediaText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.regular,
      marginLeft: 8,
      lineHeight: 19,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.greenLight,
      marginBottom: 16,
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.medium,
      fontFamily: theme.fonts.bold,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.regular,
      lineHeight: 23,
      marginTop: 8,
      textAlign: "center",
    },
  });
