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
import { SafeAreaView } from "react-native-safe-area-context";

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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right", "bottom"]}
    >
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
            setSelectedSession={setSelectedSession}
          />
          <CustomSnackbar
            visible={snackbarOpen}
            message={snackbarMessage}
            onDismiss={() => setSnackbarOpen(false)}
            bgColor={theme.colors.primary}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default FullPlanDetails;
