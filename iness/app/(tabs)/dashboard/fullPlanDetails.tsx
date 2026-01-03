import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, Linking, ImageBackground, Alert, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
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
import TrainerShimmer from "@/app/modules/Shimmer/TrainerShimmer";
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
      setSnackbarMessage("Failed to fetch sessions");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, [id, type]);

  // Simple property access - no need for useMemo
  const title =
    selectedPlanOrService?.plan?.title ||
    selectedPlanOrService?.serviceDetails?.title ||
    "Plan";

  const imageUrl =
    selectedPlanOrService?.plan?.imgUrl ||
    selectedPlanOrService?.serviceDetails?.imgUrl ||
    "";

  // Simple property access with fallbacks - no need for useMemo
  const sessionCount =
    selectedPlanOrService?.totalSessions ||
    (type === "plan"
      ? selectedPlanOrService?.plan?.planItem?.sessionCount
      : selectedPlanOrService?.serviceDetails?.sessionCount) ||
    sessions.length;

  // Calculate remaining sessions as sessionCount - sessions.length
  const remainingSessions = Math.max((sessionCount || 0) - sessions.length, 0);
  
  const totalSessions = sessions.length;
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
          <TrainerShimmer screenName="session" />
        </View>
      ) : (
        <>
          <SmallHeader title="Overview" showBell showCart weightShow={false} />
          <BackHeader />

          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <View
              style={{
                backgroundColor: theme.colors.background,
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
                    backgroundColor: theme.colors.backgroundCardLight,
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
                    <Text style={{ color: theme.colors.secondPrimary, fontWeight: theme.fontWeights.bold as "700" }}>
                      {title?.[0] ?? "P"}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.medium,
                      fontWeight: theme.fontWeights.bold as "700",
                      color: theme.colors.dark,
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, marginBottom: 4, fontSize: theme.fontSizes.regularSmall }}>
                    {type === "plan" ? "Active Plan" : "Active Service"}
                  </Text>
                  {/* Start and End Dates */}
                  {selectedPlanOrService?.planStartDate && selectedPlanOrService?.planEndDate && (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.small, fontFamily: theme.fonts.regular }}>
                        {new Date(selectedPlanOrService.planStartDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(selectedPlanOrService.planEndDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: "row", gap: 8, }}>
                    <View
                      style={{
                        backgroundColor: theme.colors.greenLight,
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ color: theme.colors.success, fontWeight: theme.fontWeights.bold as "700", fontSize: theme.fontSizes.small }}>
                        {sessionCount}
                      </Text>
                      <Text style={{ color: theme.colors.success, fontSize: theme.fontSizes.small }}>Sessions</Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: theme.colors.warningLight,
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ color: theme.colors.warning, fontWeight: theme.fontWeights.bold as "700", fontSize: theme.fontSizes.small }}>
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
                        color: theme.colors.success,
                        fontWeight: theme.fontWeights.bold as "700",
                        fontSize: theme.fontSizes.small,
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
                      backgroundColor: theme.colors.backgroundCardLight,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="calendar" size={22} color="#9747FF" />
                  </View>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.medium,
                      fontWeight: theme.fontWeights.bold as "700",
                      color: theme.colors.text,
                    }}
                  >
                    Assigned Sessions
                  </Text>
                  <View
                    style={{
                      backgroundColor: theme.colors.backgroundCardLight,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSizes.small,
                        fontWeight: theme.fontWeights.bold as "700",
                        color: theme.colors.secondPrimary,
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
                    backgroundColor: theme.colors.secondPrimary,
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
                      backgroundColor: theme.colors.backgroundCardLight,
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
                        fontSize: theme.fontSizes.medium,
                        fontWeight: theme.fontWeights.bold as "700",
                        color: theme.colors.text,
                      }}
                    >
                      Session Details
                    </Text>
                    <Text style={{ fontSize: theme.fontSizes.small, color: theme.colors.textMuted, marginTop: 2 }}>
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
                    backgroundColor: theme.colors.secondPrimary,
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Tabs */}
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 20,
                  backgroundColor: theme.colors.background,
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
                          color: isActive ? theme.colors.textWhite : theme.colors.textSecondary,
                          fontSize: theme.fontSizes.regularSmall,
                          fontWeight: theme.fontWeights.bold as "700",
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

          {sessions.length > 0 && selectedSession ? (
            <SessionDetailsTabs
              selectedSession={selectedSession}
              setSelectedSession={setSelectedSession}
              activeTab={activeTab}
            />
          ) : sessions.length === 0 && selectedPlanOrService ? (
            <View style={{ marginTop: 24, paddingHorizontal: 20, paddingBottom: 100 }}>
              {/* Plan/Service Details Section */}
              <View
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#F1F3F1",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: theme.colors.backgroundCardLight,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="information-circle" size={22} color="#9747FF" />
                  </View>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.medium,
                      fontWeight: theme.fontWeights.bold as "700",
                      color: theme.colors.text,
                    }}
                  >
                    {type === "plan" ? "Plan Description" : "Service Description"}
                  </Text>
                </View>

                {/* Description Items List */}
                {((selectedPlanOrService?.plan?.descItems && selectedPlanOrService.plan.descItems.length > 0) ||
                  (selectedPlanOrService?.serviceDetails?.descItems && selectedPlanOrService.serviceDetails.descItems.length > 0)) && (
                  <View style={{ marginBottom: 16 }}>
                    {(selectedPlanOrService?.plan?.descItems || selectedPlanOrService?.serviceDetails?.descItems || [])
                      .slice(0, 2)
                      .map(
                        (item: string, index: number) => (
                          <View
                            key={index}
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-start",
                              marginBottom: 12,
                            }}
                          >
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: theme.colors.secondPrimary,
                                marginTop: 6,
                                marginRight: 12,
                              }}
                            />
                            <Text
                              style={{
                                flex: 1,
                          fontSize: theme.fontSizes.regularSmall,
                          color: theme.colors.textSecondary,
                                lineHeight: 20,
                                fontFamily: theme.fonts.regular,
                              }}
                            >
                              {item}
                            </Text>
                          </View>
                        )
                      )}
                  </View>
                )}

                {/* Additional Details */}
                <View style={{ gap: 12 }}>
                  {selectedPlanOrService?.plan?.planItem?.sessionCount && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="calendar-check"
                        size={18}
                        color="#9747FF"
                        style={{ marginRight: 10 }}
                      />
                      <Text style={{ fontSize: theme.fontSizes.regularSmall, color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, marginRight: 8 }}>
                        Total Sessions:
                      </Text>
                      <Text style={{ fontSize: theme.fontSizes.regularSmall, color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                        {selectedPlanOrService.plan.planItem.sessionCount}
                      </Text>
                    </View>
                  )}

                  {selectedPlanOrService?.serviceDetails?.sessionCount && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="calendar-check"
                        size={18}
                        color="#9747FF"
                        style={{ marginRight: 10 }}
                      />
                      <Text style={{ fontSize: theme.fontSizes.regularSmall, color: theme.colors.textSecondary, fontFamily: theme.fonts.medium, marginRight: 8 }}>
                        Total Sessions:
                      </Text>
                      <Text style={{ fontSize: theme.fontSizes.regularSmall, color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                        {selectedPlanOrService.serviceDetails.sessionCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : null}

          {/* Request Session Button - Fixed at Bottom */}
          {sessions.length === 0 && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: theme.colors.background,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 32,
                borderTopWidth: 1,
                borderTopColor: "#F1F3F1",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/dashboard/supportchat",
                    params: { planTitle: title, requestType: type === "plan" ? "session" : "service" },
                  })
                }
                style={{
                  backgroundColor: "#67C694",
                  borderRadius: 30,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  shadowColor: "#67C694",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.bold as "700",
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Request a Session
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <CustomSnackbar
            visible={snackbarOpen}
            message={snackbarMessage}
            onDismiss={() => setSnackbarOpen(false)}
            bgColor="#FFFFFF"
          />
        </>
      )}
    </SafeAreaView>
    </ImageBackground>
  );
};

export default FullPlanDetails;
