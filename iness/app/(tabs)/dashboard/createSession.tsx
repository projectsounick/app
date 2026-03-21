import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

function CreateSession() {
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

  const [sessionAgainstType, setSessionAgainstType] = useState<"againstPlan" | "againstService">("againstPlan");
  const [activePlanId, setActivePlanId] = useState<string>("");
  const [activeServiceId, setActiveServiceId] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);
  const [creating, setCreating] = useState(false);

  const [expandedTimePickerDate, setExpandedTimePickerDate] = useState<Date | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchActivePlans(),
        fetchActiveServices(),
        fetchTrainers(),
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
  selectedDates.forEach((date) => {
    const dateString = date.toISOString().slice(0, 10);
    markedDates[dateString] = {
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
    setSessionItems((prev) =>
      prev.map((item) =>
        areDatesSame(item.sessionDate, date) ? { ...item, [field]: value } : item
      )
    );
  };

  const toggleTimePicker = (date: Date) => {
    if (expandedTimePickerDate && areDatesSame(expandedTimePickerDate, date)) {
      setExpandedTimePickerDate(null);
    } else {
      setExpandedTimePickerDate(date);
    }
  };

  const updateTimeForSession = (date: Date, hour: number, minute: number, period: 'AM' | 'PM') => {
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 = hour + 12;
    if (period === 'AM' && hour === 12) hour24 = 0;

    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`;
    updateSessionItem(date, "sessionTime", formattedTime);
  };

  const getTimeComponents = (sessionTime: string) => {
    if (!sessionTime) return { hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' };

    const [time, period] = sessionTime.split(" ");
    const [hours, minutes] = time.split(":");
    return {
      hour: parseInt(hours),
      minute: parseInt(minutes),
      period: period as 'AM' | 'PM'
    };
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

    for (const item of sessionItems) {
      if (!item.trainerId) {
        Alert.alert("Error", "Please select a trainer for all selected dates");
        return;
      }
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
        Alert.alert("Success", "Sessions created successfully", [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]);
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
      <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Session</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Session</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.content}
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

              {sessionItems.map((item, index) => (
                <View key={index} style={styles.modernSessionCard}>
                  <View style={styles.sessionCardHeader}>
                    <Text style={styles.sessionHeaderTitle}>
                      Session {index + 1} - {formatDate(item.sessionDate)}
                    </Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Trainer *</Text>
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
                      onPress={() => toggleTimePicker(item.sessionDate)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="time-outline" size={20} color={theme.colors.textMuted} />
                      <Text style={item.sessionTime ? styles.timeInputText : styles.timeInputPlaceholder}>
                        {item.sessionTime || "Select time"}
                      </Text>
                      <Ionicons
                        name={expandedTimePickerDate && areDatesSame(expandedTimePickerDate, item.sessionDate) ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={theme.colors.textMuted}
                      />
                    </TouchableOpacity>

                    {expandedTimePickerDate && areDatesSame(expandedTimePickerDate, item.sessionDate) && (
                      <View style={styles.inlineTimePicker}>
                        <View style={styles.timePickerRow}>
                          <View style={styles.timePickerColumn}>
                            <Text style={styles.timePickerLabel}>Hour</Text>
                            <View style={styles.timePickerWrapper}>
                              <Picker
                                selectedValue={getTimeComponents(item.sessionTime).hour}
                                onValueChange={(value) => {
                                  const { minute, period } = getTimeComponents(item.sessionTime);
                                  updateTimeForSession(item.sessionDate, value, minute, period);
                                }}
                                style={styles.inlinePicker}
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                  <Picker.Item key={h} label={h.toString().padStart(2, "0")} value={h} />
                                ))}
                              </Picker>
                            </View>
                          </View>

                          <View style={styles.timePickerColumn}>
                            <Text style={styles.timePickerLabel}>Minute</Text>
                            <View style={styles.timePickerWrapper}>
                              <Picker
                                selectedValue={getTimeComponents(item.sessionTime).minute}
                                onValueChange={(value) => {
                                  const { hour, period } = getTimeComponents(item.sessionTime);
                                  updateTimeForSession(item.sessionDate, hour, value, period);
                                }}
                                style={styles.inlinePicker}
                              >
                                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                  <Picker.Item key={m} label={m.toString().padStart(2, "0")} value={m} />
                                ))}
                              </Picker>
                            </View>
                          </View>

                          <View style={styles.timePickerColumn}>
                            <Text style={styles.timePickerLabel}>Period</Text>
                            <View style={styles.timePickerWrapper}>
                              <Picker
                                selectedValue={getTimeComponents(item.sessionTime).period}
                                onValueChange={(value) => {
                                  const { hour, minute } = getTimeComponents(item.sessionTime);
                                  updateTimeForSession(item.sessionDate, hour, minute, value as 'AM' | 'PM');
                                }}
                                style={styles.inlinePicker}
                              >
                                <Picker.Item label="AM" value="AM" />
                                <Picker.Item label="PM" value="PM" />
                              </Picker>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
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
              ))}

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
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
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
    headerTitle: {
      fontSize: theme.fontSizes.large,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
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
    sectionCard: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
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
    detailsCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    detailsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    detailsTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
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
    calendarCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
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
    inlineTimePicker: {
      marginTop: 12,
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timePickerRow: {
      flexDirection: "row",
      gap: 10,
    },
    timePickerColumn: {
      flex: 1,
    },
    timePickerLabel: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginBottom: 6,
      fontWeight: theme.fontWeights.medium as "500",
      textAlign: "center",
    },
    timePickerWrapper: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    inlinePicker: {
      color: theme.colors.text,
      backgroundColor: "transparent",
      height: Platform.OS === "ios" ? 120 : 50,
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
    modernCreateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.text,
      borderRadius: 14,
      padding: 16,
      marginTop: 8,
    },
    createButtonDisabled: {
      opacity: 0.6,
    },
    createButtonText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textWhite,
    },
  });

export default CreateSession;
