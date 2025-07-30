import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  Linking,
  Pressable,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome5,
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Session } from "@/app/interfaces/sessionInterface";
import theme from "@/app/Theme/globalTheme";
import { router } from "expo-router";
import FeedbackModal from "./SessionFeedbackModal";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { sessionService } from "@/app/services/sessionService";
import { ActivityIndicator } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";

const TabbedSessionDetails = ({
  selectedSession,
  totalSessions,
  setSelectedSession,
}: {
  selectedSession: Session | null;
  totalSessions: number;
  setSelectedSession: any;
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "trainer" | "workout">(
    "info"
  );
  const [showModal, setShowModal] = useState(false);

  const {
    callService,
    loading,
    snackbarVisible,
    setLoading,
    snackbarMessage,
    setSnackbarMessage,
    setSnackbarVisible,
  } = useServiceWithSnackbar(sessionService.updateSession);

  const submitFeedback = async (feedback: string) => {
    try {
      setLoading(true);
      const params = {
        sessionId: selectedSession?._id || null,
        data: {
          sessionFeedback: feedback,
        },
      };

      const response = await callService(params);
      setShowModal(false);
      if (response.success) {
        setSelectedSession((prev: any) => ({
          ...prev,
          sessionFeedback: feedback,
        }));
      } else {
        setSnackbarVisible(false);
        setSnackbarMessage("Failed to submit the feedback");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const renderInfoTab = () => {
    if (!selectedSession)
      return (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ textAlign: "center", color: "#999" }}>
            No Session Available
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 20,
              marginTop: 20,
              width: "90%",
              alignSelf: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              router.push("/dashboard/supportchat");
            }}
          >
            <Text
              style={{
                color: "#000",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Request a Session
            </Text>

            <Feather name="arrow-right" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      );

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Summary Cards */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
            paddingHorizontal: 16,
          }}
        >
          {/* Sessions Count */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 12,
              flex: 1,
              marginRight: 8,
              height: 69,
              justifyContent: "center",
              borderWidth: 1.2,
              borderColor: "#E0E0E0", // Light gray border
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#444" }}>
              Sessions Count
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#6A1B9A" }}
            >
              {totalSessions}
            </Text>
          </View>

          {/* Session Time */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 12,
              flex: 1,
              marginLeft: 8,
              height: 69,
              justifyContent: "center",
              borderWidth: 1.2,
              borderColor: "#E0E0E0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#444" }}>
              Session time
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#6A1B9A" }}
            >
              {selectedSession?.sessionDuration || "--"}
              <Text style={{ fontSize: 12, color: "#999" }}> mins</Text>
            </Text>
          </View>
        </View>

        {/* Session Information Card */}
        <LinearGradient
          colors={["#9C56F6", "#3A1B63"]}
          style={{
            borderRadius: 16,
            padding: 16,
            margin: 16,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Session Information
          </Text>
          <View style={{ marginBottom: 12, paddingHorizontal: 2 }}>
            {/* First Row */}
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              {/* Date */}
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={16}
                  color="#eee"
                  style={{ marginRight: 2 }}
                />
                <Text style={{ color: "#eee", fontSize: 10 }}>
                  {new Date(selectedSession.sessionDate).toDateString()}
                </Text>
              </View>

              {/* Time */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color="#eee"
                  style={{ marginRight: 2 }}
                />
                <Text style={{ color: "#eee", fontSize: 10 }}>
                  {selectedSession.sessionTime}
                </Text>
              </View>

              {/* Duration */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={16}
                  color="#eee"
                  style={{ marginRight: 2 }}
                />
                <Text style={{ color: "#eee", fontSize: 10 }}>
                  {selectedSession.sessionDuration} mins
                </Text>
              </View>
            </View>

            {/* Second Row */}
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              {/* Type */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={16}
                  color="#eee"
                  style={{ marginRight: 2 }}
                />
                <Text style={{ color: "#eee", fontSize: 10 }}>
                  {selectedSession.sessionType}
                </Text>
              </View>

              {/* Status */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="progress-check"
                  size={16}
                  color="#eee"
                  style={{ marginRight: 2 }}
                />
                <Text style={{ color: "#eee", fontSize: 10 }}>
                  {selectedSession.sessionStatus}
                </Text>
              </View>

              {/* Address (only for offline) */}
              {selectedSession.sessionType === "offline" ? (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color="#eee"
                    style={{ marginRight: 2 }}
                  />
                  <Text
                    style={{ color: "#eee", fontSize: 10 }}
                    numberOfLines={1}
                  >
                    {selectedSession.sessionAddress || "N/A"}
                  </Text>
                </View>
              ) : (
                <View style={{ flex: 1 }} />
              )}
            </View>
          </View>

          {/* Diet Plan Download Button */}
          {selectedSession?.activePlanDetails &&
            selectedSession?.activePlanDetails?.dietPlanUrl && (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(selectedSession.activePlanDetails.dietPlanUrl)
                }
                activeOpacity={0.9}
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={24}
                    color="#7C3AED"
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#4B5563",
                    }}
                  >
                    Download your diet plan
                  </Text>
                </View>
                <Ionicons
                  name="cloud-download-outline"
                  size={24}
                  color="#4B5563"
                />
              </TouchableOpacity>
            )}
        </LinearGradient>
        {selectedSession.sessionStatus === "completed" && (
          <Pressable
            onPress={() => setShowModal(true)}
            style={{
              backgroundColor: "#eee",
              borderColor: "#7C3AED",
              borderWidth: 1,
              marginHorizontal: 16,
              padding: 12,
              borderRadius: 12,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: 6,
                  color: "#000",
                }}
              >
                Session Feedback
              </Text>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ fontSize: 12, color: "#333" }}>
                  {selectedSession.sessionFeedback
                    ? selectedSession.sessionFeedback
                    : "Tap to give feedback"}
                </Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#2e7d32" />
          </Pressable>
        )}
        <FeedbackModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={submitFeedback}
          sessionId={selectedSession._id}
        />
        <CustomSnackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          bgColor={theme.colors.primary}
          onDismiss={() => setSnackbarVisible(false)}
        />
      </ScrollView>
    );
  };

  const renderTrainerTab = () => {
    if (!selectedSession?.trainer)
      return (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
          No trainer data
        </Text>
      );

    return (
      <LinearGradient
        colors={["#9C56F6", "#3A1B63"]}
        style={{
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          margin: 16,
          padding: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            {selectedSession.trainer.name}
          </Text>

          <Text style={{ color: "#eee", marginBottom: 4 }}>
            Gender: {selectedSession.trainer.sex}
          </Text>
          <Text style={{ color: "#eee" }}>
            DOB:{" "}
            {selectedSession.trainer.dob
              ? new Date(selectedSession.trainer.dob).toDateString()
              : "N/A"}
          </Text>
        </View>
        <Image
          source={
            selectedSession?.trainer?.profilePic
              ? { uri: selectedSession.trainer.profilePic }
              : require("../../../assets/images/track.png")
          }
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            marginLeft: 12,
            borderWidth: 2,
            borderColor: "#fff",
            backgroundColor: "#ccc", // fallback bg for empty/transparent images
          }}
          resizeMode="cover"
        />
      </LinearGradient>
    );
  };

  const renderWorkoutTab = () => {
    if (!selectedSession?.workouts?.length)
      return (
        <Text style={{ textAlign: "center", color: "#999" }}>
          No workout data
        </Text>
      );

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {selectedSession.workouts.map((workout, idx) => (
          <LinearGradient
            key={idx}
            colors={["#9C56F6", "#3A1B63"]}
            style={{
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {/* Workout Name */}
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Workout Name: {workout.exercise}
            </Text>

            {/* Reps and Sets Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={{ color: "#eee" }}>Reps: {workout.reps}</Text>
              <Text style={{ color: "#eee" }}>Sets: {workout.sets}</Text>
            </View>

            {/* Timer and Status Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#eee" }}>Timer: {workout.timer}</Text>
              <Text style={{ color: "#eee" }}>
                Status: {workout.isComplete ? "Completed" : "Pending"}
              </Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    );
  };

  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={require("../../../assets/images/basicBackground.jpg")}
    >
      {/* Tab Switcher */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: "#f0f0f0",
          borderRadius: 8,
          marginHorizontal: 16,
          marginTop: 16,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 12,
            backgroundColor:
              activeTab === "info" ? theme.colors.primary : "transparent",
            borderRadius: 8,
          }}
          onPress={() => setActiveTab("info")}
        >
          <MaterialIcons
            name="info"
            size={20}
            color={activeTab === "info" ? "#000" : "#555"}
          />
          <Text
            style={{
              color: activeTab === "info" ? "#000" : "#555",
              fontWeight: "bold",
            }}
          >
            Info
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 12,
            backgroundColor:
              activeTab === "trainer" ? theme.colors.primary : "transparent",
            borderRadius: 8,
          }}
          onPress={() => setActiveTab("trainer")}
        >
          <FontAwesome5
            name="user-tie"
            size={18}
            color={activeTab === "trainer" ? "#000" : "#555"}
          />
          <Text
            style={{
              color: activeTab === "trainer" ? "#000" : "#555",
              fontWeight: "bold",
            }}
          >
            Trainer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 12,
            backgroundColor:
              activeTab === "workout" ? theme.colors.primary : "transparent",
            borderRadius: 8,
          }}
          onPress={() => setActiveTab("workout")}
        >
          <FontAwesome
            name="heartbeat"
            size={20}
            color={activeTab === "workout" ? "#000" : "#555"}
          />
          <Text
            style={{
              color: activeTab === "workout" ? "#000" : "#555",
              fontWeight: "bold",
            }}
          >
            Workout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "info" && renderInfoTab()}
        {activeTab === "trainer" && renderTrainerTab()}
        {activeTab === "workout" && renderWorkoutTab()}
      </View>
    </ImageBackground>
  );
};

export default TabbedSessionDetails;
