import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, Linking, ImageBackground, Alert, Platform } from "react-native";
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
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const FullPlanDetails = () => {
  const { id, type } = useLocalSearchParams();

 // type: 'plan' | 'service'
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

  const selectedPlanOrService: any = useMemo(
    () =>
      type === "plan"
        ? activePlans.find((plan) => plan._id === id)
        : activeServices.find((service) => service._id === id),
    [type, id, activePlans, activeServices]
  );

  useEffect(() => {
    if (selectedPlanOrService) {
      console.log("this is selectedPlanOrService", selectedPlanOrService);
    }
  }, [selectedPlanOrService]);
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
  const [downloading, setDownloading] = useState(false);

  const downloadDietPlan = async (url: string) => {
    try {
      setDownloading(true);
      
      // Extract filename from URL or use default
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1] || "diet-plan.pdf";
      const fileUri = FileSystem.documentDirectory + fileName;

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(url, fileUri);

      if (downloadResult.status === 200) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: "application/pdf",
            dialogTitle: "Your Diet Plan",
          });
        } else {
          Alert.alert("Success", "Diet plan downloaded successfully!");
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error: any) {
      console.log("Download error:", error);
      Alert.alert("Error", "Failed to download diet plan. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "transparent" }}
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
          <SmallHeader title="Overview" showBell showCart weightShow={false} />
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
                      downloadDietPlan(selectedSession.activePlanDetails.dietPlanUrl)
                    }
                    disabled={downloading}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: "#E8F5E9",
                      paddingHorizontal: 6,
                      paddingVertical: 5,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      borderWidth: 1,
                      borderColor: "#67C694",
                      opacity: downloading ? 0.7 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: "#2F8C62",
                        fontWeight: "700",
                        fontSize: 9,
                      }}
                    >
                      {downloading ? "Downloading..." : "Diet Plan"}
                    </Text>
                    <Ionicons
                      name={downloading ? "hourglass-outline" : "cloud-download-outline"}
                      size={14}
                      color="#2F8C62"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "#F3EDFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="calendar" size={22} color="#9747FF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#1A1A1A",
                    }}
                  >
                    Assigned Sessions
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#F3EDFF",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#9747FF",
                      }}
                    >
                      {totalSessions}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: 30,
                    height: 3,
                    backgroundColor: "#9747FF",
                    borderRadius: 2,
                  }}
                />
              </View>
              <View style={{ paddingHorizontal: 20 }}>
                <WorkoutSummaryCard
                  sessions={sessions}
                  selectedSession={selectedSession}
                  setSelectedSession={setSelectedSession}
                />
              </View>
            </View>
          )}

          {/* Session Details Section - Wraps viewing session + tabs + content */}
          {selectedSession && (
            <View style={{ marginTop: 24 }}>
              {/* Section Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "#F3EDFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="document-text" size={22} color="#9747FF" />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#1A1A1A",
                      }}
                    >
                      Session Details
                    </Text>
                    <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                      {new Date(selectedSession.sessionDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })} • <Text style={{ 
                        color: selectedSession.sessionStatus === "completed" ? "#2F8C62" 
                          : selectedSession.sessionStatus === "missed" ? "#D32F2F" 
                          : "#F9A825",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}>{selectedSession.sessionStatus}</Text>
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: 30,
                    height: 3,
                    backgroundColor: "#9747FF",
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Tabs */}
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 20,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
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
                        size={20}
                        color={isActive ? "#FFFFFF" : "#666"}
                      />
                    ),
                    trainer: (
                      <FontAwesome5
                        name="user-tie"
                        size={18}
                        color={isActive ? "#FFFFFF" : "#666"}
                      />
                    ),
                    workout: (
                      <FontAwesome
                        name="heartbeat"
                        size={20}
                        color={isActive ? "#FFFFFF" : "#666"}
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
                        paddingVertical: 12,
                        marginHorizontal: 2,
                        borderRadius: 10,
                        backgroundColor: isActive ? "#67C694" : "transparent",
                        shadowColor: isActive ? "#67C694" : "transparent",
                        shadowOffset: { width: 0, height: isActive ? 2 : 0 },
                        shadowOpacity: isActive ? 0.3 : 0,
                        shadowRadius: isActive ? 4 : 0,
                        elevation: isActive ? 3 : 0,
                      }}
                      activeOpacity={0.9}
                    >
                      {icons[tab]}
                      <Text
                        style={{
                          color: isActive ? "#FFFFFF" : "#666",
                          fontSize: 13,
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
    </ImageBackground>
  );
};

export default FullPlanDetails;
