import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import NormalHeader from "@/app/modules/NormalHeader";
import TrackerModal from "@/app/Components/Tracking/TrackingModal";
import theme from "@/app/Theme/globalTheme";
import { trackService } from "@/app/services/track.service";
import { ActivityIndicator, Snackbar } from "react-native-paper"; // install react-native-paper or use your existing Snackbar
import { TrackingData } from "@/app/interfaces/trackInterface";
import CustomSnackbar from "@/app/modules/Snackbar";
import {
  setCurrentDateTrackData,
  setTotalTrackData,
  updateTrackingField,
} from "@/Slices/trackSlice";
import { RootState } from "@/store";
import { SafeAreaView } from "react-native-safe-area-context";

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
      console.log("this is existing");

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
      edges={["top", "left", "right", "bottom"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          <NormalHeader screenName="Track" rightIcon={true} />
          {/* History Icon Button */}

          {dataLoading ? (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <ActivityIndicator color={theme.colors.secondPrimary} size={20} />
            </View>
          ) : (
            <>
              {/* Progress Circle */}
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 20,
                }}
              >
                <AnimatedCircularProgress
                  size={200}
                  width={14}
                  fill={progressSleep}
                  tintColor="#ADD8E6"
                  backgroundColor="#eaeaea"
                  duration={1200}
                >
                  {() => (
                    <AnimatedCircularProgress
                      size={140}
                      width={12}
                      fill={progressSteps}
                      tintColor="#FFD700"
                      backgroundColor="#f0f0f0"
                      duration={1200}
                    >
                      {() => (
                        <View>
                          <Text
                            style={{
                              fontSize: 28,
                              fontWeight: "bold",
                              color: "#6C1B9B",
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
                    justifyContent: "space-around",
                    width: "60%",
                    marginTop: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {/* Sleep */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 20,
                      }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: "#ADD8E6",
                          marginRight: 6,
                        }}
                      />
                      <Text style={{ fontSize: 16, color: "#666" }}>Sleep</Text>
                    </View>

                    {/* Steps */}
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: "#FFD700",
                          marginRight: 6,
                        }}
                      />
                      <Text style={{ fontSize: 16, color: "#666" }}>Steps</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Summary */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 20,
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
              </View>

              {/* Tracker Cards */}
              {[
                {
                  label: "Steps",
                  value: `${currentDayTrackData.steps?.steps || 0}/10000`,
                  key: "steps",
                },
                {
                  label: "Sleep",
                  value: `${
                    currentDayTrackData.sleep?.sleepDuration || 0
                  }/12 hrs`,
                  key: "sleep",
                },
                {
                  label: "Water",
                  value: `${
                    currentDayTrackData.water?.waterIntake || 0
                  }/10 glasses`,
                  key: "water",
                },
              ].map((tracker, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: theme.colors.cardLight,
                    padding: 16,
                    marginBottom: 12,
                    borderRadius: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {tracker.label}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#666" }}>
                    {tracker.value}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      openModal(tracker.key as any);
                    }}
                  >
                    <Ionicons name="add-circle" size={28} color="#6C1B9B" />
                  </TouchableOpacity>
                </View>
              ))}
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
              bgColor={theme.colors.primary}
              message={snackbarMsg}
            />
          ) : null}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
