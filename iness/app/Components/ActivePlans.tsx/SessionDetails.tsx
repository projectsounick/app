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
import SessionCardRow from "@/app/modules/SessionDetailsCard";

const TabbedSessionDetails = ({
  selectedSession,
  totalSessions,
  setSelectedSession,
}: {
  selectedSession: Session | null;
  totalSessions: number;
  setSelectedSession: any;
}) => {
  console.log(selectedSession);

  const [activeTab, setActiveTab] = useState<any>("info");
  const [showModal, setShowModal] = useState(false);

  const {
    loading,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
  } = useServiceWithSnackbar(sessionService.updateSession);
  const renderInfoTab = () => {
    if (!selectedSession)
      return (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text
            style={{
              textAlign: "center",
              color: "#999",
              fontFamily: theme.fonts.bold,
            }}
          >
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
                fontFamily: theme.fonts.bold,
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
        <SessionCardRow
          selectedSession={selectedSession}
          totalSessions={totalSessions}
        />

        {/* Session Information Card */}
        <LinearGradient
          colors={["#9C56F6", "#3A1B63"]}
          style={{
            borderRadius: 16,
            padding: 12,
            margin: 16,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 10,
              fontFamily: theme.fonts.bold,
            }}
          >
            Session Information
          </Text>
          <View style={{ marginBottom: 8, paddingHorizontal: 2 }}>
            {/* First Row - Date, Time, Duration */}
            <View style={{ flexDirection: "row", marginBottom: 10, justifyContent: "space-between", alignItems: "center" }}>
              {/* Date */}
              <View
                style={{ 
                  flex: 1, 
                  flexDirection: "row", 
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={12}
                  color="#eee"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 10,
                    fontFamily: theme.fonts.medium,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {new Date(selectedSession.sessionDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
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
                  size={12}
                  color="#eee"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 10,
                    fontFamily: theme.fonts.medium,
                  }}
                  numberOfLines={1}
                >
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
                  size={12}
                  color="#eee"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 10,
                    fontFamily: theme.fonts.medium,
                  }}
                  numberOfLines={1}
                >
                  {selectedSession.sessionDuration}m
                </Text>
              </View>
            </View>

            {/* Second Row - Type, Status */}
            <View style={{ flexDirection: "row", marginBottom: 8, justifyContent: "space-between", alignItems: "center" }}>
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
                  size={12}
                  color="#eee"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 10,
                    fontFamily: theme.fonts.medium,
                  }}
                  numberOfLines={1}
                >
                  {selectedSession.sessionType}
                </Text>
              </View>

              {/* Status */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <MaterialCommunityIcons
                  name="progress-check"
                  size={12}
                  color="#eee"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 10,
                    fontFamily: theme.fonts.medium,
                  }}
                  numberOfLines={1}
                >
                  {selectedSession.sessionStatus}
                </Text>
              </View>
            </View>

            {/* Address (only for offline) */}
            {selectedSession.sessionType === "offline" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={12}
                  color="#eee"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 10,
                    fontFamily: theme.fonts.medium,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {selectedSession.sessionAddress || "N/A"}
                </Text>
              </View>
            ) : null}
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
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  marginTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={18}
                    color="#7C3AED"
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#4B5563",
                      fontFamily: theme.fonts.bold,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    Download diet plan
                  </Text>
                </View>
                <Ionicons
                  name="cloud-download-outline"
                  size={18}
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
                  fontFamily: theme.fonts.medium,
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
          currentSession={selectedSession}
          setCurrentSession={setSelectedSession}
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
              fontFamily: theme.fonts.bold,
              marginBottom: 8,
            }}
          >
            {selectedSession.trainer.name}
          </Text>

          <Text
            style={{
              color: "#eee",
              marginBottom: 4,
              fontFamily: theme.fonts.medium,
            }}
          >
            Gender: {selectedSession.trainer.sex}
          </Text>
          <Text style={{ color: "#eee", fontFamily: theme.fonts.medium }}>
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
          justifyContent: "space-between",
          marginHorizontal: 16,
          marginTop: 16,
          backgroundColor: "transparent",
        }}
      >
        {["info", "trainer", "workout"].map((tab) => {
          const isActive: any = activeTab === tab;

          const icons: any = {
            info: (
              <MaterialIcons
                name="info"
                size={18}
                color={isActive ? "#FFFFFF" : "#555"}
              />
            ),
            trainer: (
              <FontAwesome5
                name="user-tie"
                size={16}
                color={isActive ? "#FFFFFF" : "#555"}
              />
            ),
            workout: (
              <FontAwesome
                name="heartbeat"
                size={18}
                color={isActive ? "#FFFFFF" : "#555"}
              />
            ),
          };

          const labels: any = {
            info: "Info",
            trainer: "Trainer",
            workout: "Workout",
          };

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
                paddingHorizontal: 8,
                marginHorizontal: 4,
                borderRadius: 20,
                backgroundColor: isActive ? "#67C694" : "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {icons[tab]}
              <Text
                style={{
                  color: isActive ? "#FFFFFF" : "#333",
                  fontSize: 12,
                  fontFamily: theme.fonts.bold,
                  marginLeft: 6,
                }}
              >
                {labels[tab]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={{
          height: 1,
          marginTop: 10,
          backgroundColor: "#ccc",
          width: "95%",
          alignSelf: "center",
        }}
      />
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
