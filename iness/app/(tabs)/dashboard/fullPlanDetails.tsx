import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/Feather";
import SmallHeader from "@/app/modules/SmallHeader";
import HeaderContent from "@/app/modules/HeaderContent";
import WorkoutSummaryCard from "@/app/Components/ActivePlans.tsx/ActivePlanHeaderAddOn";
import CustomSnackbar from "@/app/modules/Snackbar";
import { sessionService } from "@/app/services/sessionService";
import theme from "@/app/Theme/globalTheme";
import { RootState } from "@/store";
import { ActivePlans } from "@/app/interfaces/planInterface";
import { Session } from "@/app/interfaces/sessionInterface";
import SessionDetailsTabs from "@/app/Components/ActivePlans.tsx/SessionDetails";

const TABS = ["Information", "Trainer", "Workout"];

const FullPlanDetails = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Information");

  const selectedPlan: ActivePlans = useSelector((state: RootState) =>
    state.plan.activePlans.find((plan) => plan._id === id)
  );

  async function fetchSessions() {
    try {
      setLoading(true);
      const response = await sessionService.getSessions();
      const sessions = response.data;
      setSessions(sessions);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let closestSession = sessions[0];
      let smallestDiff = Math.abs(
        new Date(sessions[0].sessionDate).getTime() - today.getTime()
      );

      for (let i = 1; i < sessions.length; i++) {
        const sessionDate = new Date(sessions[i].sessionDate);
        sessionDate.setHours(0, 0, 0, 0);
        const diff = Math.abs(sessionDate.getTime() - today.getTime());

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestSession = sessions[i];
        }
      }
      setSelectedSession(closestSession);
    } catch (error: any) {}
    setLoading(false);
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  const renderInformationTab = () => {
    if (!selectedSession)
      return (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ marginBottom: 12, color: "#333" }}>
            No data available
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#4A90E2",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 25,
            }}
            onPress={() => {
              // Your chat action here
            }}
          >
            <Icon
              name="message-circle"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Chat with us
            </Text>
          </TouchableOpacity>
        </View>
      );
    return (
      <View>
        <Text>Type: {selectedSession.sessionType || "N/A"}</Text>
        <Text>Status: {selectedSession.sessionStatus || "N/A"}</Text>
        <Text>Duration: {selectedSession.sessionDuration || "N/A"} mins</Text>
        <Text>Time: {selectedSession.sessionTime || "N/A"}</Text>
        {selectedSession.sessionType === "offline" && (
          <Text>Address: {selectedSession.sessionAddress || "N/A"}</Text>
        )}
      </View>
    );
  };

  const renderTrainerTab = () => {
    if (!selectedSession?.trainer) return <Text>No data available</Text>;
    const { name, email, sex, dob } = selectedSession.trainer;
    return (
      <View>
        <Text>Name: {name || "N/A"}</Text>
        <Text>Email: {email || "N/A"}</Text>
        <Text>Sex: {sex || "N/A"}</Text>
        <Text>DOB: {new Date(dob).toDateString()}</Text>
      </View>
    );
  };

  const renderWorkoutTab = () => {
    if (!selectedSession?.workouts || selectedSession.workouts.length === 0)
      return <Text>No data available</Text>;
    return (
      <View>
        {selectedSession.workouts.map((workout, index) => (
          <View
            key={index}
            style={{
              marginVertical: 6,
              backgroundColor: "#F5F5F5",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text>Exercise: {workout.exercise}</Text>
            <Text>Sets: {workout.sets}</Text>
            <Text>Reps: {workout.reps}</Text>
            <Text>Timer: {workout.timer}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Information":
        return renderInformationTab();
      case "Trainer":
        return renderTrainerTab();
      case "Workout":
        return renderWorkoutTab();
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <SmallHeader
            title="Overview"
            bottomComponent={
              <HeaderContent
                title={selectedPlan?.plan?.planType?.title || "Diet Plan"}
                subtitle={selectedPlan?.plan?.title || ""}
              >
                <WorkoutSummaryCard
                  sessions={sessions}
                  selectedSession={selectedSession}
                  setSelectedSession={setSelectedSession}
                />
              </HeaderContent>
            }
          />

          <SessionDetailsTabs
            selectedSession={selectedSession}
            totalSessions={sessions.length}
          />
          <CustomSnackbar
            visible={snackbarOpen}
            message={snackbarMessage}
            onDismiss={() => setSnackbarOpen(false)}
            bgColor={theme.colors.primary}
          />
        </>
      )}
    </View>
  );
};

export default FullPlanDetails;
