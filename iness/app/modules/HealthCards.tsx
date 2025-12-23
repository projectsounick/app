import React, { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
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

  // Helper function to trigger auto-sync - FIRE AND FORGET, NO BLOCKING
  const triggerAutoSync = useCallback((type: "steps" | "sleep") => {
    console.log(`[HealthCards] Auto-syncing ${type} after reactivation...`);
    
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
    console.log(`[HealthCards] onClose called`);
    const startTime = Date.now();
    // Close modal immediately - don't wait for anything
    setModalVisible(false);
    console.log(`[HealthCards] onClose completed in ${Date.now() - startTime}ms`);
  };
  const openModal = (key: "sleep" | "steps" | "water") => {
    console.log(`[HealthCards] openModal called for ${key}`);
    const startTime = Date.now();
    // Set state directly - React state updates are already async
    setOpenModalFor(key);
    setModalVisible(true);
    console.log(`[HealthCards] openModal completed in ${Date.now() - startTime}ms`);
  };

  function updateTrackingData(
    type: "sleep" | "steps" | "water",
    value: number
  ) {
    console.log(`[HealthCards] updateTrackingData START - type: ${type}, value: ${value}`);
    const startTime = performance.now();
    
    // CRITICAL: This function must return IMMEDIATELY - no async, no blocking
    // All work happens in background - UI stays completely responsive
    
    // Store values in closure to avoid accessing state during execution
    // Use try-catch to prevent any selector errors from blocking
    let existingData;
    try {
      existingData = currentDayTrackData[type];
    } catch (error) {
      console.error(`[HealthCards] updateTrackingData - error accessing currentDayTrackData:`, error);
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

    const syncTime = performance.now() - startTime;
    console.log(`[HealthCards] updateTrackingData - calculated newValue: ${newValue}, sync time: ${syncTime.toFixed(2)}ms`);

    // CRITICAL: Use setTimeout(0) to ensure function returns BEFORE async work starts
    // This ensures the modal can close immediately
    setTimeout(() => {
      const asyncStartTime = performance.now();
      console.log(`[HealthCards] updateTrackingData - async operation started`);
      
      // Fire and forget - simple async IIFE, no complex nesting
      (async () => {
        try {
          console.log(`[HealthCards] updateTrackingData - calling API for ${apiType}...`);
          const apiStartTime = performance.now();
          
          // Call API: send _id if exists, so backend knows to update
          const response = await trackService.updateTrackingData(
            newValue,
            Date.now(),
            apiType
          );

          const apiTime = performance.now() - apiStartTime;
          console.log(`[HealthCards] updateTrackingData - API call completed in ${apiTime.toFixed(2)}ms`);
          console.log(`[HealthCards] updateTrackingData - API response:`, response.success ? "success" : "failed");

          if (response.success && response.data) {
            console.log(`[HealthCards] updateTrackingData - scheduling Redux update...`);
            const reduxStartTime = performance.now();
            
            // CRITICAL: Use InteractionManager to defer Redux update until all interactions complete
            // This ensures the UI stays responsive and cards remain clickable
            InteractionManager.runAfterInteractions(() => {
              // Additional deferral to ensure modal is closed and UI is fully responsive
              setTimeout(() => {
                const reduxTime = performance.now() - reduxStartTime;
                console.log(`[HealthCards] updateTrackingData - Redux dispatch starting, time since schedule: ${reduxTime.toFixed(2)}ms`);
                
                const dispatchStartTime = performance.now();
                dispatch(
                  updateTrackingField({
                    type: type,
                    data: response.data,
                  })
                );
                const dispatchTime = performance.now() - dispatchStartTime;
                console.log(`[HealthCards] updateTrackingData - Redux dispatch completed in ${dispatchTime.toFixed(2)}ms`);
              }, 200); // Additional delay to ensure UI is fully responsive
            });
            
            // Update streak in background (fire and forget) - defer significantly
            console.log(`[HealthCards] updateTrackingData - creating streak...`);
            setTimeout(() => {
              createStreak()
                .then((responseStreak) => {
                  if (responseStreak.success) {
                    console.log(`[HealthCards] updateTrackingData - streak created, updating Redux...`);
                    // Defer streak Redux update even more
                    setTimeout(() => {
                      requestAnimationFrame(() => {
                        dispatch(setStreakData(responseStreak.data));
                      });
                    }, 50);
                  }
                })
                .catch((error) => {
                  console.error(`[HealthCards] updateTrackingData - streak error:`, error);
                });
            }, 200); // Delay streak creation to not block main update
          } else {
            console.log(`[HealthCards] updateTrackingData - API failed, showing error`);
            setSnackbarMsg("Some error has happened, try again");
            setSnackbarVisible(true);
          }
          
          const asyncTime = performance.now() - asyncStartTime;
          console.log(`[HealthCards] updateTrackingData - async operation completed in ${asyncTime.toFixed(2)}ms`);
        } catch (error) {
          console.error(`[HealthCards] updateTrackingData - EXCEPTION:`, error);
          console.error(`[HealthCards] updateTrackingData - exception stack:`, error instanceof Error ? error.stack : "no stack");
          setSnackbarVisible(true);
          setSnackbarMsg("Some error has happened, try again");
        }
      })();
    }, 0);
    
    const totalTime = performance.now() - startTime;
    console.log(`[HealthCards] updateTrackingData END - function returned in ${totalTime.toFixed(2)}ms`);
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

    // CRITICAL: Don't set syncing state - it blocks UI
    // Just fire sync and forget - UI stays responsive
    
    // Fire sync in background - NO AWAIT, NO BLOCKING
    syncData("steps").then((result) => {
      // Handle result in background - never blocks UI
      if (result.success) {
        const syncedCount = result.syncedCount || 0;
        const todayValue = result.value || 0;
        
        // Refresh from backend after sync completes (in background)
        // Use requestAnimationFrame to ensure non-blocking dispatch
        setTimeout(async () => {
          try {
            const response = await trackService.getCurrentDayTrackData();
            if (response.success && response.data?.steps) {
              requestAnimationFrame(() => {
                dispatch(updateTrackingField({
                  type: "steps",
                  data: response.data.steps,
                }));
              });
            }
          } catch (error) {
            console.error(`[HealthCards] Error refreshing data:`, error);
          }
        }, 1500);
        
        // Show snackbar
        setTimeout(() => {
          setSnackbarMsg(
            `Synced ${todayValue.toLocaleString()} steps from Apple Health${syncedCount > 1 ? ' (syncing historical data in background)' : ''}`
          );
          setSnackbarVisible(true);
        }, 300);
      } else {
        // Show error
        setTimeout(() => {
          if (result.error?.includes("permission") || HealthKit.wasPermissionDenied()) {
            HealthKit.showPermissionDeniedAlert();
          } else {
            setSnackbarMsg(result.error || "No steps data found in Apple Health");
            setSnackbarVisible(true);
          }
        }, 300);
      }
    }).catch((error: any) => {
      console.error("[HealthCards] EXCEPTION in handleSyncSteps:", error);
      setTimeout(() => {
        setSnackbarMsg(error.message || "Failed to sync steps");
        setSnackbarVisible(true);
      }, 300);
    });
  };

  /**
   * Sync sleep from Apple Health
   */
  const handleSyncSleep = async () => {
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

    // CRITICAL: Don't set syncing state - it blocks UI
    // Just fire sync and forget - UI stays responsive
    
    // Fire sync in background - NO AWAIT, NO BLOCKING
    syncData("sleep").then((result) => {
      // Handle result in background - never blocks UI
      if (result.success) {
        const syncedCount = result.syncedCount || 0;
        const todayValue = result.value || 0;
        
        // Refresh from backend after sync completes (in background)
        // Use requestAnimationFrame to ensure non-blocking dispatch
        setTimeout(async () => {
          try {
            const response = await trackService.getCurrentDayTrackData();
            if (response.success && response.data?.sleep) {
              requestAnimationFrame(() => {
                dispatch(updateTrackingField({
                  type: "sleep",
                  data: response.data.sleep,
                }));
              });
            }
          } catch (error) {
            console.error(`[HealthCards] Error refreshing data:`, error);
          }
        }, 1500);
        
        // Show snackbar
        setTimeout(() => {
          setSnackbarMsg(
            `Synced ${todayValue} hours of sleep from Apple Health${syncedCount > 1 ? ' (syncing historical data in background)' : ''}`
          );
          setSnackbarVisible(true);
        }, 300);
      } else {
        // Show error
        setTimeout(() => {
          if (result.error?.includes("permission") || HealthKit.wasPermissionDenied()) {
            HealthKit.showPermissionDeniedAlert();
          } else {
            setSnackbarMsg(result.error || "No sleep data found in Apple Health");
            setSnackbarVisible(true);
          }
        }, 300);
      }
    }).catch((error: any) => {
      console.error("[HealthCards] EXCEPTION in handleSyncSleep:", error);
      setTimeout(() => {
        setSnackbarMsg(error.message || "Failed to sync sleep");
        setSnackbarVisible(true);
      }, 300);
    });
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
            console.log(`[HealthCards] Steps card clicked`);
            router.push("/(tabs)/dashboard/track");
          }}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
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
            <View pointerEvents="box-none">
              <TouchableOpacity
                onPress={() => {
                  openModal("steps");
                }}
                style={{ padding: 6 }}
                activeOpacity={0.7}
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
            <View pointerEvents="box-none" style={{ marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  handleSyncSteps();
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: "#9747FF",
                    fontFamily: theme.fonts.medium,
                    fontWeight: "500",
                    fontSize: 12,
                  }}
                >
                  Sync with Apple Health
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#9747FF"
                />
              </TouchableOpacity>
            </View>
          )}
          {/* No "Synced with Apple Health" status shown - user manages sync from App Settings */}
        </TouchableOpacity>

        {/* Sleep Card */}
        <TouchableOpacity
          onPress={() => {
            console.log(`[HealthCards] Sleep card clicked`);
            router.push("/(tabs)/dashboard/track");
          }}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
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
            <View pointerEvents="box-none" style={{ marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  handleSyncSleep();
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: "#9747FF",
                    fontWeight: "500",
                    fontFamily: theme.fonts.medium,
                    fontSize: 12,
                  }}
                >
                  Sync with Apple Health
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#9747FF"
                />
              </TouchableOpacity>
            </View>
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
