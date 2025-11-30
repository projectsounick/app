import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
  Dimensions,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import NormalHeader from "@/app/modules/NormalHeader";
import TrackerModal from "@/app/Components/Tracking/TrackingModal";
import { trackService } from "@/app/services/track.service";
import { ActivityIndicator } from "react-native-paper";
const { height } = Dimensions.get("window");
import CustomSnackbar from "@/app/modules/Snackbar";
const topPadding = height * 0.05;
import { updateTrackingField } from "@/Slices/trackSlice";
import { RootState } from "@/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStreak } from "@/app/services/streaks.service";
import { setStreakData } from "@/Slices/streakSlice";

export default function WellnessDashboard() {
  const currentDayTrackData = useSelector(
    (state: RootState) => state.track.currentDateTrackData
  );
  const dispatch = useDispatch();
  const [distanceDetails, setDistanceDetails] = useState({
    calorie: 0,
    coveredDistance: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [openModalFor, setOpenModalFor] = useState<"sleep" | "steps" | "water">(
    "sleep"
  );

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const openModal = (key: "sleep" | "steps" | "water") => {
    setOpenModalFor(key);
    setModalVisible(true);
  };

  const [updateDataLoading, setUpdateDataLoading] = useState(false);
  const onClose = () => {
    setModalVisible(false);
  };

  const goalSteps = 10000;
  const goalSleep = 12;
  const progressSteps = Math.min(
    ((currentDayTrackData.steps?.steps || 0) / goalSteps) * 100,
    100
  );
  const progressSleep = Math.min(
    ((currentDayTrackData.sleep?.sleepDuration || 0) / goalSleep) * 100,
    100
  );

  //// Function for calculating the distance and the calorie burnt
  // const calculateDistanceDetailsAndUpdate = (additionalSteps: number) => {
  //   const totalSteps = data.steps + additionalSteps;

  //   const newCalories = totalSteps * 0.04; // approx 0.04 calories per step
  //   const newDistance = totalSteps * 0.0008; // approx 0.0008 km per step

  //   setData((prev) => ({ ...prev, steps: totalSteps }));
  //   setDistanceDetails({
  //     calorie: parseFloat(newCalories.toFixed(0)), // rounded to nearest integer
  //     coveredDistance: parseFloat(newDistance.toFixed(2)), // 2 decimal places
  //   });
  // };

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
          }}
        >
          <NormalHeader screenName="Track" rightIcon={true} />
        </View>
        {/* History Icon Button */}
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          {dataLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <ActivityIndicator color="#9747FF" size="large" />
            </View>
          ) : (
            <>
              {/* Progress Circle Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                  alignItems: "center",
                }}
              >
                <AnimatedCircularProgress
                  size={200}
                  width={14}
                  fill={progressSleep}
                  tintColor="#ADD8E6"
                  backgroundColor="#F0F0F0"
                  duration={1200}
                >
                  {() => (
                    <AnimatedCircularProgress
                      size={140}
                      width={12}
                      fill={progressSteps}
                      tintColor="#9747FF"
                      backgroundColor="#F0F0F0"
                      duration={1200}
                    >
                      {() => (
                        <View>
                          <Text
                            style={{
                              fontSize: 28,
                              fontWeight: "700",
                              color: "#9747FF",
                              textAlign: "center",
                            }}
                          >
                            {currentDayTrackData.steps?.steps
                              ? `${(
                                  currentDayTrackData.steps.steps / 1000
                                ).toFixed(0)}K`
                              : "0K"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#666",
                              textAlign: "center",
                              fontWeight: "500",
                            }}
                          >
                            {(progressSteps / 10).toFixed(1)}/10
                          </Text>
                        </View>
                      )}
                    </AnimatedCircularProgress>
                  )}
                </AnimatedCircularProgress>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 24,
                    marginTop: 20,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                    width: "100%",
                  }}
                >
                  {/* Sleep */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#ADD8E6",
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#666",
                        fontWeight: "500",
                      }}
                    >
                      Sleep
                    </Text>
                  </View>

                  {/* Steps */}
                  <View
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#9747FF",
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#666",
                        fontWeight: "500",
                      }}
                    >
                      Steps
                    </Text>
                  </View>
                </View>
              </View>

              {/* Summary */}
              {/* <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  backgroundColor: theme.colors.cardLight,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: 14,
                }}
              >
                {[
                  { label: "Cal", value: 486 },
                  { label: "Distance", value: "9.2km" },
                  { label: "Minutes", value: "30:40" },
                ].map((item, i) => (
                  <View key={i} style={{ alignItems: "center", flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        color: "#333",
                      }}
                    >
                      {item.value}
                    </Text>
                    <Text style={{ color: "#999", fontSize: 12 }}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View> */}

              {/* Tracker Cards */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Steps",
                    value: `${currentDayTrackData.steps?.steps || 0}/10000`,
                    key: "steps",
                    icon: "walk-outline",
                    color: "#9747FF",
                  },
                  {
                    label: "Sleep",
                    value: `${currentDayTrackData.sleep?.sleepDuration || 0}/12 hrs`,
                    key: "sleep",
                    icon: "bed-outline",
                    color: "#9747FF",
                  },
                  {
                    label: "Water",
                    value: `${currentDayTrackData.water?.waterIntake || 0}/10 glasses`,
                    key: "water",
                    icon: "water-outline",
                    color: "#9747FF",
                  },
                ].map((tracker: any, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: 16,
                      borderRadius: 16,
                      alignItems: "center",
                      flex: 1,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                    }}
                  >
                    {/* Icon */}
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#F8F8F8",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Ionicons
                        name={tracker.icon}
                        size={24}
                        color={tracker.color}
                      />
                    </View>

                    {/* Label */}
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#000",
                        marginBottom: 6,
                      }}
                    >
                      {tracker.label}
                    </Text>

                    {/* Value */}
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginBottom: 12,
                        textAlign: "center",
                      }}
                      numberOfLines={2}
                    >
                      {tracker.value}
                    </Text>

                    {/* Add Button */}
                    <TouchableOpacity
                      onPress={() => openModal(tracker.key as any)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#67C694",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}

          {modalVisible ? (
            <TrackerModal
              visible={modalVisible}
              onClose={onClose}
              type={openModalFor}
              onSubmit={updateTrackingData}
              dataLoading={dataLoading}
            />
          ) : null}

          {snackbarVisible ? (
            <CustomSnackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              bgColor="#67C694"
              message={snackbarMsg}
            />
          ) : null}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
