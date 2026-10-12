import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import { safeRouter } from "@/src/utils/safeRouter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  mealLogService,
  MealLogItem,
  WeeklyNutritionTrendsResponse,
  UserStreakDataResponse,
} from "@/src/services/mealLog.service";
import MealLogFlowModal from "@/src/Modals/MealLogFlowModal";
import eventBus from "@/event";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MealHistoryScreen() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [historyData, setHistoryData] = useState<
    Record<
      string,
      {
        date: string;
        mealsCount: number;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        meals: MealLogItem[];
      }
    >
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [logModalVisible, setLogModalVisible] = useState<boolean>(false);
  const [selectedImageForViewer, setSelectedImageForViewer] = useState<{
    uri: string;
    title: string;
  } | null>(null);

  // 📊 Trends & 🔥 Streaks State
  const [trendsData, setTrendsData] = useState<WeeklyNutritionTrendsResponse | null>(null);
  const [streakData, setStreakData] = useState<UserStreakDataResponse | null>(null);
  const [badgesModalVisible, setBadgesModalVisible] = useState<boolean>(false);
  const [streakReminderEnabled, setStreakReminderEnabled] = useState<boolean>(true);

  useEffect(() => {
    AsyncStorage.getItem("@iness_meal_streak_reminder")
      .then((val) => {
        if (val !== null) setStreakReminderEnabled(val === "true");
      })
      .catch(() => {});
  }, []);

  const handleToggleStreakReminder = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextVal = !streakReminderEnabled;
    setStreakReminderEnabled(nextVal);
    await AsyncStorage.setItem("@iness_meal_streak_reminder", String(nextVal));
    if (nextVal) {
      Alert.alert(
        "Streak Protection Active 🔥",
        "We'll remind you at 8:30 PM if you haven't logged dinner so your daily streak stays protected!"
      );
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const [res, trendsRes, streakRes] = await Promise.all([
        mealLogService.getMealHistory(),
        mealLogService.getWeeklyNutritionTrends(),
        mealLogService.getUserStreakData(),
      ]);
      if (res && res.success && res.history) {
        setHistoryData(res.history);
      }
      if (trendsRes && trendsRes.success) {
        setTrendsData(trendsRes);
      }
      if (streakRes && streakRes.success) {
        setStreakData(streakRes);
      }
    } catch (error) {
      console.error("fetchHistory error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();

    const onMealLogged = () => {
      fetchHistory();
    };
    eventBus.on("meal-logged", onMealLogged);

    return () => {
      eventBus.off("meal-logged", onMealLogged);
    };
  }, [fetchHistory]);

  const handleDeleteMeal = (meal: MealLogItem) => {
    Alert.alert(
      "Delete Meal Log",
      `Are you sure you want to delete "${meal.mealName}" from ${meal.date}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            const res = await mealLogService.deleteMeal(meal._id);
            if (res.success) {
              eventBus.emit("meal-logged");
              fetchHistory();
            } else {
              Alert.alert("Error", res.message || "Failed to delete meal log");
            }
          },
        },
      ]
    );
  };

  // Build marked dates for Calendar
  const markedDates: Record<string, any> = {};
  Object.keys(historyData).forEach((dateKey) => {
    markedDates[dateKey] = {
      marked: true,
      dotColor: "#9747FF",
    };
  });

  // Highlight selected date
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    selected: true,
    selectedColor: "#9747FF",
    selectedTextColor: "#FFFFFF",
  };

  const selectedDayEntry = historyData[selectedDate] || {
    date: selectedDate,
    mealsCount: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    meals: [],
  };

  const mealsForDate = selectedDayEntry.meals || [];

  // 🔥 Streak & Gamification Computations
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;

  let highProteinDays = 0;
  let cleanMealsTotal = 0;
  let breakfastMealsCount = 0;
  let photoMealsCount = 0;

  Object.values(historyData).forEach((entry) => {
    if ((entry.protein || 0) >= 100) highProteinDays++;
    (entry.meals || []).forEach((m) => {
      if ((m.healthScore || 0) >= 8) cleanMealsTotal++;
      if (m.mealType === "Breakfast") breakfastMealsCount++;
      if (m.imageUrl) photoMealsCount++;
    });
  });

  const milestoneBadges = [
    {
      id: "streak_7",
      title: "7-Day Iron Streak",
      desc: "Log daily meals for 7 consecutive days",
      icon: "fire",
      color: "#FF5722",
      unlocked: longestStreak >= 7 || currentStreak >= 7,
      progress: Math.min(Math.max(currentStreak, longestStreak), 7) / 7,
      progressLabel: `${Math.min(Math.max(currentStreak, longestStreak), 7)}/7 days`,
    },
    {
      id: "protein_champ",
      title: "Protein Champion",
      desc: "Hit 100g+ protein on 5 days",
      icon: "arm-flex",
      color: "#9747FF",
      unlocked: highProteinDays >= 5,
      progress: Math.min(highProteinDays, 5) / 5,
      progressLabel: `${Math.min(highProteinDays, 5)}/5 days`,
    },
    {
      id: "clean_eater",
      title: "Clean Eater",
      desc: "Log 10 meals with 8.0+ health score",
      icon: "food-apple",
      color: "#10B981",
      unlocked: cleanMealsTotal >= 10,
      progress: Math.min(cleanMealsTotal, 10) / 10,
      progressLabel: `${Math.min(cleanMealsTotal, 10)}/10 meals`,
    },
    {
      id: "early_bird",
      title: "Early Bird",
      desc: "Log 3 nutritious breakfasts",
      icon: "weather-sunset-up",
      color: "#F59E0B",
      unlocked: breakfastMealsCount >= 3,
      progress: Math.min(breakfastMealsCount, 3) / 3,
      progressLabel: `${Math.min(breakfastMealsCount, 3)}/3 breakfasts`,
    },
    {
      id: "photo_pro",
      title: "Plate Photographer",
      desc: "Analyze 5 meals with food photos",
      icon: "camera-iris",
      color: "#3B82F6",
      unlocked: photoMealsCount >= 5,
      progress: Math.min(photoMealsCount, 5) / 5,
      progressLabel: `${Math.min(photoMealsCount, 5)}/5 photos`,
    },
  ];

  const unlockedBadgesCount = milestoneBadges.filter((b) => b.unlocked).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
          onPress={() => safeRouter.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Nutrition Diary & History
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: "#9747FF" }]}
          onPress={() => setLogModalVisible(true)}
          activeOpacity={0.8}
          accessibilityLabel="Log a new meal"
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mealsForDate}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 20,
        }}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* 🔥 HABITS, STREAKS & GAMIFICATION CARD */}
            <TouchableOpacity
              style={[
                styles.streakGamificationCard,
                {
                  backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setBadgesModalVisible(true);
              }}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={
                  isDark
                    ? ["rgba(255,87,34,0.18)", "rgba(151,71,255,0.12)"]
                    : ["rgba(255,87,34,0.1)", "rgba(151,71,255,0.06)"]
                }
                style={styles.streakGradientBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.streakCardLeft}>
                  <View style={styles.streakFireCircle}>
                    <Text style={{ fontSize: 22 }}>🔥</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Text style={[styles.streakNumberText, { color: theme.colors.text }]}>
                        {currentStreak}-Day Streak
                      </Text>
                      {streakData?.streakMaintainedToday ? (
                        <View style={styles.todayMaintainedPill}>
                          <Ionicons name="checkmark-circle" size={11} color="#10B981" />
                          <Text style={styles.todayMaintainedText}>Saved Today</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingStreakPill}>
                          <Ionicons name="time-outline" size={11} color="#F59E0B" />
                          <Text style={styles.pendingStreakText}>Log before 12AM</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.streakSubText, { color: theme.colors.textSecondary }]}>
                      {unlockedBadgesCount}/{milestoneBadges.length} Milestones Unlocked • Tap for badges & reminders
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Interactive Calendar */}
            <View
              style={[
                styles.calendarCard,
                {
                  backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Calendar
                current={selectedDate}
                onDayPress={(day: any) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setSelectedDate(day.dateString);
                }}
                markedDates={markedDates}
                theme={{
                  calendarBackground: "transparent",
                  textSectionTitleColor: theme.colors.textSecondary,
                  selectedDayBackgroundColor: "#9747FF",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#9747FF",
                  dayTextColor: theme.colors.text,
                  textDisabledColor: theme.colors.textMuted,
                  dotColor: "#9747FF",
                  selectedDotColor: "#ffffff",
                  arrowColor: "#9747FF",
                  monthTextColor: theme.colors.text,
                  indicatorColor: "#9747FF",
                  textDayFontWeight: "600",
                  textMonthFontWeight: "700",
                  textDayHeaderFontWeight: "600",
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                }}
              />
            </View>

            {/* 📊 7-DAY MACRO & CALORIE TREND GRAPHS */}
            {trendsData && trendsData.dailySummaries && trendsData.dailySummaries.length > 0 && (
              <View
                style={[
                  styles.trendsCard,
                  {
                    backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.trendsHeaderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <MaterialCommunityIcons name="chart-bell-curve" size={18} color="#9747FF" />
                    <Text style={[styles.trendsCardTitle, { color: theme.colors.text }]}>
                      7-Day Nutrition Trends
                    </Text>
                  </View>
                  <View style={styles.trendsWeeklyAvgBadge}>
                    <Text style={styles.trendsWeeklyAvgLabel}>Weekly Avg:</Text>
                    <Text style={styles.trendsWeeklyAvgValue}>
                      {trendsData.weeklyAverageCalories} kcal
                    </Text>
                  </View>
                </View>

                {/* CALORIE BAR CHART */}
                <View style={styles.barChartContainer}>
                  {(() => {
                    const maxCal = Math.max(
                      ...trendsData.dailySummaries.map((d) => d.calories),
                      trendsData.weeklyAverageCalories,
                      1500
                    );
                    return (
                      <View style={styles.barsRow}>
                        {trendsData.dailySummaries.map((day) => {
                          const isSelected = selectedDate === day.date;
                          const barHeightPercent = Math.min(100, Math.max(6, (day.calories / maxCal) * 100));
                          const isOverAvg =
                            day.calories > trendsData.weeklyAverageCalories &&
                            trendsData.weeklyAverageCalories > 0;

                          return (
                            <TouchableOpacity
                              key={day.date}
                              style={styles.barCol}
                              onPress={() => {
                                Haptics.selectionAsync().catch(() => {});
                                setSelectedDate(day.date);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.barValueText,
                                  { color: isSelected ? "#9747FF" : theme.colors.textMuted },
                                ]}
                              >
                                {day.calories > 0
                                  ? day.calories >= 1000
                                    ? `${(day.calories / 1000).toFixed(1)}k`
                                    : day.calories
                                  : "-"}
                              </Text>
                              <View style={styles.barTrack}>
                                <View
                                  style={[
                                    styles.barFill,
                                    {
                                      height: `${barHeightPercent}%`,
                                      backgroundColor: isSelected
                                        ? "#9747FF"
                                        : isOverAvg
                                        ? "#F59E0B"
                                        : day.calories > 0
                                        ? isDark
                                          ? "rgba(151,71,255,0.6)"
                                          : "rgba(151,71,255,0.45)"
                                        : "transparent",
                                    },
                                  ]}
                                />
                              </View>
                              <View
                                style={[
                                  styles.dayLabelPill,
                                  isSelected && { backgroundColor: "#9747FF" },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.barDayLabel,
                                    {
                                      color: isSelected ? "#FFF" : theme.colors.textSecondary,
                                      fontWeight: isSelected ? "700" : "500",
                                    },
                                  ]}
                                >
                                  {day.dayOfWeek}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })()}
                </View>

                {/* MACRO SPLIT MULTI-SEGMENT PROGRESS BAR */}
                <View style={styles.macroSplitSection}>
                  <View style={styles.macroSplitHeaderRow}>
                    <Text style={[styles.macroSplitTitle, { color: theme.colors.textSecondary }]}>
                      Weekly Macro Split
                    </Text>
                    <Text style={[styles.macroSplitSub, { color: theme.colors.textMuted }]}>
                      P: {trendsData.macroSplit.proteinPercent}% • C: {trendsData.macroSplit.carbsPercent}% • F: {trendsData.macroSplit.fatPercent}%
                    </Text>
                  </View>
                  <View style={styles.stackedBar}>
                    <View
                      style={[
                        styles.stackedSegment,
                        {
                          flex: Math.max(1, trendsData.macroSplit.proteinPercent),
                          backgroundColor: "#9747FF",
                          borderTopLeftRadius: 6,
                          borderBottomLeftRadius: 6,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.stackedSegment,
                        {
                          flex: Math.max(1, trendsData.macroSplit.carbsPercent),
                          backgroundColor: "#F59E0B",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.stackedSegment,
                        {
                          flex: Math.max(1, trendsData.macroSplit.fatPercent),
                          backgroundColor: "#EC4899",
                          borderTopRightRadius: 6,
                          borderBottomRightRadius: 6,
                        },
                      ]}
                    />
                  </View>

                  {/* Legend Row */}
                  <View style={styles.macroLegendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#9747FF" }]} />
                      <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                        Protein ({trendsData.macroSplit.proteinPercent}%)
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                      <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                        Carbs ({trendsData.macroSplit.carbsPercent}%)
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#EC4899" }]} />
                      <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                        Fat ({trendsData.macroSplit.fatPercent}%)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* ⭐ BEST & CLEANEST DAYS HIGHLIGHT */}
                {(trendsData.bestProteinDay || trendsData.cleanestDay) && (
                  <View style={styles.highlightPillsRow}>
                    {trendsData.bestProteinDay && (
                      <TouchableOpacity
                        style={[
                          styles.highlightPill,
                          {
                            backgroundColor: "rgba(151,71,255,0.12)",
                            borderColor: "rgba(151,71,255,0.3)",
                          },
                        ]}
                        onPress={() => {
                          if (trendsData.bestProteinDay) {
                            Haptics.selectionAsync().catch(() => {});
                            setSelectedDate(trendsData.bestProteinDay.date);
                          }
                        }}
                      >
                        <Text style={{ fontSize: 13 }}>💪</Text>
                        <View>
                          <Text style={[styles.highlightPillTitle, { color: "#9747FF" }]}>
                            Peak Protein Day
                          </Text>
                          <Text style={[styles.highlightPillSub, { color: theme.colors.textSecondary }]}>
                            {trendsData.bestProteinDay.protein}g ({trendsData.bestProteinDay.dayOfWeek})
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {trendsData.cleanestDay && (
                      <TouchableOpacity
                        style={[
                          styles.highlightPill,
                          {
                            backgroundColor: "rgba(16,185,129,0.12)",
                            borderColor: "rgba(16,185,129,0.3)",
                          },
                        ]}
                        onPress={() => {
                          if (trendsData.cleanestDay) {
                            Haptics.selectionAsync().catch(() => {});
                            setSelectedDate(trendsData.cleanestDay.date);
                          }
                        }}
                      >
                        <Text style={{ fontSize: 13 }}>🥗</Text>
                        <View>
                          <Text style={[styles.highlightPillTitle, { color: "#10B981" }]}>
                            Cleanest Eating Day
                          </Text>
                          <Text style={[styles.highlightPillSub, { color: theme.colors.textSecondary }]}>
                            Score {trendsData.cleanestDay.healthScore}/10 ({trendsData.cleanestDay.dayOfWeek})
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Selected Date Summary Card */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.summaryTopRow}>
                <View>
                  <Text style={[styles.summaryDateText, { color: theme.colors.text }]}>
                    {selectedDate === getTodayStr()
                      ? "Today's Nutrition"
                      : new Date(selectedDate).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                  </Text>
                  <Text style={[styles.summaryMealsCount, { color: theme.colors.textSecondary }]}>
                    {selectedDayEntry.mealsCount}{" "}
                    {selectedDayEntry.mealsCount === 1 ? "meal" : "meals"} logged
                  </Text>
                </View>

                {/* Calorie badge */}
                <View style={styles.calorieBadge}>
                  <Text style={styles.calorieBadgeNum}>
                    {selectedDayEntry.calories}
                  </Text>
                  <Text style={styles.calorieBadgeUnit}>kcal</Text>
                </View>
              </View>

              {/* Macro pills */}
              <View style={styles.macroPillsRow}>
                <View style={[styles.macroPill, { backgroundColor: "rgba(151,71,255,0.15)" }]}>
                  <Text style={[styles.macroPillLabel, { color: "#9747FF" }]}>Protein</Text>
                  <Text style={[styles.macroPillVal, { color: "#9747FF" }]}>
                    {selectedDayEntry.protein}g
                  </Text>
                </View>

                <View style={[styles.macroPill, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
                  <Text style={[styles.macroPillLabel, { color: "#F59E0B" }]}>Carbs</Text>
                  <Text style={[styles.macroPillVal, { color: "#F59E0B" }]}>
                    {selectedDayEntry.carbs}g
                  </Text>
                </View>

                <View style={[styles.macroPill, { backgroundColor: "rgba(236,72,153,0.15)" }]}>
                  <Text style={[styles.macroPillLabel, { color: "#EC4899" }]}>Fat</Text>
                  <Text style={[styles.macroPillVal, { color: "#EC4899" }]}>
                    {selectedDayEntry.fat}g
                  </Text>
                </View>

                <View style={[styles.macroPill, { backgroundColor: "rgba(16,185,129,0.15)" }]}>
                  <Text style={[styles.macroPillLabel, { color: "#10B981" }]}>Fiber</Text>
                  <Text style={[styles.macroPillVal, { color: "#10B981" }]}>
                    {selectedDayEntry.fiber}g
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.listSectionHeading, { color: theme.colors.text }]}>
              Logged Meals ({mealsForDate.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.mealCard,
              {
                backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.mealCardHeader}>
              {/* Photo Thumbnail */}
              {item.imageUrl ? (
                <TouchableOpacity
                  style={styles.mealThumbWrapper}
                  onPress={() =>
                    setSelectedImageForViewer({
                      uri: item.imageUrl,
                      title: item.mealName,
                    })
                  }
                  activeOpacity={0.85}
                  accessibilityLabel="Tap to view full screen food photo"
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.mealThumb} />
                  <View style={styles.thumbZoomBadge}>
                    <Ionicons name="expand" size={10} color="#FFF" />
                  </View>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.mealThumbPlaceholder,
                    { backgroundColor: theme.colors.backgroundSecondary },
                  ]}
                >
                  <MaterialCommunityIcons name="food-apple" size={24} color="#9747FF" />
                </View>
              )}

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.mealTitleRow}>
                  <Text
                    style={[styles.mealItemName, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {item.mealName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteMeal(item)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>

                <View style={styles.mealMetaRow}>
                  <View
                    style={[
                      styles.mealTypeTag,
                      {
                        backgroundColor: isDark
                          ? "rgba(151,71,255,0.2)"
                          : "rgba(151,71,255,0.1)",
                      },
                    ]}
                  >
                    <Text style={styles.mealTypeTagText}>{item.mealType}</Text>
                  </View>
                  <Text style={[styles.mealTimeText, { color: theme.colors.textMuted }]}>
                    {item.time || "Logged"}
                  </Text>
                  <Text style={[styles.mealCalText, { color: theme.colors.text }]}>
                    • {item.calories} kcal
                  </Text>
                </View>

                {/* Macro summary line */}
                <Text style={[styles.macroSummaryLine, { color: theme.colors.textSecondary }]}>
                  P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g • Fib: {item.fiber}g
                </Text>

                {/* Dietary & Allergen Safety Guardrails */}
                {((item.dietaryTags && item.dietaryTags.length > 0) ||
                  (item.allergenAlerts && item.allergenAlerts.length > 0)) && (
                  <View style={styles.historyGuardrailsRow}>
                    {item.dietaryTags?.map((tag, tIdx) => (
                      <View key={`diet-${tIdx}`} style={styles.historyDietaryPill}>
                        <Text style={styles.historyDietaryPillText}>🌱 {tag}</Text>
                      </View>
                    ))}
                    {item.allergenAlerts?.map((alert, aIdx) => (
                      <View key={`alert-${aIdx}`} style={styles.historyAllergenPill}>
                        <Ionicons name="warning" size={10} color="#D97706" style={{ marginRight: 3 }} />
                        <Text style={styles.historyAllergenPillText}>{alert}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Ingredients pills if any */}
            {item.ingredients && item.ingredients.length > 0 && (
              <View style={styles.ingredientsPillsBox}>
                {item.ingredients.map((ing, i) => (
                  <View
                    key={i}
                    style={[
                      styles.ingredientPill,
                      { backgroundColor: theme.colors.backgroundSecondary },
                    ]}
                  >
                    <Text style={[styles.ingredientPillText, { color: theme.colors.textSecondary }]}>
                      {ing.name} {ing.quantity ? `(${ing.quantity})` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="small" color="#9747FF" />
            </View>
          ) : (
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={36}
                color={theme.colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No meals logged on this date
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Snap a meal picture with Iness AI to analyze calories and macros.
              </Text>
              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: "#9747FF" }]}
                onPress={() => setLogModalVisible(true)}
              >
                <Ionicons name="camera" size={16} color="#FFF" />
                <Text style={styles.emptyActionBtnText}>Log a Meal</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* Meal Log Modal */}
      <MealLogFlowModal
        visible={logModalVisible}
        onClose={() => setLogModalVisible(false)}
        onMealSaved={fetchHistory}
      />

      {/* Full-Screen High-Res Photo Viewer Modal */}
      <Modal
        visible={!!selectedImageForViewer}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setSelectedImageForViewer(null)}
      >
        <View style={styles.viewerContainer}>
          <SafeAreaView edges={["top"]} style={styles.viewerHeaderSafeArea}>
            <View style={styles.viewerHeader}>
              <TouchableOpacity
                style={styles.viewerCloseBtn}
                onPress={() => setSelectedImageForViewer(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.viewerTitleBox}>
                <Text style={styles.viewerTitleText} numberOfLines={1}>
                  {selectedImageForViewer?.title || "Meal Photo"}
                </Text>
                <Text style={styles.viewerSubtitleText}>
                  Pinch to zoom • Drag to pan
                </Text>
              </View>

              <View style={{ width: 36 }} />
            </View>
          </SafeAreaView>

          {selectedImageForViewer && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.viewerScrollContent}
              maximumZoomScale={4}
              minimumZoomScale={1}
              centerContent={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              bouncesZoom={true}
            >
              <Image
                source={{ uri: selectedImageForViewer.uri }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* 🏆 MILESTONE BADGES & MIDNIGHT STREAK REMINDERS MODAL */}
      <Modal
        visible={badgesModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBadgesModalVisible(false)}
      >
        <View style={styles.badgesModalOverlay}>
          <View
            style={[
              styles.badgesModalCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                paddingBottom: Math.max(insets.bottom, 20) + 12,
              },
            ]}
          >
            {/* Modal Handle */}
            <View style={styles.modalDragHandle} />

            {/* Modal Header */}
            <View style={styles.badgesModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.badgesModalTitle, { color: theme.colors.text }]}>
                  Habits & Streaks 🏆
                </Text>
                <Text style={[styles.badgesModalSub, { color: theme.colors.textSecondary }]}>
                  {unlockedBadgesCount} of {milestoneBadges.length} milestone badges unlocked
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.badgesCloseBtn,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
                onPress={() => setBadgesModalVisible(false)}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT * 0.65 }}>
              {/* STREAK HERO BANNER */}
              <LinearGradient
                colors={["#FF5722", "#F43F5E"]}
                style={styles.streakHeroBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.streakHeroRow}>
                  <View>
                    <Text style={styles.streakHeroLabel}>ACTIVE LOGGING STREAK</Text>
                    <Text style={styles.streakHeroCount}>{currentStreak} Days</Text>
                    <Text style={styles.streakHeroSub}>Personal Best: {longestStreak} Days</Text>
                  </View>
                  <Text style={{ fontSize: 44 }}>🔥</Text>
                </View>
              </LinearGradient>

              {/* ⏰ SMART MIDNIGHT STREAK REMINDER CARD */}
              <View
                style={[
                  styles.reminderBox,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.reminderContentLeft}>
                  <Ionicons name="notifications-circle" size={26} color="#9747FF" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reminderTitle, { color: theme.colors.text }]}>
                      Midnight Streak Protection
                    </Text>
                    <Text style={[styles.reminderSub, { color: theme.colors.textSecondary }]}>
                      Get an 8:30 PM reminder if you haven't snapped dinner yet so your streak stays protected.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.reminderToggleBtn,
                    {
                      backgroundColor: streakReminderEnabled
                        ? "#9747FF"
                        : isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    },
                  ]}
                  onPress={handleToggleStreakReminder}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.reminderToggleText,
                      { color: streakReminderEnabled ? "#FFF" : theme.colors.textMuted },
                    ]}
                  >
                    {streakReminderEnabled ? "ON" : "OFF"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* BADGES LIST */}
              <Text style={[styles.badgesSectionHeading, { color: theme.colors.text }]}>
                Milestone Achievements
              </Text>

              <View style={styles.badgesList}>
                {milestoneBadges.map((badge) => (
                  <View
                    key={badge.id}
                    style={[
                      styles.badgeCard,
                      {
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderColor: badge.unlocked ? badge.color : theme.colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeIconCircle,
                        {
                          backgroundColor: badge.unlocked
                            ? `${badge.color}25`
                            : isDark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.04)",
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={badge.icon as any}
                        size={24}
                        color={badge.unlocked ? badge.color : theme.colors.textMuted}
                      />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.badgeTitleRow}>
                        <Text style={[styles.badgeTitleText, { color: theme.colors.text }]}>
                          {badge.title}
                        </Text>
                        {badge.unlocked ? (
                          <View style={[styles.unlockedPill, { backgroundColor: `${badge.color}20` }]}>
                            <Ionicons name="checkmark-circle" size={10} color={badge.color} />
                            <Text style={[styles.unlockedPillText, { color: badge.color }]}>
                              Unlocked
                            </Text>
                          </View>
                        ) : (
                          <Text style={[styles.progressRatioText, { color: theme.colors.textMuted }]}>
                            {badge.progressLabel}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.badgeDescText, { color: theme.colors.textSecondary }]}>
                        {badge.desc}
                      </Text>

                      {/* Progress Bar if locked */}
                      {!badge.unlocked && (
                        <View style={styles.badgeProgressTrack}>
                          <View
                            style={[
                              styles.badgeProgressFill,
                              {
                                width: `${Math.round(badge.progress * 100)}%`,
                                backgroundColor: badge.color,
                              },
                            ]}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleBox: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    overflow: "hidden",
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryDateText: {
    fontSize: 16,
    fontWeight: "800",
  },
  summaryMealsCount: {
    fontSize: 12,
    marginTop: 2,
  },
  calorieBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    backgroundColor: "#9747FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  calorieBadgeNum: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  calorieBadgeUnit: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "700",
  },
  macroPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  macroPill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
  },
  macroPillLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  macroPillVal: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  listSectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  mealCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  mealCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  mealThumbPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mealTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mealItemName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  mealMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  mealTypeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mealTypeTagText: {
    color: "#9747FF",
    fontSize: 10,
    fontWeight: "700",
  },
  mealTimeText: {
    fontSize: 11,
  },
  mealCalText: {
    fontSize: 11,
    fontWeight: "700",
  },
  macroSummaryLine: {
    fontSize: 11,
    marginTop: 3,
  },
  ingredientsPillsBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  ingredientPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ingredientPillText: {
    fontSize: 10,
    fontWeight: "500",
  },
  historyGuardrailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  historyDietaryPill: {
    backgroundColor: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.3)",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyDietaryPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  historyAllergenPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,158,11,0.14)",
    borderColor: "rgba(245,158,11,0.35)",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyAllergenPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
  },
  emptyBox: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 16,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  emptyActionBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  mealThumbWrapper: {
    position: "relative",
  },
  thumbZoomBadge: {
    position: "absolute",
    bottom: 3,
    right: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  // Full-Screen Image Viewer
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  viewerHeaderSafeArea: {
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerTitleBox: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  viewerTitleText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  viewerSubtitleText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 2,
  },
  viewerScrollContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  // 🔥 Streak & Gamification Header Banner
  streakGamificationCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  streakGradientBg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  streakCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  streakFireCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,87,34,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakNumberText: {
    fontSize: 15,
    fontWeight: "800",
  },
  todayMaintainedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(16,185,129,0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayMaintainedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  pendingStreakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(245,158,11,0.15)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingStreakText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D97706",
  },
  streakSubText: {
    fontSize: 11,
    marginTop: 2,
  },

  // 📊 7-Day Trends Card
  trendsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  trendsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  trendsCardTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  trendsWeeklyAvgBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(151,71,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trendsWeeklyAvgLabel: {
    fontSize: 10,
    color: "#9747FF",
    fontWeight: "600",
  },
  trendsWeeklyAvgValue: {
    fontSize: 11,
    color: "#9747FF",
    fontWeight: "800",
  },
  barChartContainer: {
    marginBottom: 12,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 110,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  barValueText: {
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 64,
    backgroundColor: "rgba(151,71,255,0.06)",
    borderRadius: 7,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 7,
  },
  dayLabelPill: {
    marginTop: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  barDayLabel: {
    fontSize: 10,
  },
  macroSplitSection: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  macroSplitHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  macroSplitTitle: {
    fontSize: 11,
    fontWeight: "700",
  },
  macroSplitSub: {
    fontSize: 10,
  },
  stackedBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  stackedSegment: {
    height: "100%",
  },
  macroLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
  },
  highlightPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  highlightPill: {
    flex: 1,
    minWidth: 140,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  highlightPillTitle: {
    fontSize: 10,
    fontWeight: "700",
  },
  highlightPillSub: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },

  // 🏆 Badges Modal
  badgesModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  badgesModalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.4)",
    alignSelf: "center",
    marginBottom: 10,
  },
  badgesModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badgesModalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  badgesModalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  badgesCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  streakHeroBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  streakHeroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakHeroLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  streakHeroCount: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 2,
  },
  streakHeroSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    marginTop: 2,
  },
  reminderBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  reminderContentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  reminderTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  reminderSub: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  reminderToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  reminderToggleText: {
    fontSize: 11,
    fontWeight: "800",
  },
  badgesSectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  badgesList: {
    gap: 10,
    paddingBottom: 16,
  },
  badgeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeTitleText: {
    fontSize: 13,
    fontWeight: "700",
  },
  unlockedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unlockedPillText: {
    fontSize: 9,
    fontWeight: "700",
  },
  progressRatioText: {
    fontSize: 10,
    fontWeight: "600",
  },
  badgeDescText: {
    fontSize: 11,
    marginTop: 2,
  },
  badgeProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.2)",
    marginTop: 6,
    overflow: "hidden",
  },
  badgeProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
