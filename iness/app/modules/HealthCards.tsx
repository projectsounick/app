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
    <View style={{ flex: 1, marginBottom: 16 }}>
      {/* Section Title */}

      {/* Row with Steps & Sleep */}
      <View
        style={{
          flexDirection: "row",

          justifyContent: "space-between",
        }}
      >
        {/* Steps Card */}

        <View
          style={{
            flex: 1,

            borderRadius: 12,
            padding: 16,
            marginRight: 8,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
            backgroundColor: "#fff",
          }}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons name="walk" size={20} color="#140A21" />
              <Text
                style={{
                  marginLeft: 6,
                  fontFamily: theme.fonts.bold,
                  fontSize: theme.fonts.regular,
                }}
              >
                Steps
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => openModal("steps")}
              style={{ padding: 6 }}
            >
              <AntDesign name="pluscircle" size={24} color="#67c694" />
            </TouchableOpacity>
          </View>

          <Progress.Bar
            progress={stepsCount / stepsGoal}
            width={null}
            color="#7771de"
            unfilledColor="#E0E0E0"
            borderWidth={0}
            height={8}
            borderRadius={4}
          />
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontWeight: "500",
                fontFamily: theme.fonts.regular,
              }}
            >
              {stepsCount}/{stepsGoal}
            </Text>
            <Ionicons
              onPress={() => router.push("/(tabs)/dashboard/track")}
              name="chevron-forward"
              size={24}
              color="#555"
            />
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
                  size={18}
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
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginLeft: 8,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="moon-waning-crescent"
                size={20}
                color="#140A21"
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontWeight: "600",
                  fontFamily: theme.fonts.bold,
                }}
              >
                Sleep
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => openModal("sleep")}
              style={{ padding: 6 }}
            >
              <AntDesign name="pluscircle" size={24} color="#67c694" />
            </TouchableOpacity>
          </View>

          <Progress.Bar
            progress={sleepDuration / sleepGoal}
            width={null}
            color="#7771de"
            unfilledColor="#E0E0E0"
            borderWidth={0}
            height={8}
            borderRadius={4}
          />

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontWeight: "500",
                fontFamily: theme.fonts.regular,
              }}
            >
              {sleepDuration}/{sleepGoal} hrs
            </Text>
            <Ionicons
              onPress={() => router.push("/(tabs)/dashboard/track")}
              name="chevron-forward"
              size={24}
              color="#555"
            />
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
                  size={18}
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
          marginTop: 16,
          backgroundColor: "#fff",
          borderRadius: 12,

          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="cup-water"
              size={20}
              color="#140A21"
            />
            <Text
              style={{
                marginLeft: 6,
                fontWeight: "600",
                fontFamily: theme.fonts.bold,
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
          color="#7771de"
          unfilledColor="#E0E0E0"
          borderWidth={0}
          height={8}
          borderRadius={4}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontWeight: "500",
              fontFamily: theme.fonts.regular,
            }}
          >
            {waterIntake}/{waterGoal} Glasses
          </Text>
          <Ionicons
            onPress={() => router.push("/(tabs)/dashboard/track")}
            name="chevron-forward"
            size={24}
            color="#555"
          />
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
