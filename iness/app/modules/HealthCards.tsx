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
import TrackerModal from "../Components/Tracking/TrackingModal";
import CustomSnackbar from "./Snackbar";
import { trackService } from "../services/track.service";
import { updateTrackingField } from "@/Slices/trackSlice";
import { createStreak } from "../services/streaks.service";
import { setStreakData } from "@/Slices/streakSlice";

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
        <View
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
                  borderRadius: 16,
                  backgroundColor: "#F3EDFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="walk"
                  size={14}
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
            <TouchableOpacity
              onPress={() => openModal("steps")}
              style={{ padding: 6 }}
            >
              <AntDesign name="pluscircle" size={22} color="#67c694" />
            </TouchableOpacity>
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
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/dashboard/track")}
            >
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
          {/* Sync row */}
          {/* <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {Platform.OS === "ios" ? (
                <Ionicons name="logo-apple" size={18} color="#7771de" />
              ) : (
                <MaterialCommunityIcons
                  name="google-fit"
                  size={16}
                  color="#7771de"
                />
              )}
              <Text
                style={{
                  marginLeft: 6,
                  color: "#7771de",
                  fontFamily: theme.fonts.medium,
                  fontWeight: "500",
                }}
              >
                Sync your steps
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={18}
              color="#7771de"
            />
          </TouchableOpacity> */}
        </View>

        {/* Sleep Card */}
        <View
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
                  borderRadius: 16,
                  backgroundColor: "#F3EDFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="moon-waning-crescent"
                  size={14}
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
            <TouchableOpacity
              onPress={() => openModal("sleep")}
              style={{ padding: 6 }}
            >
              <AntDesign name="pluscircle" size={22} color="#67c694" />
            </TouchableOpacity>
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
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/dashboard/track")}
            >
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
          {/* Sync row */}
          {/* <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {Platform.OS === "ios" ? (
                <Ionicons name="logo-apple" size={18} color="#7771de" />
              ) : (
                <MaterialCommunityIcons
                  name="google-fit"
                  size={16}
                  color="#7771de"
                />
              )}
              <Text
                style={{
                  marginLeft: 6,
                  color: "#7771de",
                  fontWeight: "500",
                  fontFamily: theme.fonts.medium,
                }}
              >
                Sync your sleep
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={18}
              color="#7771de"
            />
          </TouchableOpacity> */}
        </View>
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
                borderRadius: 16,
                backgroundColor: "#F3EDFF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <MaterialCommunityIcons
                name="cup-water"
                size={14}
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
          bgColor={theme.colors.primary}
          message={snackbarMsg}
        />
      ) : null}
    </View>
  );
}

export default memo(HealthDashboard);
