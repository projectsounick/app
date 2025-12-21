import React, { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Platform,
  Modal,
  TouchableOpacity,

  ActivityIndicator,
  InteractionManager,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Progress from "react-native-progress";
import {
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import theme from "../Theme/globalTheme";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { router } from "expo-router";
import TrackerModal from "@/app/Modals/TrackingModal";
import CustomSnackbar from "./Snackbar";
import { trackService } from "../services/track.service";
import { updateTrackingField } from "@/Slices/trackSlice";
import { createStreak } from "../services/streaks.service";
import { setStreakData } from "@/Slices/streakSlice";
import { useAppleHealthSync } from "@/hooks/useAppleHealthSync";
import { HealthKit } from "@/services/healthSync";

function HealthDashboard() {
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
  const [updateDataLoading, setUpdateDataLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [syncingSteps, setSyncingSteps] = useState(false);
  const [syncingSleep, setSyncingSleep] = useState(false);

  // Apple Health sync hook
  const { isAvailable, syncData, canSync, syncStatus, refreshSyncStatus } = useAppleHealthSync();
  
  // Use ref to check canSync without causing re-renders
  const canSyncRef = useRef(canSync);
  const syncStatusRef = useRef(syncStatus);
  const previousSyncStatusRef = useRef<{ stepSync: boolean; sleepSync: boolean } | null>(null);
  
  useEffect(() => {
    canSyncRef.current = canSync;
    syncStatusRef.current = syncStatus;
  }, [canSync, syncStatus]);

  // Helper function to trigger auto-sync
  const triggerAutoSync = useCallback(async (type: "steps" | "sleep") => {
    console.log(`[HealthCards] Auto-syncing ${type} after reactivation...`);
    
    if (type === "steps") {
      setSyncingSteps(true);
      try {
        await InteractionManager.runAfterInteractions();
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = await syncData("steps");
        setSyncingSteps(false);
        
        if (result.success) {
          const todayValue = result.value || 0;
          if (todayValue > 0) {
            setTimeout(() => {
              try {
                const newStepsValue = stepsCount + todayValue;
                const existingStepsData = currentDayTrackData.steps;
                dispatch(updateTrackingField({
                  type: "steps",
                  data: {
                    ...(existingStepsData || {}),
                    steps: newStepsValue,
                    date: existingStepsData?.date || new Date().toISOString().split('T')[0],
                    userId: existingStepsData?.userId || '',
                  } as any,
                }));
              } catch (error) {
                console.error(`[HealthCards] ERROR updating store:`, error);
              }
            }, 0);
          }
          setSnackbarMsg(`Auto-synced ${todayValue.toLocaleString()} steps from Apple Health`);
          setSnackbarVisible(true);
        }
      } catch (error: any) {
        console.error("[HealthCards] Auto-sync steps error:", error);
        setSyncingSteps(false);
      }
    } else {
      setSyncingSleep(true);
      try {
        await InteractionManager.runAfterInteractions();
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = await syncData("sleep");
        setSyncingSleep(false);
        
        if (result.success) {
          const todayValue = result.value || 0;
          if (todayValue > 0) {
            setTimeout(() => {
              try {
                const newSleepValue = sleepDuration + todayValue;
                const existingSleepData = currentDayTrackData.sleep;
                dispatch(updateTrackingField({
                  type: "sleep",
                  data: {
                    ...(existingSleepData || {}),
                    sleepDuration: newSleepValue,
                    date: existingSleepData?.date || new Date().toISOString().split('T')[0],
                    userId: existingSleepData?.userId || '',
                  } as any,
                }));
              } catch (error) {
                console.error(`[HealthCards] ERROR updating store:`, error);
              }
            }, 0);
          }
          setSnackbarMsg(`Auto-synced ${todayValue} hours of sleep from Apple Health`);
          setSnackbarVisible(true);
        }
      } catch (error: any) {
        console.error("[HealthCards] Auto-sync sleep error:", error);
        setSyncingSleep(false);
      }
    }
  }, [syncData, stepsCount, sleepDuration, currentDayTrackData, dispatch]);

  // Refresh sync status when screen comes into focus (e.g., after returning from settings)
  // Also check for reactivation and auto-sync
  useFocusEffect(
    useCallback(() => {
      console.log("[HealthCards] Screen focused, checking sync status...");
      
      // Store current status BEFORE refresh (to compare after)
      const statusBeforeRefresh = syncStatusRef.current 
        ? { stepSync: syncStatusRef.current.stepSync, sleepSync: syncStatusRef.current.sleepSync }
        : null;
      
      // Refresh status
      refreshSyncStatus().then(() => {
        // After refresh completes, check if sync was reactivated
        setTimeout(() => {
          const currentStatus = syncStatusRef.current;
          
          if (statusBeforeRefresh && currentStatus) {
            // Check if steps sync was reactivated (false -> true)
            if (!statusBeforeRefresh.stepSync && currentStatus.stepSync) {
              console.log("[HealthCards] Steps sync reactivated, triggering auto-sync...");
              setTimeout(() => {
                triggerAutoSync("steps");
              }, 300);
            }
            
            // Check if sleep sync was reactivated (false -> true)
            if (!statusBeforeRefresh.sleepSync && currentStatus.sleepSync) {
              console.log("[HealthCards] Sleep sync reactivated, triggering auto-sync...");
              setTimeout(() => {
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
  
  // Only show "Sync with Apple Health" when syncModalShown is false (first time state)
  // Once syncModalShown becomes true (iOS modal was shown), we don't show sync UI on cards anymore
  // User can manage sync from App Settings instead
  const canSyncSteps = useMemo(() => {
    if (!syncStatus) return false; // Don't show if status not loaded yet
    // Only show if syncModalShown is false (first time)
    return syncStatus.syncModalShown === false;
  }, [syncStatus?.syncModalShown]);
  
  const canSyncSleep = useMemo(() => {
    if (!syncStatus) return false; // Don't show if status not loaded yet
    // Only show if syncModalShown is false (first time)
    return syncStatus.syncModalShown === false;
  }, [syncStatus?.syncModalShown]);

  const onClose = () => {
    setModalVisible(false);
  };
  const openModal = (key: "sleep" | "steps" | "water") => {
    setOpenModalFor(key);
    setModalVisible(true);
  };

  async function updateTrackingData(
    type: "sleep" | "steps" | "water",
    value: number
  ) {
    try {
      setUpdateDataLoading(true);
      // Map "steps" to "walk", others remain the same
      const apiType = type === "steps" ? "walk" : type;
      // Get current day's existing value
      const existingData: any = currentDayTrackData[type];

      // Calculate new value: add new value to existing if present
      let newValue = value;
      if (existingData) {
        if (type === "steps") newValue += existingData.steps || 0;
        else if (type === "sleep") newValue += existingData.sleepDuration || 0;
        else if (type === "water") newValue += existingData.waterIntake || 0;
      }

      // Call API: send _id if exists, so backend knows to update
      const response = await trackService.updateTrackingData(
        newValue,
        Date.now(),
        apiType
      );

      if (response.success && response.data) {
        /// Update the streak -------------------------/
        let responseStreak = await createStreak();
        if (responseStreak.success) {
          dispatch(setStreakData(responseStreak.data));
        }
        dispatch(
          updateTrackingField({
            type: type, // e.g., "steps", "sleep", "water"
            data: response.data, // must include `_id`
          })
        );
      } else {
        setSnackbarMsg("Some error has happened, try again");
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarVisible(true);
      setSnackbarMsg("Some error has happened, try again");
    } finally {
      setUpdateDataLoading(false);
    }
  }

  /**
   * Sync steps from Apple Health
   * @param forceManual - If true, allows sync even when sync is already enabled (for manual sync button)
   */
  const handleSyncSteps = async (forceManual: boolean = false) => {
    if (!isAvailable) {
      setSnackbarMsg("Apple Health is only available on iOS");
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

    setSyncingSteps(true);
    
    try {
      // Defer sync work to allow UI to render loading state first
      // Use both InteractionManager and setTimeout to ensure UI is responsive
      await InteractionManager.runAfterInteractions();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure UI renders
      
      const result = await syncData("steps");
      
      // Clear syncing state IMMEDIATELY to unblock UI
      setSyncingSteps(false);
      
      if (result.success) {
        const syncedCount = result.syncedCount || 0;
        const todayValue = result.value || 0;
        
        // IMMEDIATELY update the Redux store with today's steps value
        // This gives instant UI feedback - backend sync happens in background
        // Use setTimeout to make it non-blocking
        if (todayValue > 0) {
          setTimeout(() => {
            try {
              const newStepsValue = stepsCount + todayValue; // Add health data to existing
              const existingStepsData = currentDayTrackData.steps;
              
              dispatch(updateTrackingField({
                type: "steps",
                data: {
                  ...(existingStepsData || {}),
                  steps: newStepsValue,
                  date: existingStepsData?.date || new Date().toISOString().split('T')[0],
                  userId: existingStepsData?.userId || '',
                } as any,
              }));
            } catch (error) {
              console.error(`[HealthCards] ERROR updating store:`, error);
              console.error(`[HealthCards] Error stack:`, (error as any)?.stack);
            }
          }, 0);
        }
        
        // Set snackbar in next tick to avoid blocking
        setTimeout(() => {
          setSnackbarMsg(
            syncedCount > 1 
              ? `Synced ${syncedCount} days of steps data from Apple Health. Today: ${todayValue.toLocaleString()} steps`
              : `Synced ${todayValue.toLocaleString()} steps from Apple Health`
          );
          setSnackbarVisible(true);
        }, 0);
      } else {
        console.error("[HealthCards] Steps sync failed:", result.error);
        
        // Check if it's a permission issue
        if (result.error?.includes("permission") || HealthKit.wasPermissionDenied()) {
          HealthKit.showPermissionDeniedAlert();
        } else {
          setSnackbarMsg(result.error || "No steps data found in Apple Health");
          setSnackbarVisible(true);
        }
      }
    } catch (error: any) {
      console.error("[HealthCards] EXCEPTION in handleSyncSteps:", error);
      console.error("[HealthCards] Error message:", error?.message);
      console.error("[HealthCards] Error stack:", error?.stack);
      setSnackbarMsg(error.message || "Failed to sync steps");
      setSnackbarVisible(true);
      setSyncingSteps(false);
    }
  };

  /**
   * Sync sleep from Apple Health
   */
  const handleSyncSleep = async () => {
    // Store in ref for auto-sync functionality
    if (!isAvailable) {
      setSnackbarMsg("Apple Health is only available on iOS");
      setSnackbarVisible(true);
      return;
    }

    // Check if sync is allowed (use ref to avoid re-render issues)
    if (!canSyncRef.current("sleep")) {
      setSnackbarMsg("Sleep sync is already enabled. Data syncs automatically.");
      setSnackbarVisible(true);
      return;
    }

    setSyncingSleep(true);
    
    try {
      // Defer sync work to allow UI to render loading state first
      // Use both InteractionManager and setTimeout to ensure UI is responsive
      await InteractionManager.runAfterInteractions();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure UI renders
      
      const result = await syncData("sleep");
      
      // Clear syncing state IMMEDIATELY to unblock UI
      setSyncingSleep(false);
      
      if (result.success) {
        const syncedCount = result.syncedCount || 0;
        const todayValue = result.value || 0;
        
        // IMMEDIATELY update the Redux store with today's sleep value
        // This gives instant UI feedback - backend sync happens in background
        // Use setTimeout to make it non-blocking
        if (todayValue > 0) {
          setTimeout(() => {
            try {
              const newSleepValue = sleepDuration + todayValue; // Add health data to existing
              const existingSleepData = currentDayTrackData.sleep;
              
              dispatch(updateTrackingField({
                type: "sleep",
                data: {
                  ...(existingSleepData || {}),
                  sleepDuration: newSleepValue,
                  date: existingSleepData?.date || new Date().toISOString().split('T')[0],
                  userId: existingSleepData?.userId || '',
                } as any,
              }));
            } catch (error) {
              console.error(`[HealthCards] ERROR updating store:`, error);
              console.error(`[HealthCards] Error stack:`, (error as any)?.stack);
            }
          }, 0);
        }
        
        // Set snackbar in next tick to avoid blocking
        setTimeout(() => {
          setSnackbarMsg(
            syncedCount > 1 
              ? `Synced ${syncedCount} days of sleep data from Apple Health. Today: ${todayValue} hrs`
              : `Synced ${todayValue} hours of sleep from Apple Health`
          );
          setSnackbarVisible(true);
        }, 0);
      } else {
        console.error("[HealthCards] Sleep sync failed:", result.error);
        
        // Check if it's a permission issue
        if (result.error?.includes("permission") || HealthKit.wasPermissionDenied()) {
          HealthKit.showPermissionDeniedAlert();
        } else {
          setSnackbarMsg(result.error || "No sleep data found in Apple Health");
          setSnackbarVisible(true);
        }
      }
    } catch (error: any) {
      console.error("[HealthCards] EXCEPTION in handleSyncSleep:", error);
      console.error("[HealthCards] Error message:", error?.message);
      console.error("[HealthCards] Error stack:", error?.stack);
      setSnackbarMsg(error.message || "Failed to sync sleep");
      setSnackbarVisible(true);
      setSyncingSleep(false);
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Row with Steps & Sleep */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Steps Card */}
        <TouchableOpacity
          onPress={() => {
            if (!syncingSteps) {
              router.push("/(tabs)/dashboard/track");
            }
          }}
          activeOpacity={0.7}
          disabled={false}
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: "#F5F5F5",
          }}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "#F3EDFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="walk"
                  size={18}
                  color="#9747FF"
                />
              </View>
              <Text
                style={{
                  fontFamily: theme.fonts.bold,
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#000",
                }}
              >
                Steps
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => openModal("steps")}
                style={{ padding: 6 }}
              >
                <AntDesign name="pluscircle" size={22} color="#67c694" />
              </TouchableOpacity>
            </View>
          </View>

          <Progress.Bar
            progress={stepsCount / stepsGoal}
            width={null}
            color="#9747FF"
            unfilledColor="#F0F0F0"
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
                fontSize: 13,
                color: "#666",
              }}
            >
              {stepsCount.toLocaleString()}/{stepsGoal.toLocaleString()}
            </Text>
            {/* Apple Health sync indicator - bottom right of number */}
            {syncStatus?.stepSync && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F3EDFF",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="heart" size={10} color="#9747FF" />
                <Text
                  style={{
                    fontSize: 9,
                    color: "#9747FF",
                    fontFamily: theme.fonts.medium,
                    marginLeft: 3,
                  }}
                >
                  Health
                </Text>
              </View>
            )}
          </View>
          {/* Sync row - Show "Sync with Apple Health" when sync is NOT enabled */}
          {Platform.OS === "ios" && canSyncSteps && (
            <TouchableOpacity
              onPress={() => {
                handleSyncSteps();
              }}
              disabled={syncingSteps}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                justifyContent: "space-between",
                opacity: syncingSteps ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {syncingSteps && (
                  <ActivityIndicator size="small" color="#9747FF" style={{ marginRight: 8 }} />
                )}
                <Text
                  style={{
                    color: "#9747FF",
                    fontFamily: theme.fonts.medium,
                    fontWeight: "500",
                    fontSize: 12,
                  }}
                >
                  {syncingSteps ? "Syncing..." : "Sync with Apple Health"}
                </Text>
              </View>
              {!syncingSteps && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#9747FF"
                />
              )}
            </TouchableOpacity>
          )}
          {/* No "Synced with Apple Health" status shown - user manages sync from App Settings */}
        </TouchableOpacity>

        {/* Sleep Card */}
        <TouchableOpacity
          onPress={() => {
            if (!syncingSleep) {
              router.push("/(tabs)/dashboard/track");
            }
          }}
          activeOpacity={0.7}
          disabled={false}
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: "#F5F5F5",
          }}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "#F3EDFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="moon-waning-crescent"
                  size={18}
                  color="#9747FF"
                />
              </View>
              <Text
                style={{
                  fontWeight: "700",
                  fontFamily: theme.fonts.bold,
                  fontSize: 15,
                  color: "#000",
                }}
              >
                Sleep
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => openModal("sleep")}
                style={{ padding: 6 }}
              >
                <AntDesign name="pluscircle" size={22} color="#67c694" />
              </TouchableOpacity>
            </View>
          </View>

          <Progress.Bar
            progress={sleepDuration / sleepGoal}
            width={null}
            color="#9747FF"
            unfilledColor="#F0F0F0"
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
                fontSize: 13,
                color: "#666",
              }}
            >
              {sleepDuration}/{sleepGoal} hrs
            </Text>
            {/* Apple Health sync indicator - bottom right of number */}
            {syncStatus?.sleepSync && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F3EDFF",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="heart" size={10} color="#9747FF" />
                <Text
                  style={{
                    fontSize: 9,
                    color: "#9747FF",
                    fontFamily: theme.fonts.medium,
                    marginLeft: 3,
                  }}
                >
                  Health
                </Text>
              </View>
            )}
          </View>
          {/* Sync row - Show "Sync with Apple Health" when sync is NOT enabled */}
          {Platform.OS === "ios" && canSyncSleep && (
            <TouchableOpacity
              onPress={() => {
                handleSyncSleep();
              }}
              disabled={syncingSleep}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                justifyContent: "space-between",
                opacity: syncingSleep ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {syncingSleep && (
                  <ActivityIndicator size="small" color="#9747FF" style={{ marginRight: 8 }} />
                )}
                <Text
                  style={{
                    color: "#9747FF",
                    fontWeight: "500",
                    fontFamily: theme.fonts.medium,
                    fontSize: 12,
                  }}
                >
                  {syncingSleep ? "Syncing..." : "Sync with Apple Health"}
                </Text>
              </View>
              {!syncingSleep && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#9747FF"
                />
              )}
            </TouchableOpacity>
          )}
          {/* No "Synced with Apple Health" status shown - user manages sync from App Settings */}
        </TouchableOpacity>
      </View>

      {/* Water Card */}
      <View
        style={{
          marginTop: 12,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#F5F5F5",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "#F3EDFF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <MaterialCommunityIcons
                name="cup-water"
                size={18}
                color="#9747FF"
              />
            </View>
            <Text
              style={{
                fontWeight: "700",
                fontFamily: theme.fonts.bold,
                fontSize: 15,
                color: "#000",
              }}
            >
              Water
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => openModal("water")}
            style={{ padding: 6 }}
          >
            <AntDesign name="pluscircle" size={24} color="#67c694" />
          </TouchableOpacity>
        </View>

        <Progress.Bar
          progress={waterIntake / waterGoal}
          width={null}
          color="#9747FF"
          unfilledColor="#F0F0F0"
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
              fontSize: 13,
              color: "#666",
            }}
          >
            {waterIntake}/{waterGoal} Glasses
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/dashboard/track")}
            style={{ padding: 8, marginRight: -8, marginVertical: -8 }}
          >
            <Ionicons name="chevron-forward" size={18} color="#999" />
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
          dataLoading={updateDataLoading}
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
    </View>
  );
}

export default memo(HealthDashboard);
