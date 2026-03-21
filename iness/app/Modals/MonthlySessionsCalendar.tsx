import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { Calendar } from "react-native-calendars";
import { fetchWrapper } from "@/app/helpers/fetchWrapper";
import { config } from "@/app/shared/config";

const baseUrl = `${config.apiUrl}/api`;
const { height } = Dimensions.get("window");

interface SessionData {
  _id: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: "online" | "offline";
  sessionStatus: "scheduled" | "completed" | "cancelled";
  sessionDuration: string;
  sessionAddress?: string;
  sessionNotes?: string;
  userDetails?: {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
  };
  trainerDetails?: {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
  };
  activePlanDetails?: {
    plan?: {
      planName?: string;
      planItem?: {
        planName?: string;
      };
    };
  };
  activeServiceDetails?: {
    service?: {
      serviceName?: string;
    };
  };
}

interface MonthlySessionsCalendarProps {
  visible: boolean;
  onClose: () => void;
}

export default function MonthlySessionsCalendar({
  visible,
  onClose,
}: MonthlySessionsCalendarProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateSessions, setSelectedDateSessions] = useState<SessionData[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchMonthSessions(currentDate.getFullYear(), currentDate.getMonth() + 1);
    }
  }, [visible, currentDate]);

  const fetchMonthSessions = async (year: number, month: number) => {
    try {
      setLoading(true);
      const response = await fetchWrapper.get(
        `${baseUrl}/get-monthly-sessions?year=${year}&month=${month}`
      );

      if (response.success && response.data) {
        setSessions(response.data);
        processMarkedDates(response.data);
      }
    } catch (error) {
      console.error("Error fetching monthly sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const processMarkedDates = (sessionData: SessionData[]) => {
    const marked: any = {};
    const dateCounts: any = {};

    sessionData.forEach((session) => {
      const dateStr = new Date(session.sessionDate).toISOString().split("T")[0];

      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dots: [],
          sessionCount: 0,
        };
      }

      marked[dateStr].sessionCount = (marked[dateStr].sessionCount || 0) + 1;

      // Add color dot based on status (limit to 3 dots max for display)
      if (marked[dateStr].dots.length < 3) {
        let color = theme.colors.secondPrimary;
        if (session.sessionStatus === "completed") {
          color = theme.colors.success;
        } else if (session.sessionStatus === "cancelled") {
          color = theme.colors.error;
        }

        marked[dateStr].dots.push({ color });
      }
    });

    setMarkedDates(marked);
  };

  const handleDatePress = (date: string) => {
    setSelectedDate(date);
    const dateSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.sessionDate).toISOString().split("T")[0];
      return sessionDate === date;
    });
    setSelectedDateSessions(dateSessions);
  };

  const handleSessionPress = async (sessionId: string) => {
    try {
      setLoadingDetails(true);
      const response = await fetchWrapper.get(
        `${baseUrl}/get-session-details?sessionId=${sessionId}`
      );

      if (response.success && response.data) {
        setSessionDetails(response.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleMonthChange = (months: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + months);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedDateSessions([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.secondPrimary;
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    return time;
  };

  const renderSessionItem = ({ item }: { item: SessionData }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleSessionPress(item._id)}
      activeOpacity={0.7}
    >
      <View style={styles.sessionCardHeader}>
        <View style={styles.sessionUserInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={theme.colors.text} />
          </View>
          <View style={styles.sessionUserText}>
            <Text style={styles.sessionUserName}>{item.userDetails?.name || "Unknown"}</Text>
            <Text style={styles.sessionTime}>{formatTime(item.sessionTime)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.sessionStatusBadge,
            { backgroundColor: getStatusColor(item.sessionStatus) + "20" },
          ]}
        >
          <Text
            style={[styles.sessionStatusText, { color: getStatusColor(item.sessionStatus) }]}
          >
            {item.sessionStatus}
          </Text>
        </View>
      </View>

      <View style={styles.sessionCardDetails}>
        <View style={styles.sessionDetailRow}>
          <Ionicons
            name={item.sessionType === "online" ? "videocam" : "location"}
            size={14}
            color={theme.colors.textMuted}
          />
          <Text style={styles.sessionDetailText}>
            {item.sessionType === "online" ? "Online" : "Offline"}
          </Text>
        </View>
        <View style={styles.sessionDetailRow}>
          <Ionicons name="time" size={14} color={theme.colors.textMuted} />
          <Text style={styles.sessionDetailText}>{item.sessionDuration} min</Text>
        </View>
      </View>

      {item.activePlanDetails?.plan && (
        <Text style={styles.sessionPlanName} numberOfLines={1}>
          {item.activePlanDetails.plan.planItem?.planName ||
            item.activePlanDetails.plan.planName ||
            "Plan Session"}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sessions Calendar</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={() => handleMonthChange(-1)}
              style={styles.monthNavButton}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity
              onPress={() => handleMonthChange(1)}
              style={styles.monthNavButton}
            >
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.secondPrimary} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Calendar */}
              <Calendar
                current={currentDate.toISOString().split("T")[0]}
                onDayPress={(day) => handleDatePress(day.dateString)}
                markedDates={markedDates}
                markingType="custom"
                hideArrows={true}
                hideExtraDays={true}
                disableMonthChange={true}
                dayComponent={({ date, state, marking }: any) => {
                  const sessionCount = marking?.sessionCount || 0;
                  const dots = marking?.dots || [];
                  const isToday = new Date().toISOString().split("T")[0] === date.dateString;
                  const isSelected = selectedDate === date.dateString;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.dayContainer,
                        isSelected && styles.selectedDay,
                      ]}
                      onPress={() => handleDatePress(date.dateString)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          isSelected && styles.selectedDayText,
                          state === "disabled" && styles.disabledDayText,
                        ]}
                      >
                        {date.day}
                      </Text>

                      {sessionCount > 0 && (
                        <>
                          <View style={styles.sessionIndicator}>
                            {dots.slice(0, 3).map((dot: any, index: number) => (
                              <View
                                key={`${date.dateString}-${index}`}
                                style={[styles.dot, { backgroundColor: dot.color }]}
                              />
                            ))}
                          </View>
                          <View style={styles.sessionCountBadge}>
                            <Text style={styles.sessionCountText}>{sessionCount}</Text>
                          </View>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                }}
                theme={{
                  backgroundColor: theme.colors.background,
                  calendarBackground: theme.colors.background,
                  textSectionTitleColor: theme.colors.textMuted,
                  textMonthFontFamily: theme.fonts.bold,
                  textDayFontFamily: theme.fonts.regular,
                  textDayHeaderFontFamily: theme.fonts.semiBold,
                  'stylesheet.calendar.header': {
                    header: {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingLeft: 10,
                      paddingRight: 10,
                      marginTop: 6,
                      alignItems: 'center',
                      height: 0,
                      opacity: 0,
                    },
                  },
                }}
              />

              {/* Sessions for selected date */}
              {selectedDate && (
                <View style={styles.selectedDateContainer}>
                  <Text style={styles.selectedDateTitle}>
                    {selectedDateSessions.length} session{selectedDateSessions.length !== 1 ? "s" : ""} on{" "}
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>

                  {selectedDateSessions.length > 0 ? (
                    <FlatList
                      data={selectedDateSessions}
                      renderItem={renderSessionItem}
                      keyExtractor={(item) => item._id}
                      scrollEnabled={false}
                    />
                  ) : (
                    <View style={styles.noSessionsContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={48}
                        color={theme.colors.textMuted}
                      />
                      <Text style={styles.noSessionsText}>No sessions on this date</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          )}

          {/* Session Details Modal */}
          {showDetailsModal && sessionDetails && (
            <Modal
              visible={showDetailsModal}
              animationType="fade"
              transparent
              onRequestClose={() => setShowDetailsModal(false)}
            >
              <View style={styles.detailsOverlay}>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailsHeader}>
                    <Text style={styles.detailsTitle}>Session Details</Text>
                    <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                      <Ionicons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* User Info */}
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsSectionTitle}>User</Text>
                      <Text style={styles.detailsText}>
                        {sessionDetails.userDetails?.name || "N/A"}
                      </Text>
                      <Text style={styles.detailsSubText}>
                        {sessionDetails.userDetails?.email || ""}
                      </Text>
                    </View>

                    {/* Session Info */}
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsSectionTitle}>Session Information</Text>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Date:</Text>
                        <Text style={styles.detailsValue}>
                          {new Date(sessionDetails.sessionDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Time:</Text>
                        <Text style={styles.detailsValue}>{sessionDetails.sessionTime}</Text>
                      </View>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Type:</Text>
                        <Text style={styles.detailsValue}>
                          {sessionDetails.sessionType === "online" ? "Online" : "Offline"}
                        </Text>
                      </View>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Duration:</Text>
                        <Text style={styles.detailsValue}>{sessionDetails.sessionDuration} min</Text>
                      </View>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Status:</Text>
                        <Text
                          style={[
                            styles.detailsValue,
                            { color: getStatusColor(sessionDetails.sessionStatus) },
                          ]}
                        >
                          {sessionDetails.sessionStatus}
                        </Text>
                      </View>
                    </View>

                    {/* Workouts */}
                    {sessionDetails.workouts && sessionDetails.workouts.length > 0 && (
                      <View style={styles.detailsSection}>
                        <Text style={styles.detailsSectionTitle}>Workouts</Text>
                        {sessionDetails.workouts.map((workout: any, index: number) => (
                          <View key={index} style={styles.workoutItem}>
                            <Text style={styles.workoutExercise}>{workout.exercise}</Text>
                            <Text style={styles.workoutDetails}>
                              {workout.sets} sets × {workout.reps} reps
                              {workout.timer && ` • ${workout.timer}s`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Notes */}
                    {sessionDetails.sessionNotes && (
                      <View style={styles.detailsSection}>
                        <Text style={styles.detailsSectionTitle}>Notes</Text>
                        <Text style={styles.detailsText}>{sessionDetails.sessionNotes}</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}

          {loadingDetails && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.secondPrimary} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: height * 0.9,
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    monthNavigation: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    monthNavButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    monthText: {
      fontSize: 18,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    loadingContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedDateContainer: {
      padding: 20,
    },
    selectedDateTitle: {
      fontSize: 16,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: 16,
    },
    sessionCard: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sessionCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sessionUserInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundCardLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    sessionUserText: {
      flex: 1,
    },
    sessionUserName: {
      fontSize: 15,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.text,
      marginBottom: 2,
    },
    sessionTime: {
      fontSize: 13,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
    },
    sessionStatusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    sessionStatusText: {
      fontSize: 11,
      fontFamily: theme.fonts.bold,
      textTransform: "uppercase",
    },
    sessionCardDetails: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 8,
    },
    sessionDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    sessionDetailText: {
      fontSize: 13,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
    },
    sessionPlanName: {
      fontSize: 13,
      fontFamily: theme.fonts.medium,
      color: theme.colors.secondPrimary,
      marginTop: 4,
    },
    noSessionsContainer: {
      alignItems: "center",
      padding: 40,
    },
    noSessionsText: {
      fontSize: 15,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
      marginTop: 12,
    },
    detailsOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    detailsContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      width: "100%",
      maxHeight: "80%",
      padding: 20,
    },
    detailsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailsTitle: {
      fontSize: 20,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    detailsSection: {
      marginBottom: 24,
    },
    detailsSectionTitle: {
      fontSize: 16,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      marginBottom: 12,
    },
    detailsText: {
      fontSize: 15,
      fontFamily: theme.fonts.regular,
      color: theme.colors.text,
      marginBottom: 4,
    },
    detailsSubText: {
      fontSize: 14,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
    },
    detailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    detailsLabel: {
      fontSize: 14,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textMuted,
    },
    detailsValue: {
      fontSize: 14,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.text,
    },
    workoutItem: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundCardLight,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    workoutExercise: {
      fontSize: 15,
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    workoutDetails: {
      fontSize: 13,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textMuted,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyDay: {
      width: 40,
      height: 70,
    },
    dayContainer: {
      width: 40,
      height: 70,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 4,
      borderRadius: 8,
    },
    selectedDay: {
      backgroundColor: theme.colors.secondPrimary + "20",
    },
    dayText: {
      fontSize: 16,
      fontFamily: theme.fonts.regular,
      color: theme.colors.text,
      marginBottom: 2,
    },
    todayText: {
      color: theme.colors.secondPrimary,
      fontFamily: theme.fonts.bold,
    },
    selectedDayText: {
      color: theme.colors.secondPrimary,
      fontFamily: theme.fonts.bold,
    },
    disabledDayText: {
      color: theme.colors.textMuted,
      opacity: 0.4,
    },
    sessionIndicator: {
      flexDirection: "row",
      gap: 2,
      marginTop: 2,
      marginBottom: 2,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    sessionCountBadge: {
      backgroundColor: theme.colors.secondPrimary,
      borderRadius: 8,
      paddingHorizontal: 5,
      paddingVertical: 1,
      minWidth: 18,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    sessionCountText: {
      fontSize: 10,
      fontFamily: theme.fonts.bold,
      color: theme.colors.textWhite,
    },
  });
