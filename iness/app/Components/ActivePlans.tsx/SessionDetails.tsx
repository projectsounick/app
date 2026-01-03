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
import FeedbackModal from "@/app/Modals/SessionFeedbackModal";
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
              color: theme.colors.textMuted,
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
              backgroundColor: theme.colors.background,
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
                color: theme.colors.black,
                fontSize: theme.fontSizes.regular,
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
        {/* Session Details Card - Date/Status shown in parent, so start with time/duration */}
        <View
          style={{
            backgroundColor: theme.colors.background,
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
            position: "relative",
          }}
        >
          {/* Time and Duration Row */}
          <View style={{ flexDirection: "row", marginBottom: 16, gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.backgroundSecondary,
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
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.small,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Time
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.regularSmall,
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
                backgroundColor: theme.colors.backgroundSecondary,
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
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.small,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Duration
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.regularSmall,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  {selectedSession.sessionDuration} minutes
                </Text>
              </View>
            </View>
          </View>

          {/* Type and Address Row */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: selectedSession.sessionStatus === "completed" ? 50 : 0 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.backgroundSecondary,
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
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.small,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Session Type
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.regularSmall,
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
                  backgroundColor: theme.colors.backgroundSecondary,
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
                      color: theme.colors.textSecondary,
                      fontSize: theme.fontSizes.small,
                      fontFamily: theme.fonts.medium,
                      marginBottom: 2,
                    }}
                  >
                    Location
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: theme.fontSizes.regularSmall,
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

          {/* Feedback Button - Small, bottom left inside card */}
          {selectedSession.sessionStatus === "completed" && (
            <View
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: theme.colors.success,
                  borderRadius: 20,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#67C694",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={14}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontSize: theme.fontSizes.small,
                    fontWeight: "600",
                    fontFamily: theme.fonts.medium,
                  }}
                >
                  {selectedSession.sessionFeedback ? "Edit" : "Feedback"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
            backgroundColor: theme.colors.background,
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
          <Text style={{ textAlign: "center", color: theme.colors.textMuted, fontSize: theme.fontSizes.regularSmall }}>
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
              backgroundColor: theme.colors.backgroundCardLight,
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
                fontSize: theme.fontSizes.medium,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              {selectedSession.trainer.name}
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.greenLight,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  color: theme.colors.success,
                  fontSize: theme.fontSizes.small,
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
                backgroundColor: theme.colors.backgroundCardLight,
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
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSizes.small,
                  fontFamily: theme.fonts.medium,
                  marginBottom: 2,
                }}
              >
                Gender
              </Text>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.regularSmall,
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
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.backgroundCardLight,
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
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.small,
                    fontFamily: theme.fonts.medium,
                    marginBottom: 2,
                  }}
                >
                  Date of Birth
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.regularSmall,
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
        <Text style={{ textAlign: "center", color: theme.colors.textMuted }}>
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
                color: theme.colors.textWhite,
                fontSize: theme.fontSizes.regular,
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
              <Text style={{ color: theme.colors.textLight }}>Reps: {workout.reps}</Text>
              <Text style={{ color: theme.colors.textLight }}>Sets: {workout.sets}</Text>
            </View>

            {/* Timer and Status Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: theme.colors.textLight }}>Timer: {workout.timer}</Text>
              <Text style={{ color: theme.colors.textLight }}>
                Status: {workout.isComplete ? "Completed" : "Pending"}
              </Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}>
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
