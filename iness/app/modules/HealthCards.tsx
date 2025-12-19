import React, { memo, useState } from "react";
import {
  View,
  Text,
  Platform,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
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
  const { isAvailable, syncData, canSync, syncStatus } = useAppleHealthSync();

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
   */
  const handleSyncSteps = async () => {
    console.log("========== [HealthCards] handleSyncSteps START ==========");
    console.log("[HealthCards] Timestamp:", new Date().toISOString());
    console.log("[HealthCards] Current syncingSteps state:", syncingSteps);
    
    if (!isAvailable) {
      console.log("[HealthCards] HealthKit not available, returning");
      setSnackbarMsg("Apple Health is only available on iOS");
      setSnackbarVisible(true);
      return;
    }

    // Check if sync is allowed
    if (!canSync("steps")) {
      console.log("[HealthCards] Sync not allowed (already enabled), returning");
      setSnackbarMsg("Steps sync is already enabled. Data syncs automatically.");
      setSnackbarVisible(true);
      return;
    }

    console.log("[HealthCards] Setting syncingSteps = true");
    setSyncingSteps(true);
    console.log("[HealthCards] syncingSteps after setState:", true);
    console.log("[HealthCards] isAvailable:", isAvailable);
    console.log("[HealthCards] syncStatus:", JSON.stringify(syncStatus));
    console.log("[HealthCards] Current stepsCount:", stepsCount);
    
    try {
      console.log("[HealthCards] About to call syncData('steps')...");
      const startTime = Date.now();
      const result = await syncData("steps");
      const duration = Date.now() - startTime;
      console.log(`[HealthCards] syncData returned after ${duration}ms`);
      console.log("[HealthCards] syncData result:", JSON.stringify(result));
      
      // Clear syncing state IMMEDIATELY to unblock UI
      console.log("[HealthCards] Setting syncingSteps = false (IMMEDIATELY)");
      setSyncingSteps(false);
      console.log("[HealthCards] syncingSteps cleared, UI should be unblocked now");
      
      if (result.success) {
        const syncedCount = result.syncedCount || 0;
        const todayValue = result.value || 0;
        console.log(`[HealthCards] Sync successful: ${syncedCount} entries, today: ${todayValue}`);
        
        // IMMEDIATELY update the Redux store with today's steps value
        // This gives instant UI feedback - backend sync happens in background
        if (todayValue > 0) {
          console.log("[HealthCards] About to update Redux store...");
          try {
            const newStepsValue = stepsCount + todayValue; // Add health data to existing
            const existingStepsData = currentDayTrackData.steps;
            console.log("[HealthCards] Redux update - current:", stepsCount, "adding:", todayValue, "new:", newStepsValue);
            
            const dispatchStartTime = Date.now();
            dispatch(updateTrackingField({
              type: "steps",
              data: {
                ...(existingStepsData || {}),
                steps: newStepsValue,
                date: existingStepsData?.date || new Date().toISOString().split('T')[0],
                userId: existingStepsData?.userId || '',
              } as any,
            }));
            const dispatchDuration = Date.now() - dispatchStartTime;
            console.log(`[HealthCards] Redux dispatch completed in ${dispatchDuration}ms`);
            console.log(`[HealthCards] Store updated: ${stepsCount} + ${todayValue} = ${newStepsValue}`);
          } catch (error) {
            console.error(`[HealthCards] ERROR updating store:`, error);
            console.error(`[HealthCards] Error stack:`, (error as any)?.stack);
          }
        }
        
        console.log(`[HealthCards] Steps sync completed: ${syncedCount} entries synced, today: ${todayValue}`);
        
        setSnackbarMsg(
          syncedCount > 1 
            ? `Synced ${syncedCount} days of steps data from Apple Health. Today: ${todayValue.toLocaleString()} steps`
            : `Synced ${todayValue.toLocaleString()} steps from Apple Health`
        );
        setSnackbarVisible(true);
        console.log("[HealthCards] Snackbar message set");
      } else {
        console.error("[HealthCards] Steps sync failed:", result.error);
        
        // Check if it's a permission issue
        if (result.error?.includes("permission") || HealthKit.wasPermissionDenied()) {
          console.log("[HealthCards] Permission denied, showing alert");
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
      console.log("[HealthCards] Setting syncingSteps = false (in catch)");
      setSyncingSteps(false);
    }
    
    console.log("========== [HealthCards] handleSyncSteps END ==========");
  };

  /**
   * Sync sleep from Apple Health
   */
  const handleSyncSleep = async () => {
    console.log("========== [HealthCards] handleSyncSleep START ==========");
    console.log("[HealthCards] Timestamp:", new Date().toISOString());
    console.log("[HealthCards] Current syncingSleep state:", syncingSleep);
    
    if (!isAvailable) {
      console.log("[HealthCards] HealthKit not available, returning");
      setSnackbarMsg("Apple Health is only available on iOS");
      setSnackbarVisible(true);
      return;
    }

    // Check if sync is allowed
    if (!canSync("sleep")) {
      console.log("[HealthCards] Sync not allowed (already enabled), returning");
      setSnackbarMsg("Sleep sync is already enabled. Data syncs automatically.");
      setSnackbarVisible(true);
      return;
    }

    console.log("[HealthCards] Setting syncingSleep = true");
    setSyncingSleep(true);
    console.log("[HealthCards] syncingSleep after setState:", true);
    console.log("[HealthCards] Current sleepDuration:", sleepDuration);
    
    try {
      console.log("[HealthCards] About to call syncData('sleep')...");
      const startTime = Date.now();
      const result = await syncData("sleep");
      const duration = Date.now() - startTime;
      console.log(`[HealthCards] syncData returned after ${duration}ms`);
      console.log("[HealthCards] syncData result:", JSON.stringify(result));
      
      // Clear syncing state IMMEDIATELY to unblock UI
      console.log("[HealthCards] Setting syncingSleep = false (IMMEDIATELY)");
      setSyncingSleep(false);
      console.log("[HealthCards] syncingSleep cleared, UI should be unblocked now");
      
      if (result.success) {
        const syncedCount = result.syncedCount || 0;
        const todayValue = result.value || 0;
        console.log(`[HealthCards] Sync successful: ${syncedCount} entries, today: ${todayValue}`);
        
        // IMMEDIATELY update the Redux store with today's sleep value
        // This gives instant UI feedback - backend sync happens in background
        if (todayValue > 0) {
          console.log("[HealthCards] About to update Redux store...");
          try {
            const newSleepValue = sleepDuration + todayValue; // Add health data to existing
            const existingSleepData = currentDayTrackData.sleep;
            console.log("[HealthCards] Redux update - current:", sleepDuration, "adding:", todayValue, "new:", newSleepValue);
            
            const dispatchStartTime = Date.now();
            dispatch(updateTrackingField({
              type: "sleep",
              data: {
                ...(existingSleepData || {}),
                sleepDuration: newSleepValue,
                date: existingSleepData?.date || new Date().toISOString().split('T')[0],
                userId: existingSleepData?.userId || '',
              } as any,
            }));
            const dispatchDuration = Date.now() - dispatchStartTime;
            console.log(`[HealthCards] Redux dispatch completed in ${dispatchDuration}ms`);
            console.log(`[HealthCards] Store updated: ${sleepDuration} + ${todayValue} = ${newSleepValue}`);
          } catch (error) {
            console.error(`[HealthCards] ERROR updating store:`, error);
            console.error(`[HealthCards] Error stack:`, (error as any)?.stack);
          }
        }
        
        console.log(`[HealthCards] Sleep sync completed: ${syncedCount} entries synced, today: ${todayValue}`);
        
        setSnackbarMsg(
          syncedCount > 1 
            ? `Synced ${syncedCount} days of sleep data from Apple Health. Today: ${todayValue} hrs`
            : `Synced ${todayValue} hours of sleep from Apple Health`
        );
        setSnackbarVisible(true);
        console.log("[HealthCards] Snackbar message set");
      } else {
        console.error("[HealthCards] Sleep sync failed:", result.error);
        
        // Check if it's a permission issue
        if (result.error?.includes("permission") || HealthKit.wasPermissionDenied()) {
          console.log("[HealthCards] Permission denied, showing alert");
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
      console.log("[HealthCards] Setting syncingSleep = false (in catch)");
      setSyncingSleep(false);
    }
    
    console.log("========== [HealthCards] handleSyncSleep END ==========");
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
          onPress={() => router.push("/(tabs)/dashboard/track")}
          activeOpacity={0.7}
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
          </View>
          {/* Sync row */}
          {Platform.OS === "ios" && canSync("steps") && (
            <View onStartShouldSetResponder={() => true}>
              <TouchableOpacity
                onPress={handleSyncSteps}
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
            </View>
          )}
        </TouchableOpacity>

        {/* Sleep Card */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/dashboard/track")}
          activeOpacity={0.7}
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
          </View>
          {/* Sync row */}
          {Platform.OS === "ios" && canSync("sleep") && (
            <View onStartShouldSetResponder={() => true}>
              <TouchableOpacity
                onPress={handleSyncSleep}
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
            </View>
          )}
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
