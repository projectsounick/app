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
import ShimmerLoader from "@/app/modules/TrainSimmer";

const TABS = ["Information", "Trainer", "Workout"];

const FullPlanDetails = () => {
  const { id, type } = useLocalSearchParams(); // type: 'plan' | 'service'
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const activePlans: ActivePlans[] = useSelector(
    (state: RootState) => state.plan.activePlans
  );
  const activeServices = useSelector(
    (state: RootState) => state.plan.activeServices
  );

  const selectedPlanOrService: any =
    type === "plan"
      ? activePlans.find((plan) => plan._id === id)
      : activeServices.find((service) => service._id === id);

  async function fetchSessions() {
    try {
      setLoading(true);
      let response;
      if (type === "plan") {
        let activePlanId: any = id;
        let activeServiceId: any = null;
        response = await sessionService.getSessions(
          activePlanId,
          activeServiceId
        ); // planId
      } else {
        let activePlanId: any = null;
        let activeServiceId: any = id;
        response = await sessionService.getSessions(
          activePlanId,
          activeServiceId
        ); // activeServiceId
      }
      const sessions = response.data;
      console.log("this is sessions length");

      console.log(sessions.length);

      const filteredSessions = sessions.filter((s: any) => {
        const status = s.sessionStatus?.toLowerCase().trim();
        return status !== "canceled" && status !== "cancelled";
      });

      setSessions(filteredSessions);

      // Select closest session
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
    } catch (error: any) {
      console.log("Error fetching sessions:", error);
      setSnackbarMessage("Failed to fetch sessions");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, [id, type]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ShimmerLoader screenName="session" />
        </View>
      ) : (
        <>
          <SmallHeader
            title="Overview"
            bottomComponent={
              <HeaderContent
                title={"Plans"}
                subtitle={
                  selectedPlanOrService?.plan?.title ||
                  selectedPlanOrService?.serviceDetails?.title ||
                  ""
                }
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
