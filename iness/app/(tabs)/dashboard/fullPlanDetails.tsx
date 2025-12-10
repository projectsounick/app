import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import SmallHeader from "@/app/modules/SmallHeader";
import BackHeader from "@/app/modules/BackHeader";
import WorkoutSummaryCard from "@/app/Components/ActivePlans.tsx/ActivePlanHeaderAddOn";
import { MaterialIcons, FontAwesome5, FontAwesome, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import CustomSnackbar from "@/app/modules/Snackbar";
import { sessionService } from "@/app/services/sessionService";
import theme from "@/app/Theme/globalTheme";
import { RootState } from "@/store";
import { ActivePlans } from "@/app/interfaces/planInterface";
import { Session } from "@/app/interfaces/sessionInterface";
import SessionDetailsTabs from "@/app/Components/ActivePlans.tsx/SessionDetails";
import { SafeAreaView } from "react-native-safe-area-context";
import ShimmerLoader from "@/app/modules/TrainSimmer";

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

  const title = useMemo(
    () =>
      selectedPlanOrService?.plan?.title ||
      selectedPlanOrService?.serviceDetails?.title ||
      "Plan",
    [selectedPlanOrService]
  );

  const imageUrl = useMemo(
    () =>
      selectedPlanOrService?.plan?.imgUrl ||
      selectedPlanOrService?.serviceDetails?.imgUrl ||
      "",
    [selectedPlanOrService]
  );

  const totalSessions = sessions.length;
  const completedSessions = useMemo(
    () =>
      sessions.filter(
        (s) => (s.sessionStatus || "").toLowerCase() === "completed"
      ).length,
    [sessions]
  );
  const remainingSessions = Math.max(totalSessions - completedSessions, 0);
  
  // Get sessionCount from plan or service
  const sessionCount = useMemo(() => {
    if (type === "plan") {
      return selectedPlanOrService?.plan?.planItem?.sessionCount || totalSessions;
    } else {
      return selectedPlanOrService?.serviceDetails?.sessionCount || totalSessions;
    }
  }, [selectedPlanOrService, type, totalSessions]);
  const [activeTab, setActiveTab] = useState<any>("info");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F6F8F7" }}
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
          <SmallHeader title="Plan Overview" showBell showCart />
          <BackHeader />

          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#F1F3F1",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 14,
                    backgroundColor: "#F3EDFF",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginRight: 14,
                  }}
                >
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ color: "#9747FF", fontWeight: "700" }}>
                      {title?.[0] ?? "P"}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#000",
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </Text>
                  <Text style={{ color: "#666", marginBottom: 12, fontSize: 13 }}>
                    {type === "plan" ? "Active Plan" : "Active Service"}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, }}>
                    <View
                      style={{
                        backgroundColor: "#E8F5E9",
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ color: "#2F8C62", fontWeight: "700",fontSize: 10 }}>
                        {sessionCount}
                      </Text>
                      <Text style={{ color: "#2F8C62", fontSize: 10 }}>Sessions</Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#FFF8E1",
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ color: "#D99100", fontWeight: "700", fontSize: 10 }}>
                        {remainingSessions} remaining
                      </Text>
                    </View>
                  </View>
                </View>
                {selectedSession?.activePlanDetails?.dietPlanUrl && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(selectedSession.activePlanDetails.dietPlanUrl)
                    }
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: "#E8F5E9",
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      borderRadius: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      borderWidth: 1,
                      borderColor: "#67C694",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="food-apple"
                      size={14}
                      color="#2F8C62"
                    />
                    <Text
                      style={{
                        color: "#2F8C62",
                        fontWeight: "700",
                        fontSize: 10,
                      }}
                    >
                      Diet Plan
                    </Text>
                    <Ionicons
                      name="cloud-download-outline"
                      size={14}
                      color="#2F8C62"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Info/Trainer/Workout Tabs */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 16,
              marginTop: 20,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
              borderWidth: 1,
              borderColor: "#F1F3F1",
            }}
          >
            {["info", "trainer", "workout"].map((tab) => {
              const isActive: any = activeTab === tab;

              const icons: any = {
                info: (
                  <MaterialIcons
                    name="info"
                    size={18}
                    color={isActive ? "#FFFFFF" : "#111"}
                  />
                ),
                trainer: (
                  <FontAwesome5
                    name="user-tie"
                    size={16}
                    color={isActive ? "#FFFFFF" : "#111"}
                  />
                ),
                workout: (
                  <FontAwesome
                    name="heartbeat"
                    size={18}
                    color={isActive ? "#FFFFFF" : "#111"}
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
                    paddingVertical: 10,
                    marginHorizontal: 4,
                    borderRadius: 12,
                    backgroundColor: isActive ? "#67C694" : "transparent",
                    shadowColor: isActive ? "#2F8C62" : "transparent",
                    shadowOffset: { width: 0, height: isActive ? 2 : 0 },
                    shadowOpacity: isActive ? 0.2 : 0,
                    shadowRadius: isActive ? 4 : 0,
                    elevation: isActive ? 3 : 0,
                  }}
                  activeOpacity={0.9}
                >
                  {icons[tab]}
                  <Text
                    style={{
                      color: isActive ? "#FFFFFF" : "#111",
                      fontSize: 12,
                      fontWeight: "700",
                      marginLeft: 6,
                    }}
                  >
                    {labels[tab]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Assigned Sessions Heading and Slider */}
          {sessions?.length > 0 && (
            <View style={{ marginTop: 32,  }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111",
                    }}
                  >
                    Assigned Sessions
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "400",
                      color: "#111",
                    }}
                  >
                    / {totalSessions}
                  </Text>
                </View>
              </View>
              <WorkoutSummaryCard
                sessions={sessions}
                selectedSession={selectedSession}
                setSelectedSession={setSelectedSession}
              />
            </View>
          )}

          <SessionDetailsTabs
            selectedSession={selectedSession}
         
            setSelectedSession={setSelectedSession}
         
            activeTab={activeTab}
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
