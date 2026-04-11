import React, { useState, useEffect } from "react";
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
import { Session } from "@/app/interfaces/sessionInterface";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { router } from "expo-router";
import FeedbackModal from "@/app/Modals/SessionFeedbackModal";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { sessionService } from "@/app/services/sessionService";
import { ActivityIndicator } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";
import SessionCardRow from "@/app/modules/SessionDetailsCard";
import WorkoutDetailModal from "@/app/Modals/WorkoutDetailModal";

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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

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
              backgroundColor: isDark ? theme.colors.background : theme.colors.background,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 20,
              marginTop: 20,
              width: "90%",
              alignSelf: "center",
              ...(isDark ? {} : {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }),
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
            onPress={() => {
              router.push("/dashboard/supportchat");
            }}
          >
            <Text
              style={{
                color: isDark ? theme.colors.text : theme.colors.black,
                fontSize: theme.fontSizes.regular,
                fontWeight: "600",
                fontFamily: theme.fonts.bold,
              }}
            >
              Request a Session
            </Text>

            <Feather name="arrow-right" size={24} color={isDark ? theme.colors.text : "#000"} />
          </TouchableOpacity>
        </View>
      );

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Session Details Card - Date/Status shown in parent, so start with time/duration */}
        <View
          style={{
            backgroundColor: isDark ? theme.colors.background : theme.colors.background,
            borderRadius: 20,
            padding: 20,
            marginHorizontal: 16,
            ...(isDark ? {} : {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }),
            borderWidth: 1,
            borderColor: theme.colors.border,
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
            backgroundColor: isDark ? theme.colors.background : theme.colors.background,
            borderRadius: 20,
            padding: 20,
            marginHorizontal: 16,
            marginTop: 0,
            ...(isDark ? {} : {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }),
            borderWidth: 1,
            borderColor: theme.colors.border,
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: isDark ? theme.colors.background : "#FFFFFF",
            borderRadius: 20,
            padding: 12,
            marginHorizontal: 16,
            marginTop: 0,
            ...(isDark ? {} : {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }),
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
        {/* Trainer Profile Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            paddingBottom: 12,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: theme.colors.backgroundCardLight,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
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
                size={24}
                color="#9747FF"
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: theme.fontSizes.regular,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
                marginBottom: 4,
              }}
            >
              {selectedSession.trainer.name}
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.greenLight,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
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

        {/* Stylish Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: isDark ? theme.colors.border : "#E8E8E8",
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isDark ? theme.colors.secondPrimary : "#9747FF",
              marginHorizontal: 8,
            }}
          />
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: isDark ? theme.colors.border : "#E8E8E8",
            }}
          />
        </View>

        {/* Gender and DOB Row */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Gender */}
          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? theme.colors.backgroundCard : "#F8F9FA",
              borderRadius: 12,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.backgroundCardLight,
                borderRadius: 10,
                padding: 6,
                marginRight: 8,
              }}
            >
              <MaterialCommunityIcons
                name="gender-male-female"
                size={16}
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
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.backgroundCardLight,
                  borderRadius: 10,
                  padding: 6,
                  marginRight: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={16}
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
      </ScrollView>
    );
  };

  // Auto-open modal when workout tab is selected
  useEffect(() => {
    const workouts = selectedSession?.workouts ?? [];

    if (activeTab === "workout" && workouts.length > 0) {
      setWorkoutModalVisible(true);
      setSelectedWorkout(workouts[0]);
    }
  }, [activeTab, selectedSession]);

  const renderWorkoutTab = () => {

    if (!selectedSession?.workouts?.length)
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ textAlign: "center", color: theme.colors.textMuted, fontSize: theme.fontSizes.regular }}>
            No workout data available
          </Text>
        </View>
      );

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <MaterialCommunityIcons
          name="dumbbell"
          size={48}
          color={isDark ? theme.colors.textSecondary : "#9747FF"}
          style={{ marginBottom: 16 }}
        />
        <Text style={{ textAlign: "center", color: theme.colors.text, fontSize: theme.fontSizes.medium, fontFamily: theme.fonts.bold, marginBottom: 8 }}>
          View All Workouts
        </Text>
        <Text style={{ textAlign: "center", color: theme.colors.textSecondary, fontSize: theme.fontSizes.regularSmall }}>
          {selectedSession.workouts.length} workout{selectedSession.workouts.length > 1 ? 's' : ''} available
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary }}>
      {/* Tab Content */}
      <View
        style={{
          flex: 1,
          marginTop: 32,
          ...(isDark ? {} : {
            shadowColor: "rgba(0,0,0,0.06)",
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.6,
            shadowRadius: 4,
            elevation: 2,
          }),
        }}
      >
        {activeTab === "info" && renderInfoTab()}
        {activeTab === "trainer" && renderTrainerTab()}
        {activeTab === "workout" && renderWorkoutTab()}
      </View>

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        visible={workoutModalVisible}
        onClose={() => setWorkoutModalVisible(false)}
        workouts={selectedSession?.workouts || []}
      />
    </View>
  );
};

export default TabbedSessionDetails;
