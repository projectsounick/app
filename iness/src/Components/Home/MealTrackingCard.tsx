import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import { safeRouter } from "@/src/utils/safeRouter";
import {
  mealLogService,
  DailyMealsResponse,
} from "../../services/mealLog.service";
import MealLogFlowModal from "../../Modals/MealLogFlowModal";
import MealMaintenanceBottomSheet from "../../Modals/MealMaintenanceBottomSheet";
import eventBus from "@/event";

// Circular Progress Component using react-native-svg
function MacroCircleProgress({
  label,
  value,
  target,
  unit = "g",
  color,
  textColor,
  textMutedColor,
  bgCircleColor,
}: {
  label: string;
  value: number;
  target?: number;
  unit?: string;
  color: string;
  textColor: string;
  textMutedColor: string;
  bgCircleColor: string;
}) {
  const size = 68;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = target
    ? Math.min(Math.max(value / (target || 1), 0), 1)
    : value > 0
    ? 1
    : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <View style={styles.macroCircleItem}>
      <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgCircleColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {/* Center Text */}
        <View style={styles.circleCenterText}>
          <Text style={[styles.circleValueText, { color: textColor }]}>
            {value}
            <Text style={{ fontSize: 9, fontWeight: "600" }}>{unit}</Text>
          </Text>
        </View>
      </View>

      <Text style={[styles.circleLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.circleTarget, { color: textMutedColor }]}>
        {target ? `/${target}${unit}` : `total ${unit}`}
      </Text>
    </View>
  );
}

export default function MealTrackingCard() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();

  const [data, setData] = useState<DailyMealsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [maintenanceVisible, setMaintenanceVisible] = useState<boolean>(false);

  const handleOpenMealLogging = useCallback(() => {
    if (data?.isLocked) {
      setMaintenanceVisible(true);
    } else {
      setModalVisible(true);
    }
  }, [data?.isLocked]);

  const fetchDailyData = useCallback(async () => {
    try {
      const res = await mealLogService.getDailyMeals();
      if (res && res.success) {
        setData(res);
      }
    } catch (error) {
      console.error("fetchDailyData error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyData();

    // Listen to real-time meal logged events from modal or quick action
    const onMealLogged = () => {
      fetchDailyData();
    };

    eventBus.on("meal-logged", onMealLogged);
    eventBus.on("open-meal-logging", handleOpenMealLogging);

    return () => {
      eventBus.off("meal-logged", onMealLogged);
      eventBus.off("open-meal-logging", handleOpenMealLogging);
    };
  }, [fetchDailyData, handleOpenMealLogging]);

  const dailyTotals = data?.dailyTotals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };
  const targets = data?.targets || {
    calories: 2200,
    protein: 130,
    carbs: 250,
    fat: 65,
    fiber: 30,
  };
  const loggedCount = data?.loggedCount ?? 0;
  const maxMeals = data?.maxMeals ?? 6;
  const remainingMeals = data?.remainingMeals ?? maxMeals;
  const streak = data?.streak ?? 0;

  const bgCircleColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* CARD HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <LinearGradient
            colors={["#9747FF", "#7C3AED"]}
            style={styles.headerIconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="food-apple" size={16} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Daily Nutrition & Macros
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                AI Meal Tracker • Resets midnight
              </Text>
              {data?.isLocked && (
                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(245, 158, 11, 0.12)",
                    paddingHorizontal: 6,
                    paddingVertical: 1.5,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontSize: 9.5, fontWeight: "700", color: "#F59E0B" }}>
                    MAINTENANCE
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Right Action Icons: Calendar (History) + Arrow (Direct Log) */}
        <View style={styles.cardHeaderRight}>
          {/* Calendar History Button */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
            onPress={() => safeRouter.navigate("/dashboard/mealHistory" as any)}
            activeOpacity={0.7}
            accessibilityLabel="View Meal History Calendar"
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Quick Arrow / Plus Action to Log Meal directly */}
          <TouchableOpacity
            style={[styles.arrowBtn, { backgroundColor: "#9747FF" }]}
            onPress={handleOpenMealLogging}
            activeOpacity={0.8}
            accessibilityLabel="Log a meal with AI"
          >
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* DAILY NUTRITION STREAK BADGE */}
      <View
        style={[
          styles.streakBanner,
          {
            backgroundColor:
              streak > 0
                ? isDark
                  ? "rgba(255, 107, 0, 0.12)"
                  : "rgba(255, 107, 0, 0.08)"
                : isDark
                ? "rgba(255, 255, 255, 0.03)"
                : "rgba(0, 0, 0, 0.02)",
            borderColor:
              streak > 0
                ? "rgba(255, 107, 0, 0.28)"
                : theme.colors.border,
          },
        ]}
      >
        <View style={styles.streakLeft}>
          <Text style={styles.streakFlameIcon}>🔥</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.streakTitleText,
                { color: streak > 0 ? (isDark ? "#FFA756" : "#E65100") : theme.colors.text },
              ]}
            >
              {streak > 0
                ? `${streak}-Day Meal Logging Streak`
                : "Start Your Meal Logging Streak"}
            </Text>
            <Text style={[styles.streakSubText, { color: theme.colors.textSecondary }]}>
              {streak > 0
                ? "Maintained by logging at least 1 meal before midnight"
                : "Log a meal today before midnight to ignite your streak!"}
            </Text>
          </View>
        </View>

        {streak > 0 && (
          <View style={styles.streakBadgeRight}>
            <LinearGradient
              colors={["#FF6B00", "#FF4500"]}
              style={styles.streakNumberBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.streakNumberText}>{streak}</Text>
              <Text style={styles.streakNumberLabel}>DAYS</Text>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* PILL BAR: REMAINING MEALS BADGE & CALORIE SUMMARY */}
      <View
        style={[
          styles.statusPillBar,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.pillLeft}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={14}
            color={remainingMeals > 0 ? "#9747FF" : "#F44336"}
          />
          <Text style={[styles.pillText, { color: theme.colors.text }]}>
            {loggedCount}/{maxMeals} meals logged
          </Text>
          <View
            style={[
              styles.remainingTag,
              {
                backgroundColor:
                  remainingMeals > 0
                    ? isDark
                      ? "rgba(151,71,255,0.2)"
                      : "rgba(151,71,255,0.12)"
                    : "rgba(244,67,54,0.15)",
              },
            ]}
          >
            <Text
              style={[
                styles.remainingTagText,
                { color: remainingMeals > 0 ? "#9747FF" : "#F44336" },
              ]}
            >
              {remainingMeals > 0 ? `${remainingMeals} left` : "Limit reached"}
            </Text>
          </View>
        </View>

        <View style={styles.pillRight}>
          <Text style={[styles.calorieSmallText, { color: theme.colors.textSecondary }]}>
            <Text style={{ fontWeight: "700", color: theme.colors.text }}>
              {dailyTotals.calories}
            </Text>
            {" "}kcal logged today
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#9747FF" />
        </View>
      ) : (
        <>
          {/* 4 CIRCULAR MACRO MARKS PROGRESS */}
          <View style={styles.macroCirclesRow}>
            {/* Protein */}
            <MacroCircleProgress
              label="Protein"
              value={dailyTotals.protein}
              color="#9747FF"
              textColor={theme.colors.text}
              textMutedColor={theme.colors.textMuted}
              bgCircleColor={bgCircleColor}
            />

            {/* Carbs */}
            <MacroCircleProgress
              label="Carbs"
              value={dailyTotals.carbs}
              color="#F59E0B"
              textColor={theme.colors.text}
              textMutedColor={theme.colors.textMuted}
              bgCircleColor={bgCircleColor}
            />

            {/* Fat */}
            <MacroCircleProgress
              label="Fat"
              value={dailyTotals.fat}
              color="#EC4899"
              textColor={theme.colors.text}
              textMutedColor={theme.colors.textMuted}
              bgCircleColor={bgCircleColor}
            />

            {/* Fiber */}
            <MacroCircleProgress
              label="Fiber"
              value={dailyTotals.fiber}
              color="#10B981"
              textColor={theme.colors.text}
              textMutedColor={theme.colors.textMuted}
              bgCircleColor={bgCircleColor}
            />
          </View>

          {/* HELPFUL TEXT GUIDE */}
          <TouchableOpacity
            style={[
              styles.guideBanner,
              {
                backgroundColor: isDark
                  ? "rgba(151,71,255,0.08)"
                  : "rgba(151,71,255,0.04)",
                borderColor: isDark
                  ? "rgba(151,71,255,0.2)"
                  : "rgba(151,71,255,0.12)",
              },
            ]}
            onPress={handleOpenMealLogging}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={14} color="#9747FF" />
            <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>
              {loggedCount === 0
                ? "No meals logged yet today. Tap the arrow to scan your first meal with AI!"
                : `Great job! Tap to log meal ${loggedCount + 1} or view today's nutrition diary.`}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#9747FF" />
          </TouchableOpacity>
        </>
      )}

      {/* MEAL LOG FLOW MODAL */}
      <MealLogFlowModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onMealSaved={fetchDailyData}
      />

      {/* MEAL MAINTENANCE BOTTOM SHEET */}
      <MealMaintenanceBottomSheet
        visible={maintenanceVisible}
        onClose={() => setMaintenanceVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusPillBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  pillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  remainingTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  remainingTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  pillRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  calorieSmallText: {
    fontSize: 11,
  },
  macroCirclesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  macroCircleItem: {
    alignItems: "center",
    flex: 1,
  },
  circleCenterText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  circleValueText: {
    fontSize: 13,
    fontWeight: "800",
  },
  circleLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  circleTarget: {
    fontSize: 10,
    marginTop: 1,
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
  },
  streakFlameIcon: {
    fontSize: 20,
  },
  streakTitleText: {
    fontSize: 13,
    fontWeight: "700",
  },
  streakSubText: {
    fontSize: 10,
    marginTop: 1,
  },
  streakBadgeRight: {
    marginLeft: 6,
  },
  streakNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  streakNumberText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 14,
  },
  streakNumberLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  guideBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  guideText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  loadingBox: {
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
