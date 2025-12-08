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
import { router } from "expo-router";

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
        <ScrollView 
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingTop: 16,
            paddingBottom: 100 
          }}
          showsVerticalScrollIndicator={false}
        >
          {dataLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 40,
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
                  borderRadius: 24,
                  padding: 16,
                  marginBottom: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                  alignItems: "center",
                }}
              >
                <AnimatedCircularProgress
                  size={160}
                  width={14}
                  fill={progressSleep}
                  tintColor="#67C694"
                  backgroundColor="#F0F0F0"
                  duration={1200}
                  rotation={0}
                >
                  {() => (
                    <AnimatedCircularProgress
                      size={120}
                      width={12}
                      fill={progressSteps}
                      tintColor="#9747FF"
                      backgroundColor="#F0F0F0"
                      duration={1200}
                      rotation={0}
                    >
                      {() => (
                        <View style={{ alignItems: "center" }}>
                          <Text
                            style={{
                              fontSize: 24,
                              fontWeight: "700",
                              color: "#9747FF",
                              textAlign: "center",
                              marginBottom: 2,
                            }}
                          >
                            {currentDayTrackData.steps?.steps
                              ? `${(
                                  currentDayTrackData.steps.steps / 1000
                                ).toFixed(1)}K`
                              : "0K"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#999",
                              textAlign: "center",
                              fontWeight: "500",
                            }}
                          >
                            Steps
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
                    gap: 32,
                    marginTop: 16,
                    paddingTop: 12,
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
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: "#67C694",
                        marginRight: 8,
                      }}
                    />
                    <View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          fontWeight: "600",
                        }}
                      >
                        Sleep
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#999",
                          marginTop: 2,
                        }}
                      >
                        {currentDayTrackData.sleep?.sleepDuration || 0}h
                      </Text>
                    </View>
                  </View>

                  {/* Steps */}
                  <View
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: "#9747FF",
                        marginRight: 8,
                      }}
                    />
                    <View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          fontWeight: "600",
                        }}
                      >
                        Steps
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#999",
                          marginTop: 2,
                        }}
                      >
                        {currentDayTrackData.steps?.steps || 0}
                      </Text>
                    </View>
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
                  gap: 16,
                }}
              >
                {[
                  {
                    label: "Steps",
                    current: currentDayTrackData.steps?.steps || 0,
                    goal: 10000,
                    key: "steps",
                    icon: "walk-outline",
                    color: "#9747FF",
                    bgColor: "#F3EDFF",
                  },
                  {
                    label: "Sleep",
                    current: currentDayTrackData.sleep?.sleepDuration || 0,
                    goal: 12,
                    unit: "hrs",
                    key: "sleep",
                    icon: "moon-outline",
                    color: "#67C694",
                    bgColor: "#E8F5E9",
                  },
                  {
                    label: "Water",
                    current: currentDayTrackData.water?.waterIntake || 0,
                    goal: 10,
                    unit: "glasses",
                    key: "water",
                    icon: "water-outline",
                    color: "#4FC3F7",
                    bgColor: "#E3F2FD",
                  },
                ].map((tracker: any, i) => {
                  const progress = Math.min((tracker.current / tracker.goal) * 100, 100);
                  return (
                    <View
                      key={i}
                      style={{
                        backgroundColor: "#FFFFFF",
                        padding: 20,
                        borderRadius: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 2,
                        borderWidth: 1,
                        borderColor: "#F5F5F5",
                      }}
                    >
                      {/* Header Row */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 16,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 1,
                          }}
                        >
                          <View
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 24,
                              backgroundColor: tracker.bgColor,
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
                          >
                            <Ionicons
                              name={tracker.icon}
                              size={24}
                              color={tracker.color}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "700",
                                color: "#000",
                                marginBottom: 4,
                              }}
                            >
                              {tracker.label}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: "#666",
                              }}
                            >
                              {tracker.current}{tracker.unit ? ` ${tracker.unit}` : ""} / {tracker.goal}{tracker.unit ? ` ${tracker.unit}` : ""}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => openModal(tracker.key as any)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: "#67C694",
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#67C694",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 3,
                          }}
                        >
                          <Ionicons name="add" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>

                      {/* Progress Bar */}
                      <View
                        style={{
                          height: 8,
                          backgroundColor: "#F0F0F0",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            height: "100%",
                            width: `${progress}%`,
                            backgroundColor: tracker.color,
                            borderRadius: 4,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#999",
                          marginTop: 8,
                          textAlign: "right",
                        }}
                      >
                        {progress.toFixed(0)}% Complete
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Medical Disclaimer */}
              {/* <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  marginTop: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#9747FF"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#000",
                    }}
                  >
                    Health Goals & Information
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#666",
                    lineHeight: 18,
                    marginBottom: 8,
                  }}
                >
                  The wellness goals displayed (steps, sleep, water) are general
                  guidelines. Individual needs may vary. These recommendations
                  are not a substitute for professional medical advice.
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({ pathname: "/dashboard/medicalcitations" } as any)
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#9747FF",
                      fontWeight: "600",
                    }}
                  >
                    View Medical Citations & Sources →
                  </Text>
                </TouchableOpacity>
              </View> */}
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
