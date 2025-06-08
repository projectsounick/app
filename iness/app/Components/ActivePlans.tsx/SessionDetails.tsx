import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  Linking,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome5,
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Session } from "@/app/interfaces/sessionInterface";
import theme from "@/app/Theme/globalTheme";

const TabbedSessionDetails = ({
  selectedSession,
  totalSessions,
}: {
  selectedSession: Session | null;
  totalSessions: number;
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "trainer" | "workout">(
    "info"
  );

  const renderInfoTab = () => {
    if (!selectedSession)
      return (
        <Text style={{ textAlign: "center", color: "#999" }}>
          No data available
        </Text>
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

          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: "#eee" }}>
              Date: {new Date(selectedSession.sessionDate).toDateString()}
            </Text>
            <Text style={{ color: "#eee" }}>
              Time: {selectedSession.sessionTime}
            </Text>
            <Text style={{ color: "#eee" }}>
              Duration: {selectedSession.sessionDuration} mins
            </Text>
            <Text style={{ color: "#eee" }}>
              Type: {selectedSession.sessionType}
            </Text>
            {selectedSession.sessionType === "offline" && (
              <Text style={{ color: "#eee" }}>
                Address: {selectedSession.sessionAddress || "N/A"}
              </Text>
            )}
            <Text style={{ color: "#eee" }}>
              Status: {selectedSession.sessionStatus}
            </Text>
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
      </ScrollView>
    );
  };

  const renderTrainerTab = () => {
    if (!selectedSession?.trainer)
      return (
        <Text style={{ textAlign: "center", color: "#999" }}>
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
          source={require("../../../assets/images/track.png")}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            marginLeft: 12,
            borderWidth: 2,
            borderColor: "#fff",
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
