import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { fetchWrapper } from "@/app/helpers/fetchWrapper";
import { config } from "@/app/shared/config";
import { Picker } from "@react-native-picker/picker";

const baseUrl = `${config.apiUrl}/api`;

interface SessionItem {
  sessionDate: Date;
  trainerId: string;
  sessionTime: string;
  sessionType: "online" | "offline";
  sessionDuration: string;
  sessionAddress: string;
  workoutItems: Array<{
    exercise: string;
    sets: string;
    reps: string;
    timer: string;
  }>;
}

const normalizeDateToNoon = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
};

const areDatesSame = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const formatDate = (dateValue: any): string => {
  if (!dateValue) return "N/A";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "N/A";
  }
};

function TrainerSessionCalendar() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const userName = params.userName as string;

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  const [sessionAgainstType, setSessionAgainstType] = useState<"againstPlan" | "againstService">("againstPlan");
  const [activePlanId, setActivePlanId] = useState<string>("");
  const [activeServiceId, setActiveServiceId] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentEditingDate, setCurrentEditingDate] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState(new Date());
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh sessions when screen comes into focus
      fetchSessions();
    }, [userId])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchActivePlans(),
        fetchActiveServices(),
        fetchTrainers(),
        fetchSessions(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePlans = async () => {
    try {
      const response = await fetchWrapper.get(`${baseUrl}/get-active-plans?userId=${userId}&isActive=true`);
      if (response.success) {
        const filteredPlans = response.data.filter((item: any) => item.plan != undefined);
        console.log("=== Fetched Plans ===");
        console.log("Total plans:", filteredPlans.length);
        filteredPlans.forEach((plan: any, index: number) => {
          console.log(`Plan ${index + 1}:`, {
            id: plan._id,
            planTitle: plan.plan?.title,
            planName: plan.plan?.planName,
            planItemName: plan.plan?.planItem?.planName,
            dietPlanTitle: plan.dietPlanDetails?.title,
            totalSessions: plan.totalSessions,
            remainingSessions: plan.remainingSessions,
          });
        });
        setPlans(filteredPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchActiveServices = async () => {
    try {
      const response = await fetchWrapper.get(`${baseUrl}/get-active-services?userId=${userId}&isActive=true`);
      if (response.success) {
        console.log("=== Fetched Services ===");
        console.log("Total services:", response.data.length);
        response.data.forEach((service: any, index: number) => {
          console.log(`Service ${index + 1}:`, {
            id: service._id,
            serviceDetailsTitle: service.serviceDetails?.title,
            totalSessions: service.totalSessions,
            remainingSessions: service.remainingSessions,
          });
        });
        setServices(response.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetchWrapper.get(`${baseUrl}/get-trainers?isActive=true`);
      if (response.success) {
        setTrainers(response.data);
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const currentDate = new Date();
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}T00:00:00.000Z`;
      };

      const response = await fetchWrapper.get(
        `${baseUrl}/get-sessions?id=${userId}&startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
      );
      if (response.success) {
        console.log("=== Fetched Sessions ===");
        console.log("Total sessions from API:", response.data?.length || 0);
        console.log("Session details:", response.data?.map((s: any) => ({
          id: s._id,
          date: new Date(s.sessionDate).toLocaleDateString(),
          status: s.sessionStatus,
          planId: s.activePlanId,
          serviceId: s.activeServiceId
        })));
        setSessions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: "completed" | "cancelled") => {
    const isCompleting = status === "completed";

    Alert.alert(
      isCompleting ? "✓ Mark Session as Completed" : "✕ Cancel Session",
      isCompleting
        ? "This session will be marked as completed. Continue?"
        : "This session will be cancelled and the session count will be restored. Continue?",
      [
        { text: "No, Go Back", style: "cancel" },
        {
          text: isCompleting ? "Yes, Complete" : "Yes, Cancel Session",
          style: isCompleting ? "default" : "destructive",
          onPress: async () => {
            try {
              setUpdatingSessionId(sessionId);
              const response = await fetchWrapper.put(`${baseUrl}/update-session/${sessionId}`, {
                sessionStatus: status,
              });

              if (response.success) {
                const successMessage = isCompleting
                  ? "Session has been marked as completed ✓"
                  : "Session has been cancelled. Session count restored.";
                Alert.alert("Success", successMessage);
                setExpandedSessionId(null);
                fetchSessions();
              } else {
                Alert.alert("Error", response.message || "Failed to update session");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to update session");
            } finally {
              setUpdatingSessionId(null);
            }
          },
        },
      ]
    );
  };

  const saveSessionNotes = async (sessionId: string) => {
    try {
      setUpdatingSessionId(sessionId);
      const response = await fetchWrapper.put(`${baseUrl}/update-session/${sessionId}`, {
        sessionNotes: sessionNotes[sessionId] || "",
      });

      if (response.success) {
        Alert.alert("Success", "Session notes saved successfully");
        fetchSessions();
      } else {
        Alert.alert("Error", response.message || "Failed to save notes");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save notes");
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const toggleSessionExpand = (sessionId: string, currentNotes?: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
      if (currentNotes && !sessionNotes[sessionId]) {
        setSessionNotes({ ...sessionNotes, [sessionId]: currentNotes });
      }
    }
  };

  const PlanDetails: any = {};
  if (activePlanId) {
    const selectedPlan = plans.find((item) => item._id === activePlanId);
    if (selectedPlan) {
      PlanDetails.totalSessions = selectedPlan.totalSessions;
      PlanDetails.remainingSessions = selectedPlan.remainingSessions;
      PlanDetails.isOnlinePlan = selectedPlan.plan?.planItem?.isOnline ? "Yes" : "No";
      PlanDetails.planStartDate = selectedPlan.planStartDate;
      PlanDetails.planEndDate = selectedPlan.planEndDate;
      PlanDetails.createdAt = selectedPlan.createdAt;
      if (selectedPlan.trainer) {
        PlanDetails.trainer = selectedPlan.trainer.name;
        PlanDetails.trainerId = selectedPlan.trainerId;
      }
    }
  }

  const ServiceDetails: any = {};
  if (activeServiceId) {
    const selectedService = services.find((item) => item._id === activeServiceId);
    if (selectedService) {
      ServiceDetails.totalSessions = selectedService.totalSessions;
      ServiceDetails.remainingSessions = selectedService.remainingSessions;
      ServiceDetails.isOnlinePlan = selectedService.serviceDetails?.isOnline ? "Yes" : "No";
      ServiceDetails.createdAt = selectedService.createdAt;
      if (selectedService.trainer) {
        ServiceDetails.trainer = selectedService.trainer.name;
        ServiceDetails.trainerId = selectedService.trainerId;
      }
    }
  }

  const markedDates: any = {};
  sessions.forEach((session: any) => {
    const dateString = new Date(session.sessionDate).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    markedDates[dateString] = {
      marked: true,
      dotColor: theme.colors.secondPrimary,
      selected: false,
    };
  });

  selectedDates.forEach((date) => {
    const dateString = date.toISOString().slice(0, 10);
    markedDates[dateString] = {
      ...markedDates[dateString],
      selected: true,
      selectedColor: theme.colors.text,
    };
  });

  const handleDayPress = (day: DateData) => {
    const selectedDate = normalizeDateToNoon(new Date(day.dateString));
    const index = selectedDates.findIndex((d) => areDatesSame(d, selectedDate));

    if (index === -1) {
      const maxSessions = sessionAgainstType === "againstPlan"
        ? PlanDetails.remainingSessions
        : ServiceDetails.remainingSessions;

      if (selectedDates.length >= maxSessions) {
        Alert.alert("Limit Reached", `You can only select ${maxSessions} sessions.`);
        return;
      }

      const newDates = [...selectedDates, selectedDate];
      setSelectedDates(newDates);

      const defaultItem: SessionItem = {
        sessionDate: selectedDate,
        trainerId: sessionAgainstType === "againstPlan" ? (PlanDetails.trainerId || "") : (ServiceDetails.trainerId || ""),
        sessionTime: "",
        sessionType: sessionAgainstType === "againstPlan"
          ? (PlanDetails.isOnlinePlan === "Yes" ? "online" : "offline")
          : (ServiceDetails.isOnlinePlan === "Yes" ? "online" : "offline"),
        sessionDuration: "",
        sessionAddress: "",
        workoutItems: [],
      };
      setSessionItems([...sessionItems, defaultItem]);
    } else {
      const newDates = selectedDates.filter((_, i) => i !== index);
      setSelectedDates(newDates);

      const newItems = sessionItems.filter((item) => !areDatesSame(item.sessionDate, selectedDate));
      setSessionItems(newItems);
    }
  };

  const updateSessionItem = (date: Date, field: string, value: any) => {
    console.log(`Updating session item - Field: ${field}, Value:`, value);
    setSessionItems((prev) =>
      prev.map((item) =>
        areDatesSame(item.sessionDate, date) ? { ...item, [field]: value } : item
      )
    );
  };

  const openTimePicker = (date: Date) => {
    console.log("Opening time picker for date:", formatDate(date));
    setCurrentEditingDate(date);
    const sessionItem = sessionItems.find((item) => areDatesSame(item.sessionDate, date));
    console.log("Current session time:", sessionItem?.sessionTime);

    if (sessionItem?.sessionTime) {
      const [time, period] = sessionItem.sessionTime.split(" ");
      const [hours, minutes] = time.split(":");
      let hour = parseInt(hours);
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      setTempTime(new Date(2025, 0, 1, hour, parseInt(minutes)));
    } else {
      const now = new Date();
      setTempTime(now);
    }
    setShowTimePicker(true);
  };

  const handleTimeConfirm = () => {
    setShowTimePicker(false);
    if (currentEditingDate) {
      const hours = tempTime.getHours();
      const minutes = tempTime.getMinutes();
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const formattedTime = `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
      console.log("Time selected:", formattedTime);
      updateSessionItem(currentEditingDate, "sessionTime", formattedTime);
    }
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  const addWorkoutItem = (date: Date) => {
    setSessionItems((prev) =>
      prev.map((item) =>
        areDatesSame(item.sessionDate, date)
          ? {
              ...item,
              workoutItems: [
                ...item.workoutItems,
                { exercise: "", sets: "", reps: "", timer: "" },
              ],
            }
          : item
      )
    );
  };

  const updateWorkoutItem = (date: Date, index: number, field: string, value: any) => {
    setSessionItems((prev) =>
      prev.map((item) =>
        areDatesSame(item.sessionDate, date)
          ? {
              ...item,
              workoutItems: item.workoutItems.map((workout, i) =>
                i === index ? { ...workout, [field]: value } : workout
              ),
            }
          : item
      )
    );
  };

  const deleteWorkoutItem = (date: Date, index: number) => {
    setSessionItems((prev) =>
      prev.map((item) =>
        areDatesSame(item.sessionDate, date)
          ? {
              ...item,
              workoutItems: item.workoutItems.filter((_, i) => i !== index),
            }
          : item
      )
    );
  };

  const createSession = async () => {
    if (selectedDates.length === 0) {
      Alert.alert("Error", "Please select at least one date");
      return;
    }

    console.log("=== Validating Session Items ===");
    console.log("Total items:", sessionItems.length);

    for (const item of sessionItems) {
      console.log("Checking session for date:", formatDate(item.sessionDate));
      console.log("- Time:", item.sessionTime);
      console.log("- Duration:", item.sessionDuration);
      console.log("- Type:", item.sessionType);
      console.log("- Address:", item.sessionAddress);

      if (!item.sessionTime) {
        Alert.alert("Error", "Please select session time for all selected dates");
        return;
      }
      if (!item.sessionDuration) {
        Alert.alert("Error", "Please fill session duration for all selected dates");
        return;
      }
      if (item.sessionType === "offline" && !item.sessionAddress) {
        Alert.alert("Error", "Please fill session address for offline sessions");
        return;
      }
      for (const workout of item.workoutItems) {
        if (!workout.exercise) {
          Alert.alert("Error", "Please fill exercise name for all workout items");
          return;
        }
      }
    }

    try {
      setCreating(true);
      const formattedSessionItems = sessionItems.map((item) => ({
        ...item,
        sessionDate: `${item.sessionDate.getUTCFullYear()}-${(item.sessionDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${item.sessionDate.getUTCDate().toString().padStart(2, "0")}T00:00:00.000Z`,
        workoutItems: item.workoutItems.map((workout) => ({
          exercise: workout.exercise,
          sets: parseInt(workout.sets) || 0,
          reps: parseInt(workout.reps) || 0,
          timer: workout.timer,
        })),
      }));

      const data: any = {
        sessionAgainstType,
        sessionItems: formattedSessionItems,
      };

      if (sessionAgainstType === "againstPlan") {
        data.activePlanId = activePlanId;
      } else {
        data.activeServiceId = activeServiceId;
      }

      const response = await fetchWrapper.post(`${baseUrl}/create-session/${userId}`, data);

      if (response.success) {
        Alert.alert("Success", "Sessions created successfully");
        setShowCreateModal(false);
        setSelectedDates([]);
        setSessionItems([]);
        fetchSessions();
      } else {
        Alert.alert("Error", response.message || "Failed to create sessions");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create sessions");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Calendar</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate total remaining sessions from all active plans and services
  const totalRemaining = [...plans, ...services].reduce((sum, item) => {
    return sum + (item.remainingSessions || 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{userName}'s Sessions</Text>
          <Text style={styles.headerSubtitle}>
            {sessions.length} total • {totalRemaining} remaining
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: "/(tabs)/dashboard/createSession",
            params: { userId, userName }
          })}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={theme.colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Calendar
          current={new Date().toISOString().slice(0, 10)}
          markedDates={markedDates}
          onDayPress={showCreateModal ? handleDayPress : undefined}
          theme={{
            todayTextColor: theme.colors.secondPrimary,
            arrowColor: theme.colors.text,
            monthTextColor: theme.colors.text,
            textDayFontWeight: "500",
            textMonthFontWeight: "700",
            textDayHeaderFontWeight: "600",
            selectedDayBackgroundColor: theme.colors.text,
            selectedDayTextColor: theme.colors.background,
            textDisabledColor: theme.colors.textMuted,
            textSectionTitleColor: theme.colors.text,
            backgroundColor: theme.colors.background,
            calendarBackground: theme.colors.background,
            dayTextColor: theme.colors.text,
          }}
        />

        {sessions.length > 0 && (
          <View style={styles.sessionsSection}>
            {sessions.map((session: any) => {
              // Get plan or service name
              const planName = session.activePlanDetails?.plan?.planItem?.planName ||
                              session.activePlanDetails?.plan?.planName ||
                              null;
              const serviceName = session.activeServiceDetails?.service?.serviceName ||
                                 session.activeServiceDetails?.service?.title ||
                                 null;

              const isExpanded = expandedSessionId === session._id;
              const canComplete = session.sessionStatus === "scheduled";
              const canCancel = session.sessionStatus === "scheduled";

              // Determine color based on status using theme colors
              let statusBarColor = theme.colors.text;
              if (session.sessionStatus === "completed") {
                statusBarColor = "#4CAF50";
              } else if (session.sessionStatus === "cancelled") {
                statusBarColor = "#F44336";
              } else if (session.sessionStatus === "scheduled") {
                statusBarColor = theme.colors.secondPrimary;
              }

              return (
                <View key={session._id} style={styles.sessionCard}>
                  <TouchableOpacity
                    onPress={() => toggleSessionExpand(session._id, session.sessionNotes)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sessionMainContent}>
                      <View style={styles.sessionLeft}>
                        <View style={[
                          styles.sessionColorBar,
                          { backgroundColor: statusBarColor }
                        ]} />
                        <View style={styles.sessionMainInfo}>
                          <View style={styles.sessionTitleRow}>
                            <Text style={styles.sessionTitle}>
                              {session.sessionType?.toUpperCase()} Session
                            </Text>
                            <View style={[
                              styles.sessionStatusPill,
                              session.sessionStatus === "completed" && styles.statusCompleted,
                              session.sessionStatus === "cancelled" && styles.statusCancelled,
                              session.sessionStatus === "scheduled" && styles.statusScheduled,
                            ]}>
                              <Text style={styles.sessionStatusText}>
                                {session.sessionStatus}
                              </Text>
                            </View>
                          </View>

                          {(planName || serviceName) && (
                            <Text style={styles.sessionPlanName}>
                              {planName || serviceName}
                            </Text>
                          )}

                          <View style={styles.sessionQuickInfo}>
                            <View style={styles.quickInfoItem}>
                              <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
                              <Text style={styles.quickInfoText}>{formatDate(session.sessionDate)}</Text>
                            </View>
                            <View style={styles.quickInfoItem}>
                              <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                              <Text style={styles.quickInfoText}>{session.sessionTime}</Text>
                            </View>
                            <View style={styles.quickInfoItem}>
                              <Ionicons name="hourglass-outline" size={14} color={theme.colors.textMuted} />
                              <Text style={styles.quickInfoText}>{session.sessionDuration}m</Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={theme.colors.textMuted}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <View style={styles.sessionExpandedContent}>
                      {/* Additional Info */}
                      <View style={styles.expandedSection}>
                        <Text style={styles.expandedSectionTitle}>Details</Text>

                        {session.sessionAddress && (
                          <View style={styles.expandedInfoRow}>
                            <Ionicons name="location" size={18} color={theme.colors.text} />
                            <View style={styles.expandedInfoContent}>
                              <Text style={styles.expandedInfoLabel}>Address</Text>
                              <Text style={styles.expandedInfoValue}>{session.sessionAddress}</Text>
                            </View>
                          </View>
                        )}

                        {session.trainer && (
                          <View style={styles.expandedInfoRow}>
                            <Ionicons name="person" size={18} color={theme.colors.text} />
                            <View style={styles.expandedInfoContent}>
                              <Text style={styles.expandedInfoLabel}>Trainer</Text>
                              <Text style={styles.expandedInfoValue}>{session.trainer.name}</Text>
                            </View>
                          </View>
                        )}
                      </View>

                      {/* Workouts */}
                      {session.workouts && session.workouts.length > 0 && (
                        <View style={styles.expandedSection}>
                          <Text style={styles.expandedSectionTitle}>
                            Exercises ({session.workouts.length})
                          </Text>
                          {session.workouts.map((workout: any, idx: number) => (
                            <View key={workout._id} style={styles.workoutItem}>
                              <View style={styles.workoutHeader}>
                                <Text style={styles.workoutNumber}>#{idx + 1}</Text>
                                <Text style={styles.workoutName}>{workout.exercise}</Text>
                              </View>
                              <View style={styles.workoutStats}>
                                {workout.sets > 0 && (
                                  <View style={styles.workoutStat}>
                                    <Text style={styles.workoutStatValue}>{workout.sets}</Text>
                                    <Text style={styles.workoutStatLabel}>sets</Text>
                                  </View>
                                )}
                                {workout.reps > 0 && (
                                  <View style={styles.workoutStat}>
                                    <Text style={styles.workoutStatValue}>{workout.reps}</Text>
                                    <Text style={styles.workoutStatLabel}>reps</Text>
                                  </View>
                                )}
                                {workout.timer && (
                                  <View style={styles.workoutStat}>
                                    <Text style={styles.workoutStatValue}>{workout.timer}</Text>
                                    <Text style={styles.workoutStatLabel}>timer</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Session Notes */}
                      <View style={styles.expandedSection}>
                        <Text style={styles.expandedSectionTitle}>Session Notes</Text>
                        <TextInput
                          style={styles.notesInput}
                          placeholder="Add notes about this session..."
                          placeholderTextColor={theme.colors.textMuted}
                          value={sessionNotes[session._id] || session.sessionNotes || ""}
                          onChangeText={(text) => setSessionNotes({ ...sessionNotes, [session._id]: text })}
                          multiline
                          numberOfLines={3}
                        />
                        {sessionNotes[session._id] !== (session.sessionNotes || "") && (
                          <TouchableOpacity
                            style={styles.saveNotesBtn}
                            onPress={() => saveSessionNotes(session._id)}
                            disabled={updatingSessionId === session._id}
                          >
                            {updatingSessionId === session._id ? (
                              <ActivityIndicator size="small" color={theme.colors.textWhite} />
                            ) : (
                              <>
                                <Ionicons name="checkmark" size={18} color={theme.colors.textWhite} />
                                <Text style={styles.saveNotesBtnText}>Save Notes</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Feedback */}
                      {session.sessionFeedback && (
                        <View style={styles.expandedSection}>
                          <View style={styles.feedbackHeader}>
                            <Ionicons name="chatbox-ellipses" size={20} color={theme.colors.secondPrimary} />
                            <Text style={[styles.expandedSectionTitle, { marginBottom: 0 }]}>Client Feedback</Text>
                          </View>
                          <Text style={styles.feedbackText}>{session.sessionFeedback}</Text>
                        </View>
                      )}

                      {/* Action Buttons */}
                      {(canComplete || canCancel) && (
                        <View style={styles.actionButtons}>
                          {canComplete && (
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => updateSessionStatus(session._id, "completed")}
                              disabled={updatingSessionId === session._id}
                              activeOpacity={0.7}
                            >
                              {updatingSessionId === session._id ? (
                                <ActivityIndicator size="small" color={theme.colors.text} />
                              ) : (
                                <Text style={styles.actionBtnText}>Mark Session as Completed</Text>
                              )}
                            </TouchableOpacity>
                          )}
                          {canCancel && (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.cancelBtn]}
                              onPress={() => updateSessionStatus(session._id, "cancelled")}
                              disabled={updatingSessionId === session._id}
                              activeOpacity={0.7}
                            >
                              {updatingSessionId === session._id ? (
                                <ActivityIndicator size="small" color={theme.colors.error} />
                              ) : (
                                <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Cancel Session</Text>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Create Session Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={false}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer} edges={["left", "right", "bottom"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                setSelectedDates([]);
                setSessionItems([]);
                setActivePlanId("");
                setActiveServiceId("");
              }}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Create Session</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
            >
            {/* Session Type Selection */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Session Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    sessionAgainstType === "againstPlan" && styles.typeButtonActive
                  ]}
                  onPress={() => {
                    setSessionAgainstType("againstPlan");
                    setActivePlanId("");
                    setActiveServiceId("");
                    setSelectedDates([]);
                    setSessionItems([]);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="barbell"
                    size={20}
                    color={sessionAgainstType === "againstPlan" ? theme.colors.text : theme.colors.textMuted}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    sessionAgainstType === "againstPlan" && styles.typeButtonTextActive
                  ]}>
                    Plan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    sessionAgainstType === "againstService" && styles.typeButtonActive
                  ]}
                  onPress={() => {
                    setSessionAgainstType("againstService");
                    setActivePlanId("");
                    setActiveServiceId("");
                    setSelectedDates([]);
                    setSessionItems([]);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="construct"
                    size={20}
                    color={sessionAgainstType === "againstService" ? theme.colors.text : theme.colors.textMuted}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    sessionAgainstType === "againstService" && styles.typeButtonTextActive
                  ]}>
                    Service
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {sessionAgainstType === "againstPlan" && (
              <>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Select Plan ({plans.length})</Text>

                  {plans.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="alert-circle-outline" size={40} color={theme.colors.textMuted} />
                      <Text style={styles.emptyStateText}>No active plans found</Text>
                    </View>
                  ) : (
                    <View style={styles.planList}>
                      {plans.map((plan) => {
                        const planName = plan.plan?.title ||
                                        plan.plan?.planName ||
                                        plan.plan?.planItem?.planName ||
                                        plan.dietPlanDetails?.title ||
                                        "Unknown Plan";
                        const isSelected = activePlanId === plan._id;

                        return (
                          <TouchableOpacity
                            key={plan._id}
                            style={[
                              styles.simpleCard,
                              isSelected && styles.simpleCardSelected
                            ]}
                            onPress={() => {
                              console.log("Plan selected:", plan._id);
                              setActivePlanId(plan._id);
                              setSelectedDates([]);
                              setSessionItems([]);
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.simpleCardContent}>
                              <View style={[
                                styles.simpleCardIcon,
                                isSelected && styles.simpleCardIconSelected
                              ]}>
                                {isSelected && (
                                  <View style={styles.radioInner} />
                                )}
                              </View>
                              <View style={styles.simpleCardInfo}>
                                <Text style={styles.simpleCardTitle}>
                                  {planName}
                                </Text>
                                <Text style={styles.simpleCardSubtitle}>
                                  {plan.remainingSessions} of {plan.totalSessions} sessions remaining
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {activePlanId && (
                  <View style={styles.detailsCard}>
                    <TouchableOpacity
                      style={styles.detailsHeader}
                      onPress={() => setExpandedPlanId(expandedPlanId === activePlanId ? null : activePlanId)}
                    >
                      <Text style={styles.detailsTitle}>Plan Details</Text>
                      <Ionicons
                        name={expandedPlanId === activePlanId ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={theme.colors.text}
                      />
                    </TouchableOpacity>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Total Sessions</Text>
                        <Text style={styles.detailValue}>{PlanDetails.totalSessions}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Remaining</Text>
                        <Text style={styles.detailValue}>{PlanDetails.remainingSessions}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Online Plan</Text>
                        <Text style={styles.detailValue}>{PlanDetails.isOnlinePlan}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Trainer</Text>
                        <Text style={styles.detailValue}>{PlanDetails.trainer || "NA"}</Text>
                      </View>
                    </View>
                    {expandedPlanId === activePlanId && (
                      <View style={[styles.detailsGrid, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Start Date</Text>
                          <Text style={styles.detailValue}>{formatDate(PlanDetails.planStartDate)}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>End Date</Text>
                          <Text style={styles.detailValue}>{formatDate(PlanDetails.planEndDate)}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Purchase Date</Text>
                          <Text style={styles.detailValue}>{formatDate(PlanDetails.createdAt)}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {sessionAgainstType === "againstService" && (
              <>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Select Service ({services.length})</Text>

                  {services.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="alert-circle-outline" size={40} color={theme.colors.textMuted} />
                      <Text style={styles.emptyStateText}>No active services found</Text>
                    </View>
                  ) : (
                    <View style={styles.planList}>
                      {services.map((service) => {
                        const serviceName = service.serviceDetails?.title ||
                                           service.service?.serviceName ||
                                           service.service?.title ||
                                           "Unknown Service";
                        const isSelected = activeServiceId === service._id;

                        return (
                          <TouchableOpacity
                            key={service._id}
                            style={[
                              styles.simpleCard,
                              isSelected && styles.simpleCardSelected
                            ]}
                            onPress={() => {
                              console.log("Service selected:", service._id);
                              setActiveServiceId(service._id);
                              setSelectedDates([]);
                              setSessionItems([]);
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.simpleCardContent}>
                              <View style={[
                                styles.simpleCardIcon,
                                isSelected && styles.simpleCardIconSelected
                              ]}>
                                {isSelected && (
                                  <View style={styles.radioInner} />
                                )}
                              </View>
                              <View style={styles.simpleCardInfo}>
                                <Text style={styles.simpleCardTitle}>
                                  {serviceName}
                                </Text>
                                <Text style={styles.simpleCardSubtitle}>
                                  {service.remainingSessions} of {service.totalSessions} sessions remaining
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {activeServiceId && (
                  <View style={styles.detailsCard}>
                    <TouchableOpacity
                      style={styles.detailsHeader}
                      onPress={() => setExpandedServiceId(expandedServiceId === activeServiceId ? null : activeServiceId)}
                    >
                      <Text style={styles.detailsTitle}>Service Details</Text>
                      <Ionicons
                        name={expandedServiceId === activeServiceId ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={theme.colors.text}
                      />
                    </TouchableOpacity>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Total Sessions</Text>
                        <Text style={styles.detailValue}>{ServiceDetails.totalSessions}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Remaining</Text>
                        <Text style={styles.detailValue}>{ServiceDetails.remainingSessions}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Online Service</Text>
                        <Text style={styles.detailValue}>{ServiceDetails.isOnlinePlan}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Trainer</Text>
                        <Text style={styles.detailValue}>{ServiceDetails.trainer || "NA"}</Text>
                      </View>
                    </View>
                    {expandedServiceId === activeServiceId && (
                      <View style={[styles.detailsGrid, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Purchase Date</Text>
                          <Text style={styles.detailValue}>{formatDate(ServiceDetails.createdAt)}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {(activePlanId || activeServiceId) && (
              <>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>
                    Select Dates {selectedDates.length > 0 && `(${selectedDates.length} selected)`}
                  </Text>
                </View>

                <View style={styles.calendarCard}>
                <Calendar
                  current={new Date().toISOString().slice(0, 10)}
                  markedDates={markedDates}
                  onDayPress={handleDayPress}
                  theme={{
                    todayTextColor: theme.colors.secondPrimary,
                    arrowColor: theme.colors.text,
                    monthTextColor: theme.colors.text,
                    textDayFontWeight: "500",
                    textMonthFontWeight: "700",
                    textDayHeaderFontWeight: "600",
                    selectedDayBackgroundColor: theme.colors.text,
                    selectedDayTextColor: theme.colors.background,
                    textDisabledColor: theme.colors.textMuted,
                    textSectionTitleColor: theme.colors.text,
                    backgroundColor: theme.colors.background,
                    calendarBackground: theme.colors.background,
                    dayTextColor: theme.colors.text,
                  }}
                />
                </View>

                {sessionItems.length > 0 && (
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Session Details</Text>
                  </View>
                )}

                {sessionItems.map((item, index) => {
                  const sessionItem = sessionItems.find((s) => areDatesSame(s.sessionDate, item.sessionDate));
                  return (
                    <View key={index} style={styles.modernSessionCard}>
                      <View style={styles.sessionCardHeader}>
                        <Text style={styles.sessionHeaderTitle}>
                          Session {index + 1} - {formatDate(item.sessionDate)}
                        </Text>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Trainer</Text>
                        <View style={styles.modernPickerContainer}>
                          <Picker
                            selectedValue={item.trainerId}
                            onValueChange={(value) => updateSessionItem(item.sessionDate, "trainerId", value)}
                            style={styles.modernPicker}
                            itemStyle={{ color: theme.colors.text }}
                          >
                            <Picker.Item
                              label="Select trainer..."
                              value=""
                              color={theme.colors.textMuted}
                            />
                            {trainers.map((trainer) => (
                              <Picker.Item
                                key={trainer._id}
                                label={trainer.name}
                                value={trainer._id}
                                color={theme.colors.text}
                              />
                            ))}
                          </Picker>
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Session Time *</Text>
                        <TouchableOpacity
                          style={styles.timeInput}
                          onPress={() => openTimePicker(item.sessionDate)}
                        >
                          <Ionicons name="time-outline" size={20} color={theme.colors.textMuted} />
                          <Text style={item.sessionTime ? styles.timeInputText : styles.timeInputPlaceholder}>
                            {item.sessionTime || "Select time"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Duration (min) *</Text>
                        <TextInput
                          style={styles.modernInput}
                          placeholder="90"
                          placeholderTextColor={theme.colors.textMuted}
                          value={item.sessionDuration}
                          onChangeText={(value) => updateSessionItem(item.sessionDate, "sessionDuration", value)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Session Type *</Text>
                        <View style={styles.typeSelector}>
                          <TouchableOpacity
                            style={[
                              styles.typeOption,
                              item.sessionType === "online" && styles.typeOptionActive
                            ]}
                            onPress={() => updateSessionItem(item.sessionDate, "sessionType", "online")}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.typeOptionText,
                              item.sessionType === "online" && styles.typeOptionTextActive
                            ]}>
                              Online
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.typeOption,
                              item.sessionType === "offline" && styles.typeOptionActive
                            ]}
                            onPress={() => updateSessionItem(item.sessionDate, "sessionType", "offline")}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.typeOptionText,
                              item.sessionType === "offline" && styles.typeOptionTextActive
                            ]}>
                              Offline
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {item.sessionType === "offline" && (
                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Address *</Text>
                          <TextInput
                            style={[styles.modernInput, styles.modernInputMultiline]}
                            placeholder="Enter session address..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={item.sessionAddress}
                            onChangeText={(value) => updateSessionItem(item.sessionDate, "sessionAddress", value)}
                            multiline
                            numberOfLines={2}
                          />
                        </View>
                      )}

                      <View style={styles.workoutSection}>
                        <View style={styles.workoutSectionHeader}>
                          <Text style={styles.formLabel}>Workout Exercises</Text>
                          <TouchableOpacity
                            onPress={() => addWorkoutItem(item.sessionDate)}
                            style={styles.addExerciseButton}
                          >
                            <Ionicons name="add" size={20} color={theme.colors.text} />
                          </TouchableOpacity>
                        </View>

                        {item.workoutItems.length === 0 ? (
                          <View style={styles.emptyWorkout}>
                            <Text style={styles.emptyWorkoutText}>No exercises added</Text>
                          </View>
                        ) : (
                          item.workoutItems.map((workout, workoutIndex) => (
                            <View key={workoutIndex} style={styles.modernWorkoutCard}>
                              <View style={styles.workoutCardHeader}>
                                <Text style={styles.exerciseNumber}>Exercise {workoutIndex + 1}</Text>
                                <TouchableOpacity
                                  onPress={() => deleteWorkoutItem(item.sessionDate, workoutIndex)}
                                  style={styles.deleteButton}
                                >
                                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                </TouchableOpacity>
                              </View>

                              <View style={styles.formGroup}>
                                <TextInput
                                  style={styles.modernInput}
                                  placeholder="Exercise name *"
                                  placeholderTextColor={theme.colors.textMuted}
                                  value={workout.exercise}
                                  onChangeText={(value) =>
                                    updateWorkoutItem(item.sessionDate, workoutIndex, "exercise", value)
                                  }
                                />
                              </View>

                              <View style={styles.workoutMetricsRow}>
                                <View style={[styles.metricInput, { marginRight: 6 }]}>
                                  <Text style={styles.metricLabel}>Sets</Text>
                                  <TextInput
                                    style={styles.metricValue}
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={workout.sets}
                                    onChangeText={(value) =>
                                      updateWorkoutItem(item.sessionDate, workoutIndex, "sets", value)
                                    }
                                    keyboardType="numeric"
                                  />
                                </View>
                                <View style={[styles.metricInput, { marginHorizontal: 6 }]}>
                                  <Text style={styles.metricLabel}>Reps</Text>
                                  <TextInput
                                    style={styles.metricValue}
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={workout.reps}
                                    onChangeText={(value) =>
                                      updateWorkoutItem(item.sessionDate, workoutIndex, "reps", value)
                                    }
                                    keyboardType="numeric"
                                  />
                                </View>
                                <View style={[styles.metricInput, { marginLeft: 6 }]}>
                                  <Text style={styles.metricLabel}>Timer</Text>
                                  <TextInput
                                    style={styles.metricValue}
                                    placeholder="10m"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={workout.timer}
                                    onChangeText={(value) =>
                                      updateWorkoutItem(item.sessionDate, workoutIndex, "timer", value)
                                    }
                                  />
                                </View>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  );
                })}

                {sessionItems.length > 0 && (
                  <TouchableOpacity
                    style={[styles.modernCreateButton, creating && styles.createButtonDisabled]}
                    onPress={createSession}
                    disabled={creating}
                    activeOpacity={0.8}
                  >
                    {creating ? (
                      <>
                        <ActivityIndicator color={theme.colors.textWhite} size="small" />
                        <Text style={[styles.createButtonText, { marginLeft: 8 }]}>Creating...</Text>
                      </>
                    ) : (
                      <Text style={styles.createButtonText}>
                        Create {sessionItems.length} Session{sessionItems.length > 1 ? 's' : ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Time Picker Bottom Sheet */}
      {showTimePicker && showCreateModal && (
        <View style={styles.timePickerOverlay}>
          <TouchableOpacity
            style={styles.timePickerBackdrop}
            activeOpacity={1}
            onPress={handleTimeCancel}
          />
          <View style={styles.timePickerBottomSheet}>
            <View style={styles.timePickerHandle} />
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={handleTimeCancel}>
                <Text style={styles.timePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerHeaderTitle}>Select Time</Text>
              <TouchableOpacity onPress={handleTimeConfirm}>
                <Text style={styles.timePickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContent}>
              <Picker
                selectedValue={tempTime.getHours()}
                onValueChange={(value) => {
                  const newTime = new Date(tempTime);
                  newTime.setHours(value);
                  setTempTime(newTime);
                }}
                style={[styles.timePicker, { flex: 1 }]}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <Picker.Item
                    key={i}
                    label={i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                    value={i}
                  />
                ))}
              </Picker>

              <Text style={styles.timePickerSeparator}>:</Text>

              <Picker
                selectedValue={tempTime.getMinutes()}
                onValueChange={(value) => {
                  const newTime = new Date(tempTime);
                  newTime.setMinutes(value);
                  setTempTime(newTime);
                }}
                style={[styles.timePicker, { flex: 1 }]}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <Picker.Item
                    key={i}
                    label={i.toString().padStart(2, "0")}
                    value={i}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "ios" ? 60 : 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
    },
    headerContent: {
      flex: 1,
      marginLeft: 12,
    },
    headerTitle: {
      fontSize: theme.fontSizes.large,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    sessionsSection: {
      marginTop: 24,
    },
    sessionCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    sessionMainContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    sessionLeft: {
      flexDirection: "row",
      flex: 1,
    },
    sessionColorBar: {
      width: 4,
      borderRadius: 2,
      marginRight: 12,
    },
    sessionMainInfo: {
      flex: 1,
    },
    sessionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    sessionTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      flex: 1,
    },
    sessionStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.textMuted,
    },
    statusCompleted: {
      backgroundColor: "#4CAF50",
    },
    statusCancelled: {
      backgroundColor: "#F44336",
    },
    statusScheduled: {
      backgroundColor: theme.colors.secondPrimary,
    },
    sessionStatusText: {
      fontSize: 10,
      fontWeight: theme.fontWeights.bold as "600",
      color: theme.colors.textWhite,
      textTransform: "capitalize",
    },
    sessionPlanName: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      color: theme.colors.secondPrimary,
      marginBottom: 8,
    },
    sessionQuickInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    quickInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    quickInfoText: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
    },
    sessionExpandedContent: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
    },
    expandedSection: {
      marginBottom: 16,
    },
    expandedSectionTitle: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    feedbackHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    expandedInfoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 10,
    },
    expandedInfoContent: {
      flex: 1,
    },
    expandedInfoLabel: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginBottom: 2,
    },
    expandedInfoValue: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      fontWeight: theme.fontWeights.medium as "500",
    },
    workoutItem: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    workoutHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    workoutNumber: {
      fontSize: theme.fontSizes.small,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textMuted,
    },
    workoutName: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      flex: 1,
    },
    workoutStats: {
      flexDirection: "row",
      gap: 8,
    },
    workoutStat: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    workoutStatValue: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    workoutStatLabel: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    notesInput: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      minHeight: 80,
      textAlignVertical: "top",
    },
    saveNotesBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.text,
      borderRadius: 12,
      padding: 12,
      marginTop: 10,
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    saveNotesBtnText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textWhite,
    },
    feedbackText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      lineHeight: 22,
      fontStyle: "italic",
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      padding: 12,
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.secondPrimary,
    },
    actionButtons: {
      gap: 8,
      marginTop: 8,
    },
    actionBtn: {
      width: "100%",
      borderRadius: 10,
      padding: 14,
      backgroundColor: theme.colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtn: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.error + "60",
    },
    actionBtnText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "600",
      color: theme.colors.textWhite,
    },
    cancelBtnText: {
      color: theme.colors.error,
    },
    sessionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sessionTypeIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 10,
    },
    sessionType: {
      flex: 1,
      fontSize: theme.fontSizes.regularSmall,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    sessionStatusBadge: {
      backgroundColor: isDark ? theme.colors.backgroundCardLight : theme.colors.backgroundSecondary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    sessionStatus: {
      fontSize: theme.fontSizes.small,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      textTransform: "uppercase",
    },
    sessionInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    sessionInfoText: {
      marginLeft: 8,
      fontSize: theme.fontSizes.regularSmall,
      color: theme.colors.textSecondary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "ios" ? 60 : 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    modalCloseButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
    },
    modalHeaderContent: {
      flex: 1,
      alignItems: "center",
      marginLeft: 12,
    },
    modalTitle: {
      fontSize: theme.fontSizes.large,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    modalContent: {
      flex: 1,
      padding: 16,
    },
    label: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    pickerContainer: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      marginBottom: 16,
    },
    picker: {
      color: theme.colors.text,
      backgroundColor: "transparent",
      height: Platform.OS === "ios" ? 180 : 50,
      width: "100%",
    },
    input: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    inputText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
    },
    inputPlaceholder: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
    },
    detailsCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    detailsTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    detailsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    detailsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    detailItem: {
      width: "50%",
      marginBottom: 12,
    },
    detailLabel: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      color: theme.colors.text,
    },
    sessionFormCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sessionFormTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    workoutHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
    },
    addWorkoutButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    workoutItem: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundCardLight,
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    workoutItemHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    workoutItemTitle: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      color: theme.colors.text,
    },
    workoutRow: {
      flexDirection: "row",
      marginBottom: 12,
    },
    createButton: {
      backgroundColor: theme.colors.text,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      marginTop: 24,
      marginBottom: 32,
    },
    createButtonDisabled: {
      opacity: 0.6,
    },
    createButtonText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textWhite,
    },
    selectableCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
      overflow: "hidden",
    },
    selectableCardSelected: {
      borderColor: theme.colors.secondPrimary,
      borderWidth: 2,
    },
    selectableCardContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    selectableCardLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    selectableCardIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    selectableCardText: {
      flex: 1,
    },
    selectableCardTitle: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    selectableCardSubtitle: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
    },
    emptyCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
      marginTop: 12,
      textAlign: "center",
    },
    // Section Card
    sectionCard: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    // Type Buttons
    typeButtons: {
      flexDirection: "row",
      gap: 12,
    },
    typeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    typeButtonActive: {
      backgroundColor: theme.colors.text,
      borderColor: theme.colors.text,
    },
    typeButtonText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      color: theme.colors.textMuted,
      marginLeft: 6,
    },
    typeButtonTextActive: {
      color: theme.colors.background,
      fontWeight: theme.fontWeights.bold as "700",
    },
    // Simple Cards
    planList: {
      gap: 10,
    },
    simpleCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    simpleCardSelected: {
      borderColor: theme.colors.text,
      backgroundColor: isDark ? theme.colors.text + "15" : theme.colors.text + "08",
    },
    simpleCardContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    simpleCardIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    simpleCardIconSelected: {
      borderColor: theme.colors.text,
      backgroundColor: "transparent",
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.text,
    },
    simpleCardInfo: {
      flex: 1,
    },
    simpleCardTitle: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    simpleCardSubtitle: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
    },
    // Empty State
    emptyState: {
      alignItems: "center",
      paddingVertical: 24,
    },
    emptyStateText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
      textAlign: "center",
      marginTop: 8,
    },
    // Calendar Card
    calendarCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    // Modern Session Card
    modernSessionCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sessionCardHeader: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sessionHeaderTitle: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    // Form Elements
    formGroup: {
      marginBottom: 16,
    },
    formLabel: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      color: theme.colors.text,
      marginBottom: 8,
    },
    modernPickerContainer: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    modernPicker: {
      color: theme.colors.text,
      backgroundColor: "transparent",
      height: Platform.OS === "ios" ? 180 : 50,
    },
    modernInput: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
    },
    modernInputMultiline: {
      minHeight: 70,
      textAlignVertical: "top",
      paddingTop: 14,
    },
    typeSelector: {
      flexDirection: "row",
      gap: 10,
    },
    typeOption: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    typeOptionActive: {
      backgroundColor: theme.colors.text,
      borderColor: theme.colors.text,
    },
    typeOptionText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.medium as "500",
      color: theme.colors.textMuted,
    },
    typeOptionTextActive: {
      color: theme.colors.background,
      fontWeight: theme.fontWeights.bold as "700",
    },
    // Workout Section
    workoutSection: {
      marginTop: 8,
    },
    workoutSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    addExerciseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyWorkout: {
      alignItems: "center",
      paddingVertical: 20,
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyWorkoutText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
    },
    modernWorkoutCard: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    workoutCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    exerciseNumber: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    deleteButton: {
      padding: 4,
    },
    workoutMetricsRow: {
      flexDirection: "row",
      marginTop: 4,
    },
    metricInput: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    metricLabel: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginBottom: 4,
      fontWeight: theme.fontWeights.medium as "500",
    },
    metricValue: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      padding: 0,
    },
    // Bottom Actions
    modernCreateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.text,
      borderRadius: 14,
      padding: 16,
      marginTop: 8,
    },
    // Time Input
    timeInput: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? theme.colors.background : theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
    },
    timeInputText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      marginLeft: 10,
      flex: 1,
    },
    timeInputPlaceholder: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
      marginLeft: 10,
      flex: 1,
    },
    // Time Picker Bottom Sheet
    timePickerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    },
    timePickerBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    timePickerBottomSheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "ios" ? 34 : 20,
    },
    timePickerHandle: {
      width: 40,
      height: 5,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      alignSelf: "center",
      marginTop: 8,
      marginBottom: 8,
    },
    timePickerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    timePickerHeaderTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    timePickerCancelText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.error,
      fontWeight: theme.fontWeights.medium as "500",
    },
    timePickerDoneText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      fontWeight: theme.fontWeights.bold as "700",
    },
    timePickerContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    timePicker: {
      color: theme.colors.text,
      backgroundColor: "transparent",
      height: Platform.OS === "ios" ? 180 : 50,
    },
    timePickerSeparator: {
      fontSize: 24,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginHorizontal: 10,
    },
  });

export default TrainerSessionCalendar;
