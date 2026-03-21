import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { fetchWrapper } from "@/app/helpers/fetchWrapper";
import { config } from "@/app/shared/config";

const baseUrl = `${config.apiUrl}/api`;

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

function SessionDetails() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");

  useEffect(() => {
    fetchSessionDetails();
  }, []);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchWrapper.get(`${baseUrl}/get-session-details?sessionId=${sessionId}`);
      if (response.success) {
        setSession(response.data);
        setSessionNotes(response.data.sessionNotes || "");
      } else {
        Alert.alert("Error", response.message || "Failed to fetch session details");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch session details");
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (status: "completed" | "cancelled") => {
    Alert.alert(
      `${status === "completed" ? "Complete" : "Cancel"} Session`,
      `Are you sure you want to ${status === "completed" ? "mark this session as completed" : "cancel this session"}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setUpdating(true);
              const response = await fetchWrapper.put(`${baseUrl}/update-session/${sessionId}`, {
                sessionStatus: status,
              });

              if (response.success) {
                Alert.alert("Success", `Session ${status} successfully`, [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert("Error", response.message || "Failed to update session");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to update session");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const saveSessionNotes = async () => {
    try {
      setUpdating(true);
      const response = await fetchWrapper.put(`${baseUrl}/update-session/${sessionId}`, {
        sessionNotes: sessionNotes,
      });

      if (response.success) {
        Alert.alert("Success", "Session notes saved successfully");
        setShowNotesInput(false);
        fetchSessionDetails();
      } else {
        Alert.alert("Error", response.message || "Failed to save notes");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save notes");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>Session not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const planName = session.activePlanDetails?.plan?.planItem?.planName ||
                  session.activePlanDetails?.plan?.planName ||
                  null;
  const serviceName = session.activeServiceDetails?.service?.serviceName ||
                     session.activeServiceDetails?.service?.title ||
                     null;

  const canComplete = session.sessionStatus === "scheduled";
  const canCancel = session.sessionStatus === "scheduled";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            session.sessionStatus === "completed" && styles.statusCompleted,
            session.sessionStatus === "cancelled" && styles.statusCancelled,
            session.sessionStatus === "scheduled" && styles.statusScheduled,
          ]}>
            <Text style={styles.statusText}>{session.sessionStatus?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Main Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color={theme.colors.text} />
            <Text style={styles.cardTitle}>Session Information</Text>
          </View>

          {(planName || serviceName) && (
            <View style={styles.infoRow}>
              <Ionicons name="barbell" size={20} color={theme.colors.textMuted} />
              <Text style={styles.infoLabel}>Plan/Service:</Text>
              <Text style={styles.infoValue}>{planName || serviceName}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(session.sessionDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{session.sessionTime}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="hourglass" size={20} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>{session.sessionDuration} minutes</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name={session.sessionType === "online" ? "videocam" : "location"} size={20} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{session.sessionType?.toUpperCase()}</Text>
          </View>

          {session.sessionAddress && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={theme.colors.textMuted} />
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{session.sessionAddress}</Text>
            </View>
          )}

          {session.trainerDetails && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={theme.colors.textMuted} />
              <Text style={styles.infoLabel}>Trainer:</Text>
              <Text style={styles.infoValue}>{session.trainerDetails.name}</Text>
            </View>
          )}

          {session.userDetails && (
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={20} color={theme.colors.textMuted} />
              <Text style={styles.infoLabel}>Client:</Text>
              <Text style={styles.infoValue}>{session.userDetails.name}</Text>
            </View>
          )}
        </View>

        {/* Workouts */}
        {session.workouts && session.workouts.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness" size={24} color={theme.colors.text} />
              <Text style={styles.cardTitle}>Workout Exercises ({session.workouts.length})</Text>
            </View>

            {session.workouts.map((workout: any, index: number) => (
              <View key={workout._id} style={styles.workoutItem}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutNumber}>#{index + 1}</Text>
                  <Text style={styles.workoutName}>{workout.exercise}</Text>
                </View>
                <View style={styles.workoutStats}>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatLabel}>Sets</Text>
                    <Text style={styles.workoutStatValue}>{workout.sets || 0}</Text>
                  </View>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatLabel}>Reps</Text>
                    <Text style={styles.workoutStatValue}>{workout.reps || 0}</Text>
                  </View>
                  {workout.timer && (
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatLabel}>Timer</Text>
                      <Text style={styles.workoutStatValue}>{workout.timer}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Session Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color={theme.colors.text} />
            <Text style={styles.cardTitle}>Session Notes</Text>
            <TouchableOpacity
              onPress={() => setShowNotesInput(!showNotesInput)}
              style={styles.editButton}
            >
              <Ionicons name={showNotesInput ? "close" : "create"} size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {showNotesInput ? (
            <View>
              <TextInput
                style={styles.notesInput}
                placeholder="Add session notes..."
                placeholderTextColor={theme.colors.textMuted}
                value={sessionNotes}
                onChangeText={setSessionNotes}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={styles.saveNotesButton}
                onPress={saveSessionNotes}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={theme.colors.textWhite} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color={theme.colors.textWhite} />
                    <Text style={styles.saveNotesText}>Save Notes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.notesText}>
              {session.sessionNotes || "No notes added yet"}
            </Text>
          )}
        </View>

        {/* Feedback */}
        {session.sessionFeedback && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="star" size={24} color={theme.colors.text} />
              <Text style={styles.cardTitle}>Client Feedback</Text>
            </View>
            <Text style={styles.feedbackText}>{session.sessionFeedback}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canComplete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => updateSessionStatus("completed")}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color={theme.colors.textWhite} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.textWhite} />
                  <Text style={styles.actionButtonText}>Mark as Completed</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => updateSessionStatus("cancelled")}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color={theme.colors.textWhite} />
              ) : (
                <>
                  <Ionicons name="close-circle" size={24} color={theme.colors.textWhite} />
                  <Text style={styles.actionButtonText}>Cancel Session</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyText: {
      marginTop: 16,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    content: {
      flex: 1,
      padding: 16,
    },
    statusContainer: {
      alignItems: "center",
      marginBottom: 16,
    },
    statusBadge: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.textMuted,
    },
    statusCompleted: {
      backgroundColor: "#4CAF50",
    },
    statusCancelled: {
      backgroundColor: "#F44336",
    },
    statusScheduled: {
      backgroundColor: "#FF9800",
    },
    statusText: {
      fontSize: theme.fontSizes.small,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textWhite,
    },
    card: {
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    cardTitle: {
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      marginLeft: 8,
      flex: 1,
    },
    editButton: {
      padding: 4,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.textMuted,
      marginLeft: 8,
      width: 100,
    },
    infoValue: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      fontWeight: theme.fontWeights.medium as "500",
      flex: 1,
    },
    workoutItem: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    workoutHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    workoutNumber: {
      fontSize: theme.fontSizes.small,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textMuted,
      marginRight: 8,
    },
    workoutName: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
      flex: 1,
    },
    workoutStats: {
      flexDirection: "row",
      gap: 12,
    },
    workoutStat: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
      borderRadius: 8,
      padding: 8,
      alignItems: "center",
    },
    workoutStatLabel: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.textMuted,
      marginBottom: 4,
    },
    workoutStatValue: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.text,
    },
    notesInput: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      minHeight: 100,
      textAlignVertical: "top",
    },
    saveNotesButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.text,
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
    },
    saveNotesText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textWhite,
      marginLeft: 8,
    },
    notesText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      lineHeight: 22,
    },
    feedbackText: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text,
      lineHeight: 22,
    },
    actionsContainer: {
      gap: 12,
      marginBottom: 32,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      padding: 16,
    },
    completeButton: {
      backgroundColor: "#4CAF50",
    },
    cancelButton: {
      backgroundColor: "#F44336",
    },
    actionButtonText: {
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold as "700",
      color: theme.colors.textWhite,
      marginLeft: 8,
    },
  });

export default SessionDetails;
