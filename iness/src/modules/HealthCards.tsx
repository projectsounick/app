import { safeRouter } from "@/src/utils/safeRouter";
import React, { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "expo-router";
import * as Progress from "react-native-progress";
import {
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { useGlobalTheme } from "../Theme/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import TrackerModal from "@/src/Modals/TrackingModal";
import CustomSnackbar from "./Snackbar";
import { trackService } from "../services/track.service";
import { updateTrackingField } from "@/Slices/trackSlice";
import { createStreak } from "../services/streaks.service";
import { setStreakData } from "@/Slices/streakSlice";
import { useAppleHealthSync } from "@/hooks/useAppleHealthSync";
import { useAndroidHealthSync } from "@/hooks/useAndroidHealthSync";
import type { UseHealthSyncReturn } from "@/services/healthSync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HealthConnectSetupModal from "@/src/Modals/HealthConnectSetupModal";

// ============================================
// Android Health Connect Sync Modal Component
// ============================================
// COMMENTED OUT - Android Health Connect feature disabled for now
// The entire HealthConnectSyncModal component and styles have been removed
// to avoid syntax errors. Can be restored from git history when needed.

function HealthDashboardContent({
  healthSync,
}: {
  healthSync: UseHealthSyncReturn;
}) {
  const theme = useGlobalTheme();
  const { width } = useWindowDimensions();
  const compactLayout = width < 360;
  const styles = useMemo(
    () => getStyles(theme, compactLayout),
    [theme, compactLayout]
  );
  //// Store data -------------------------------------------------------/
  const currentDayTrackData = useSelector(
    (state: RootState) => state.track.currentDateTrackData
  );
  // Safely access values, defaulting to 0 if null
  const stepsCount = currentDayTrackData.steps?.steps ?? 0;
  const sleepDuration = currentDayTrackData.sleep?.sleepDuration ?? 0;
  const waterIntake = currentDayTrackData.water?.waterIntake ?? 0;
  const stepsGoal = 10000;
  const dispatch = useDispatch();
  const sleepGoal = 8;

  const waterGoal = 10;

  const [modalVisible, setModalVisible] = useState(false);
  const [openModalFor, setOpenModalFor] = useState<"sleep" | "steps" | "water">(
    "sleep"
  );
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  // Android Health Connect Sync Modal state
  const [healthConnectModalVisible, setHealthConnectModalVisible] = useState(false);
  const [healthConnectModalType, setHealthConnectModalType] = useState<"steps" | "sleep">("steps");

  const { isAvailable, syncData, canSync, syncStatus, refreshSyncStatus } =
    healthSync;

  // Use ref to check canSync without causing re-renders
  const canSyncRef = useRef(canSync);
  const syncStatusRef = useRef(syncStatus);
  const previousSyncStatusRef = useRef<{ stepSync: boolean; sleepSync: boolean } | null>(null);

  useEffect(() => {
    canSyncRef.current = canSync;
    syncStatusRef.current = syncStatus;
  }, [canSync, syncStatus]);

  // Helper function to trigger auto-sync - FIRE AND FORGET, NO BLOCKING
  const triggerAutoSync = useCallback((type: "steps" | "sleep") => {
    // Fire sync - don't await, don't block UI
    syncData(type).then((result) => {
      if (result.success) {
        // Refresh from backend after sync completes
        setTimeout(async () => {
          try {
            const response = await trackService.getCurrentDayTrackData();
            if (response.success) {
              if (type === "steps" && response.data?.steps) {
                requestAnimationFrame(() => {
                  dispatch(updateTrackingField({
                    type: "steps",
                    data: response.data.steps,
                  }));
                });
              } else if (type === "sleep" && response.data?.sleep) {
                requestAnimationFrame(() => {
                  dispatch(updateTrackingField({
                    type: "sleep",
                    data: response.data.sleep,
                  }));
                });
              }
            }
          } catch (error) {
            console.error(`[HealthCards] Error refreshing data:`, error);
          }
        }, 1500);

        setTimeout(() => {
          setSnackbarMsg(`Auto sync enabled`);
          setSnackbarVisible(true);
        }, 300);
      }
    }).catch((error: any) => {
      console.error(`[HealthCards] Auto-sync ${type} error:`, error);
    });
  }, [syncData, dispatch]);

  // Refresh sync status when screen comes into focus (e.g., after returning from settings)
  // Also check for reactivation and auto-sync
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const schedule = (callback: () => void, delay: number) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (active) callback();
        }, delay);
        timers.add(timer);
      };

      // Store current status BEFORE refresh (to compare after)
      const statusBeforeRefresh = syncStatusRef.current
        ? { stepSync: syncStatusRef.current.stepSync, sleepSync: syncStatusRef.current.sleepSync }
        : null;

      // Refresh status
      refreshSyncStatus().then(() => {
        if (!active) return;
        // After refresh completes, check if sync was reactivated
        schedule(() => {
          const currentStatus = syncStatusRef.current;

          if (statusBeforeRefresh && currentStatus) {
            // Check if steps sync was reactivated (false -> true)
            if (!statusBeforeRefresh.stepSync && currentStatus.stepSync) {
              schedule(() => {
                triggerAutoSync("steps");
              }, 300);
            }

            // Check if sleep sync was reactivated (false -> true)
            if (!statusBeforeRefresh.sleepSync && currentStatus.sleepSync) {
              schedule(() => {
                triggerAutoSync("sleep");
              }, 300);
            }
          }

          // Update previous status for next time
          if (currentStatus) {
            previousSyncStatusRef.current = {
              stepSync: currentStatus.stepSync,
              sleepSync: currentStatus.sleepSync,
            };
          }
        }, 200); // Small delay to ensure state is updated
      });

      return () => {
        active = false;
        timers.forEach(clearTimeout);
        timers.clear();
      };
    }, [refreshSyncStatus, triggerAutoSync])
  );

  // Initialize previous status on mount
  useEffect(() => {
    if (syncStatus && !previousSyncStatusRef.current) {
      previousSyncStatusRef.current = {
        stepSync: syncStatus.stepSync,
        sleepSync: syncStatus.sleepSync,
      };
    }
  }, [syncStatus]);

  // Only show "Sync with Health" when:
  // 1. Status is loaded
  // 2. The specific sync type is NOT already enabled (stepSync/sleepSync is false)
  // 3. syncModalShown is false (first time state) OR sync is not enabled
  const canSyncSteps = useMemo(() => {
    if (!syncStatus) return false; // Don't show if status not loaded yet
    // Hide if steps sync is already enabled
    if (syncStatus.stepSync === true) return false;
    // Show if syncModalShown is false (first time) OR if stepSync is false
    return syncStatus.syncModalShown === false || syncStatus.stepSync === false;
  }, [syncStatus]);

  const canSyncSleep = useMemo(() => {
    if (!syncStatus) return false; // Don't show if status not loaded yet
    // Hide if sleep sync is already enabled
    if (syncStatus.sleepSync === true) return false;
    // Show if syncModalShown is false (first time) OR if sleepSync is false
    return syncStatus.syncModalShown === false || syncStatus.sleepSync === false;
  }, [syncStatus]);

  const onClose = () => {
    // Close modal immediately - don't wait for anything
    setModalVisible(false);
  };
  const openModal = (key: "sleep" | "steps" | "water") => {
    // Set state directly - React state updates are already async
    setOpenModalFor(key);
    setModalVisible(true);
  };

  function updateTrackingData(
    type: "sleep" | "steps" | "water",
    value: number
  ) {
    // CRITICAL: This function must return IMMEDIATELY - no async, no blocking
    // All work happens in background - UI stays completely responsive

    // Store values in closure to avoid accessing state during execution
    // Use try-catch to prevent any selector errors from blocking
    let existingData: any;
    try {
      existingData = currentDayTrackData[type];
    } catch {
      existingData = null;
    }

    const apiType = type === "steps" ? "walk" : type;

    // Calculate new value immediately (synchronous, fast)
    let newValue = value;
    if (existingData) {
      if (type === "steps") newValue += existingData.steps || 0;
      else if (type === "sleep") newValue += existingData.sleepDuration || 0;
      else if (type === "water") newValue += existingData.waterIntake || 0;
    }

    // CRITICAL: Use setTimeout(0) to ensure function returns BEFORE async work starts
    // This ensures the modal can close immediately
    setTimeout(() => {
      // Fire and forget - simple async IIFE, no complex nesting
      (async () => {
        try {
          // Call API: send _id if exists, so backend knows to update
          const response = await trackService.updateTrackingData(
            newValue,
            Date.now(),
            apiType
          );

          if (response.success && response.data) {
            AccessibilityInfo.announceForAccessibility(`${type} updated successfully`);
            // CRITICAL: Use setTimeout instead of InteractionManager to avoid blocking
            // InteractionManager can wait indefinitely if interactions don't complete
            // Use a fixed delay to ensure modal is closed and UI is responsive
            setTimeout(() => {
              dispatch(
                updateTrackingField({
                  type: type,
                  data: response.data,
                })
              );
            }, 300); // Fixed delay to ensure modal is closed and UI is responsive

            // Update streak in background (fire and forget) - defer significantly
            setTimeout(() => {
              createStreak()
                .then((responseStreak) => {
                  if (responseStreak.success) {
                    // Defer streak Redux update even more
                    setTimeout(() => {
                      requestAnimationFrame(() => {
                        dispatch(setStreakData(responseStreak.data));
                      });
                    }, 50);
                  }
                })
                .catch(() => {
                  // Streak error
                });
            }, 200); // Delay streak creation to not block main update
          } else {
            AccessibilityInfo.announceForAccessibility(`Unable to update ${type}`);
            setSnackbarMsg("Some error has happened, try again");
            setSnackbarVisible(true);
          }
        } catch {
          AccessibilityInfo.announceForAccessibility(`Unable to update ${type}`);
          setSnackbarVisible(true);
          setSnackbarMsg("Some error has happened, try again");
        }
      })();
    }, 0);
  }

  /**
   * Sync steps from Apple Health / Health Connect
   * @param forceManual - If true, allows sync even when sync is already enabled (for manual sync button)
   */
  const handleSyncSteps = async (forceManual: boolean = false) => {
    if (!isAvailable) {
      const platformName = Platform.OS === "ios" ? "Apple Health" : "Health Connect";
      setSnackbarMsg(`${platformName} is not available on this device`);
      setSnackbarVisible(true);
      return;
    }

    // Check if sync is allowed (use ref to avoid re-render issues)
    // Allow if forceManual is true (manual sync button) or if sync is not enabled yet
    if (!forceManual && !canSyncRef.current("steps")) {
      setSnackbarMsg("Steps sync is already enabled. Data syncs automatically.");
      setSnackbarVisible(true);
      return;
    }

    // For Android, show setup modal first (don't redirect)
    if (Platform.OS === "android") {
      setHealthConnectModalType("steps");
      setHealthConnectModalVisible(true);
      return;
    }

    // For iOS, redirect to splash screen and sync in background
    // Store sync in progress flag
    await AsyncStorage.setItem("healthSyncInProgress", JSON.stringify({ type: "steps", platform: Platform.OS }));

    // Start sync in background (don't await)
    syncData("steps").then(async (result) => {
      // Clear sync flag when done
      await AsyncStorage.removeItem("healthSyncInProgress");
    }).catch(async () => {
      // Clear sync flag on error
      await AsyncStorage.removeItem("healthSyncInProgress");
    });

    // Redirect to splash screen (sync is running in background)
    safeRouter.navigate("/secondsplashscreen");
  };

  /**
   * Handle continue from Health Connect setup modal
   */
  const handleHealthConnectContinue = async () => {
    setHealthConnectModalVisible(false);

    // Store sync in progress flag
    await AsyncStorage.setItem("healthSyncInProgress", JSON.stringify({ type: healthConnectModalType, platform: Platform.OS }));

    // Start sync in background (don't await)
    syncData(healthConnectModalType).then(async (result) => {
      // Clear sync flag when done
      await AsyncStorage.removeItem("healthSyncInProgress");
    }).catch(async () => {
      // Clear sync flag on error
      await AsyncStorage.removeItem("healthSyncInProgress");
    });

    // Redirect to splash screen (sync is running in background) - same as iOS
    safeRouter.navigate("/secondsplashscreen");
  };

  /**
   * Sync sleep from Apple Health / Health Connect
   */
  const handleSyncSleep = async () => {
    if (!isAvailable) {
      const platformName = Platform.OS === "ios" ? "Apple Health" : "Health Connect";
      setSnackbarMsg(`${platformName} is not available on this device`);
      setSnackbarVisible(true);
      return;
    }

    // Check if sync is allowed (use ref to avoid re-render issues)
    if (!canSyncRef.current("sleep")) {
      setSnackbarMsg("Sleep sync is already enabled. Data syncs automatically.");
      setSnackbarVisible(true);
      return;
    }

    // For Android, show setup modal first (don't redirect)
    if (Platform.OS === "android") {
      setHealthConnectModalType("sleep");
      setHealthConnectModalVisible(true);
      return;
    }

    // For iOS, redirect to splash screen and sync in background
    // Store sync in progress flag
    await AsyncStorage.setItem("healthSyncInProgress", JSON.stringify({ type: "sleep", platform: Platform.OS }));

    // Start sync in background (don't await)
    syncData("sleep").then(async (result) => {
      // Clear sync flag when done
      await AsyncStorage.removeItem("healthSyncInProgress");
    }).catch(async () => {
      // Clear sync flag on error
      await AsyncStorage.removeItem("healthSyncInProgress");
    });

    // Redirect to splash screen (sync is running in background)
    safeRouter.navigate("/secondsplashscreen");
  };

  return (
    <View style={styles.container} accessibilityRole="summary">
      {/* Row with Steps & Sleep */}
      <View
        style={styles.metricCardsRow}
      >
        {/* Steps Card */}
        <TouchableOpacity
          onPress={() => {
            safeRouter.navigate("/(tabs)/dashboard/track");
          }}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
          style={[styles.metricCard, (isAvailable && canSyncSteps) && styles.metricCardWithSync]}
          accessibilityRole="button"
          accessibilityLabel={`Steps, ${stepsCount.toLocaleString()} of ${stepsGoal.toLocaleString()}`}
          accessibilityHint="Opens health tracking"
        >
          {/* Header Row */}
          <View
            style={styles.cardHeader}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons
                  name="walk"
                  size={16}
                  color={theme.colors.secondPrimary}
                />
              </View>
              <Text
                style={styles.cardTitle}
              >
                Steps
              </Text>
            </View>
            <View pointerEvents="box-none">
              <TouchableOpacity
                onPress={() => {
                  openModal("steps");
                }}
                style={styles.addButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Add steps"
              >
                <AntDesign name="plus-circle" size={20} color={theme.colors.success} />
              </TouchableOpacity>
            </View>
          </View>

          <Progress.Bar
            progress={stepsCount / stepsGoal}
            width={null}
            color={theme.colors.secondPrimary}
            unfilledColor={theme.colors.backgroundSecondary}
            borderWidth={0}
            height={8}
            borderRadius={4}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontFamily: theme.fonts.regular,
                fontSize: theme.fontSizes.regularSmall,
                color: theme.colors.textSecondary,
              }}
            >
              {stepsCount.toLocaleString()}/{stepsGoal.toLocaleString()}
            </Text>
            {/* Health sync indicator - bottom right of number (iOS: Apple Health, Android: Health Connect) */}
            {isAvailable && syncStatus?.stepSync && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.colors.backgroundCardLight,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="heart" size={10} color={theme.colors.secondPrimary} />
                <Text
                  style={{
                    fontSize: theme.fontSizes.small,
                    color: theme.colors.secondPrimary,
                    fontFamily: theme.fonts.medium,
                    marginLeft: 3,
                  }}
                >
                  Health
                </Text>
              </View>
            )}
          </View>
          {/* Sync row - Show "Sync with Health" when sync is NOT enabled */}
          {isAvailable && canSyncSteps && (
            <View pointerEvents="box-none" style={{ marginTop: 6 }}>
              <TouchableOpacity
                onPress={() => {
                  handleSyncSteps();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.syncButton}
                accessibilityRole="button"
                accessibilityLabel={Platform.OS === "ios" ? "Sync steps with Apple Health" : "Sync steps with Health Connect"}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.colors.secondPrimary,
                    fontFamily: theme.fonts.medium,
                    fontWeight: theme.fontWeights.medium as "500",
                    fontSize: theme.fontSizes.small,
                    flexShrink: 1,
                    flex: 1,
                  }}
                >
                  {Platform.OS === "ios" ? "Sync with Apple Health" : "Sync with Health Connect"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.secondPrimary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          )}
          {/* No "Synced with Health" status shown - user manages sync from App Settings */}
        </TouchableOpacity>

        {/* Sleep Card */}
        <TouchableOpacity
          onPress={() => {
            safeRouter.navigate("/(tabs)/dashboard/track");
          }}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
          style={[styles.metricCard, (isAvailable && canSyncSleep) && styles.metricCardWithSync]}
          accessibilityRole="button"
          accessibilityLabel={`Sleep, ${sleepDuration} of ${sleepGoal} hours`}
          accessibilityHint="Opens health tracking"
        >
          {/* Header Row */}
          <View
            style={styles.cardHeader}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons
                  name="moon-waning-crescent"
                  size={16}
                  color={theme.colors.secondPrimary}
                />
              </View>
              <Text
                style={styles.cardTitle}
              >
                Sleep
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => openModal("sleep")}
                style={styles.addButton}
                accessibilityRole="button"
                accessibilityLabel="Add sleep"
              >
                <AntDesign name="plus-circle" size={20} color={theme.colors.success} />
              </TouchableOpacity>
            </View>
          </View>

          <Progress.Bar
            progress={sleepDuration / sleepGoal}
            width={null}
            color={theme.colors.secondPrimary}
            unfilledColor={theme.colors.backgroundSecondary}
            borderWidth={0}
            height={8}
            borderRadius={4}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 6,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontFamily: theme.fonts.regular,
                fontSize: theme.fontSizes.regularSmall,
                color: theme.colors.textSecondary,
              }}
            >
              {sleepDuration}/{sleepGoal} hrs
            </Text>
            {/* Health sync indicator - bottom right of number (iOS: Apple Health, Android: Health Connect) */}
            {isAvailable && syncStatus?.sleepSync && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.colors.backgroundCardLight,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="heart" size={10} color={theme.colors.secondPrimary} />
                <Text
                  style={{
                    fontSize: theme.fontSizes.small,
                    color: theme.colors.secondPrimary,
                    fontFamily: theme.fonts.medium,
                    marginLeft: 3,
                  }}
                >
                  Health
                </Text>
              </View>
            )}
          </View>
          {/* Sync row - Show "Sync with Health" when sync is NOT enabled */}
          {isAvailable && canSyncSleep && (
            <View pointerEvents="box-none" style={{ marginTop: 6 }}>
              <TouchableOpacity
                onPress={() => {
                  handleSyncSleep();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.syncButton}
                accessibilityRole="button"
                accessibilityLabel={Platform.OS === "ios" ? "Sync sleep with Apple Health" : "Sync sleep with Health Connect"}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.colors.secondPrimary,
                    fontWeight: theme.fontWeights.medium as "500",
                    fontFamily: theme.fonts.medium,
                    fontSize: theme.fontSizes.small,
                    flexShrink: 1,
                    flex: 1,
                  }}
                >
                  {Platform.OS === "ios" ? "Sync with Apple Health" : "Sync with Health Connect"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.secondPrimary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          )}
          {/* No "Synced with Health" status shown - user manages sync from App Settings */}
        </TouchableOpacity>
      </View>

      {/* Water Card */}
      <View
        style={styles.waterCard}
      >
        <View
          style={styles.cardHeader}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={styles.iconContainer}
            >
              <MaterialCommunityIcons
                name="cup-water"
                size={16}
                color={theme.colors.secondPrimary}
              />
            </View>
            <Text
              style={styles.cardTitle}
            >
              Water
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => openModal("water")}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel="Add water intake"
          >
            <AntDesign name="plus-circle" size={20} color={theme.colors.success} />
          </TouchableOpacity>
        </View>

        <Progress.Bar
          progress={waterIntake / waterGoal}
          width={null}
          color={theme.colors.secondPrimary}
          unfilledColor={theme.colors.backgroundSecondary}
          borderWidth={0}
          height={8}
          borderRadius={4}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <Text
            style={{
              fontWeight: theme.fontWeights.medium as "500",
              fontFamily: theme.fonts.regular,
              fontSize: theme.fontSizes.regularSmall,
              color: theme.colors.textSecondary,
            }}
          >
            {waterIntake}/{waterGoal} Glasses
          </Text>
          <TouchableOpacity
            onPress={() => safeRouter.navigate("/(tabs)/dashboard/track")}
            style={styles.detailsButton}
            accessibilityRole="button"
            accessibilityLabel={`Water, ${waterIntake} of ${waterGoal} glasses`}
            accessibilityHint="Opens health tracking"
          >
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* BottomSheet Modal */}
      {modalVisible ? (
        <TrackerModal
          visible={modalVisible}
          onClose={onClose}
          type={openModalFor}
          onSubmit={updateTrackingData}
          dataLoading={false}
        />
      ) : null}

      {snackbarVisible ? (
        <CustomSnackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          bgColor="#FFFFFF"
          message={snackbarMsg}
        />
      ) : null}

      {/* Android Health Connect Setup Modal */}
      {Platform.OS === "android" && (
        <HealthConnectSetupModal
          visible={healthConnectModalVisible}
          onClose={() => {
            setHealthConnectModalVisible(false);
          }}
          type={healthConnectModalType}
          onContinue={handleHealthConnectContinue}
        />
      )}
    </View>
  );
}

function AppleHealthDashboard() {
  return <HealthDashboardContent healthSync={useAppleHealthSync()} />;
}

function AndroidHealthDashboard() {
  return <HealthDashboardContent healthSync={useAndroidHealthSync()} />;
}

function HealthDashboard() {
  return Platform.OS === "ios" ? (
    <AppleHealthDashboard />
  ) : (
    <AndroidHealthDashboard />
  );
}

export default memo(HealthDashboard);

const getStyles = (theme: any, compact: boolean) =>
  StyleSheet.create({
    container: { marginBottom: 16 },
    metricCardsRow: {
      flexDirection: compact ? "column" : "row",
      justifyContent: "space-between",
      gap: 12,
    },
    metricCard: {
      flex: compact ? undefined : 1,
      width: compact ? "100%" : undefined,
      minHeight: 100,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 12,
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    metricCardWithSync: { minHeight: 120 },
    waterCard: {
      marginTop: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 12,
      shadowColor: theme.colors.dark,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    iconContainer: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    cardTitle: {
      fontWeight: theme.fontWeights.bold as "700",
      fontFamily: theme.fonts.bold,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
    },
    addButton: {
      width: 44,
      height: 44,
      margin: -8,
      alignItems: "center",
      justifyContent: "center",
    },
    syncButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    detailsButton: {
      width: 44,
      height: 44,
      marginRight: -12,
      marginVertical: -12,
      alignItems: "center",
      justifyContent: "center",
    },
  });
