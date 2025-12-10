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

interface TabbedSessionDetailsProps {
  selectedSession: Session | null;

  setSelectedSession: any;

  activeTab?: string;
}

const TabbedSessionDetails = ({
  selectedSession,

  setSelectedSession,

  activeTab = "info",
}: TabbedSessionDetailsProps) => {

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
        {/* Session Information Heading */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
     
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#111",
              fontFamily: theme.fonts.bold,
            }}
          >
            Session Information
          </Text>
        </View>

        {/* Session Information Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 20,
            marginHorizontal: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
            borderWidth: 1,
            borderColor: "#F1F3F1",
          }}
        >
          {/* Date and Status Row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
              <View
                style={{
                  backgroundColor: "#F3EDFF",
                  borderRadius: 10,
                  padding: 8,
                  marginRight: 12,
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={20}
                  color="#9747FF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 12,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Session Date
                </Text>
                <Text
                  style={{
                    color: "#111",
                    fontSize: 16,
                    fontFamily: theme.fonts.bold,
                  }}
                  numberOfLines={2}
                >
                  {new Date(selectedSession.sessionDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: selectedSession.sessionStatus === "completed" 
                  ? "#E8F5E9" 
                  : selectedSession.sessionStatus === "scheduled"
                  ? "#FFF8E1"
                  : "#FFEBEE",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  color: selectedSession.sessionStatus === "completed" 
                    ? "#2F8C62" 
                    : selectedSession.sessionStatus === "scheduled"
                    ? "#D99100"
                    : "#C62828",
                  fontSize: 11,
                  fontFamily: theme.fonts.bold,
                  textTransform: "capitalize",
                }}
              >
                {selectedSession.sessionStatus}
              </Text>
            </View>
          </View>

          {/* Time and Duration Row */}
          <View style={{ flexDirection: "row", marginBottom: 16, gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#F8F9FA",
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color="#9747FF"
                style={{ marginRight: 8 }}
              />
              <View>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 11,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Time
                </Text>
                <Text
                  style={{
                    color: "#111",
                    fontSize: 14,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  {selectedSession.sessionTime}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "#F8F9FA",
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="timer-outline"
                size={18}
                color="#9747FF"
                style={{ marginRight: 8 }}
              />
              <View>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 11,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Duration
                </Text>
                <Text
                  style={{
                    color: "#111",
                    fontSize: 14,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  {selectedSession.sessionDuration} minutes
                </Text>
              </View>
            </View>
          </View>

          {/* Type and Address Row */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 0 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#F8F9FA",
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name={selectedSession.sessionType === "online" ? "video-outline" : "map-marker-outline"}
                size={18}
                color="#9747FF"
                style={{ marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 11,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Session Type
                </Text>
                <Text
                  style={{
                    color: "#111",
                    fontSize: 14,
                    fontFamily: theme.fonts.bold,
                    textTransform: "capitalize",
                  }}
                >
                  {selectedSession.sessionType === "online" ? "Online" : "Offline"}
                </Text>
              </View>
            </View>

            {/* Address (only for offline) */}
            {selectedSession.sessionType === "offline" && selectedSession.sessionAddress ? (
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#F8F9FA",
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={18}
                  color="#9747FF"
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#666",
                      fontSize: 11,
                      fontFamily: theme.fonts.medium,
                      marginBottom: 2,
                    }}
                  >
                    Location
                  </Text>
                  <Text
                    style={{
                      color: "#111",
                      fontSize: 14,
                      fontFamily: theme.fonts.medium,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {selectedSession.sessionAddress}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
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
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 20,
            marginHorizontal: 20,
            marginTop: 32,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
            borderWidth: 1,
            borderColor: "#F1F3F1",
            alignItems: "center",
          }}
        >
          <Text style={{ textAlign: "center", color: "#999", fontSize: 14 }}>
            No trainer data available
          </Text>
        </View>
      );

    const genderLabel = selectedSession.trainer.sex === "M" 
      ? "Male" 
      : selectedSession.trainer.sex === "F" 
      ? "Female" 
      : "Other";

    return (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 16,
          marginHorizontal: 20,
          marginTop: 32,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 3,
          borderWidth: 1,
          borderColor: "#F1F3F1",
        }}
      >
        {/* Trainer Profile Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: "#9747FF",
            }}
          >
            {selectedSession?.trainer?.profilePic ? (
              <Image
                source={{ uri: selectedSession.trainer.profilePic }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="cover"
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={35}
                color="#9747FF"
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: theme.fonts.bold,
                color: "#111",
                marginBottom: 6,
              }}
            >
              {selectedSession.trainer.name}
            </Text>
            <View
              style={{
                backgroundColor: "#E8F5E9",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  color: "#2F8C62",
                  fontSize: 11,
                  fontFamily: theme.fonts.bold,
                  textTransform: "uppercase",
                }}
              >
                Trainer
              </Text>
            </View>
          </View>
        </View>

        {/* Gender and DOB Row */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Gender */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#F8F9FA",
              borderRadius: 12,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#F3EDFF",
                borderRadius: 10,
                padding: 8,
                marginRight: 8,
              }}
            >
              <MaterialCommunityIcons
                name="gender-male-female"
                size={18}
                color="#9747FF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#666",
                  fontSize: 11,
                  fontFamily: theme.fonts.medium,
                  marginBottom: 2,
                }}
              >
                Gender
              </Text>
              <Text
                style={{
                  color: "#111",
                  fontSize: 14,
                  fontFamily: theme.fonts.bold,
                }}
              >
                {genderLabel}
              </Text>
            </View>
          </View>

          {/* Date of Birth */}
          {selectedSession.trainer.dob && (
            <View
              style={{
                flex: 1,
                backgroundColor: "#F8F9FA",
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#F3EDFF",
                  borderRadius: 10,
                  padding: 8,
                  marginRight: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color="#9747FF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 11,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Date of Birth
                </Text>
                <Text
                  style={{
                    color: "#111",
                    fontSize: 14,
                    fontFamily: theme.fonts.bold,
                  }}
                  numberOfLines={1}
                >
                  {new Date(selectedSession.trainer.dob).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
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
    <View style={{ flex: 1, backgroundColor: "#F6F8F7" }}>
      {/* Tab Content */}
      <View
        style={{
          flex: 1,
      
        
      marginTop:32,
          shadowColor: "rgba(0,0,0,0.06)",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {activeTab === "info" && renderInfoTab()}
        {activeTab === "trainer" && renderTrainerTab()}
        {activeTab === "workout" && renderWorkoutTab()}
      </View>
    </View>
  );
};

export default TabbedSessionDetails;
