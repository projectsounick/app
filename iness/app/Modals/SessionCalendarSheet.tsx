import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";

import { Calendar, DateData } from "react-native-calendars";
import {
  AntDesign,
  Entypo,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";

import useGetDataHook from "@/hooks/useFetchHook";
import { sessionService } from "../services/sessionService";
import { Session } from "../interfaces/sessionInterface";
import { useDispatch } from "react-redux";
import { setCalendarSheetOpen } from "@/Slices/componentOpenSlice";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { height } = Dimensions.get("window");

interface SessionCalendarProps {
  isVisible: boolean;
  onClose: () => void;
  setCurrentSession: (session: Session | null) => void;
  currentSession: Session | null;
  setShowFeedbackModal: (value: boolean) => void;
}

function SessionCalendar({
  isVisible,
  onClose,
  setCurrentSession,
  currentSession,
  setShowFeedbackModal,
}: SessionCalendarProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const dispatch = useDispatch();
  const { data: sessionData, loading } = useGetDataHook(
    sessionService.getSessions
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Reset selected date when modal closes
  useEffect(() => {
    if (!isVisible) {
      setSelectedDate(null);
    }
  }, [isVisible]);

  // Filter only active sessions
  const activeSessions = sessionData?.filter(
    (s: any) =>
      s.isActive && s.sessionStatus.toLowerCase().trim() !== "cancelled"
  );

  // Prepare marked dates
  const markedDates: any = {};
  if (activeSessions) {
    activeSessions.forEach((s: any) => {
      const dateString = new Date(s.sessionDate).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      markedDates[dateString] = {
        customStyles: {
          container: { backgroundColor: s.color, borderRadius: 6 },
          text: { color: "#fff", fontWeight: "600" },
        },
      };
    });
  }

  const onDayPress = (day: DateData) => {
    const sessions = activeSessions?.filter((s: any) => {
      const sessionDate = new Date(s.sessionDate).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      return sessionDate === day.dateString;
    });

    if (sessions && sessions.length) setSelectedDate(day.dateString);
  };

  const selectedSessions = activeSessions?.filter((s: any) => {
    const sessionDate = new Date(s.sessionDate).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    return sessionDate === selectedDate;
  });

  const renderSessionCard = (session: any) => {
    const planTitle =
      session?.activeServiceDetails?.service?.title ||
      session?.activePlanDetails?.plan?.title;

    return (
      <View style={styles.card}>
        {planTitle && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="calendar" size={18} color={theme.colors.secondPrimary} />
            </View>
            <Text style={styles.planTitle}>{planTitle}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: session.color || "#9747FF",
                marginRight: 10,
              }}
            />
            <Text style={styles.sessionType}>
              {session.sessionType.toUpperCase()} Session
            </Text>
          </View>
          <View
            style={{
              backgroundColor: session.color ? `${session.color}20` : (isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight),
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={[styles.sessionStatus, { color: session.color || theme.colors.secondPrimary }]}>
              {session.sessionStatus}
            </Text>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <MaterialIcons name="date-range" size={16} color={theme.colors.secondPrimary} />
          </View>
          <Text style={styles.infoText}>
            {new Date(session.sessionDate).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Entypo name="clock" size={16} color={theme.colors.secondPrimary} />
          </View>
          <Text style={styles.infoText}>
            {session.sessionTime} ({session.sessionDuration})
          </Text>
        </View>

        {session.sessionAddress && (
          <View style={styles.infoRow}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "#F3EDFF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <FontAwesome5 name="map-marker-alt" size={14} color={theme.colors.secondPrimary} />
            </View>
            <Text style={styles.infoText}>{session.sessionAddress}</Text>
          </View>
        )}

        {/* Trainer Info */}
        {session.trainer && (
          <View style={styles.trainerRow}>
            {session.trainer.profilePic ? (
              <Image
                source={{ uri: session.trainer.profilePic }}
                style={styles.trainerImage}
              />
            ) : (
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundCardLight,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="person" size={24} color={theme.colors.secondPrimary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.trainerName}>{session.trainer.name}</Text>
              <Text style={styles.trainerEmail}>{session.trainer.email}</Text>
            </View>
          </View>
        )}

        {/* Feedback Button */}
        <TouchableOpacity
          onPress={() => {
            setCurrentSession(session);
            onClose();
            setShowFeedbackModal(true);
          }}
          style={styles.feedbackButton}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.feedbackButtonText}>
            {session.sessionFeedback ? "Edit Feedback" : "Add Feedback"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <TouchableOpacity activeOpacity={1} style={styles.backdrop}>
        <View style={styles.bottomSheetContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            {selectedDate && (
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                style={{
                  marginRight: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AntDesign name="arrowleft" size={18} color={theme.colors.text} />
              </TouchableOpacity>
            )}
            <Text style={styles.modalTitle}>
              {selectedDate ? "Session Details" : "Your Sessions"}
            </Text>
            <TouchableOpacity
              onPress={() => dispatch(setCalendarSheetOpen(false))}
              style={{
                marginLeft: "auto",
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
                justifyContent: "center",
                alignItems: "center",
                ...(isDark ? {} : {
                  shadowColor: theme.colors.black,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }),
              }}
            >
              <Ionicons name="close" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Loader */}
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={theme.colors.secondPrimary} />
              <Text style={{ marginTop: 10, color: theme.colors.textSecondary, fontSize: theme.fontSizes.regularSmall, fontWeight: theme.fontWeights.medium as "500" }}>
                Loading sessions...
              </Text>
            </View>
          )}

          {/* Calendar View */}
          {!loading && !selectedDate && sessionData && (
            <Calendar
              current={new Date().toISOString().slice(0, 10)}
              markingType={"custom"}
              markedDates={markedDates}
              onDayPress={onDayPress}
              theme={{
                todayTextColor: theme.colors.secondPrimary,
                arrowColor: theme.colors.secondPrimary,
                monthTextColor: theme.colors.text,
                textDayFontWeight: "500",
                textMonthFontWeight: "700",
                textDayHeaderFontWeight: "600",
                selectedDayBackgroundColor: theme.colors.secondPrimary,
                selectedDayTextColor: theme.colors.textWhite,
                textDisabledColor: theme.colors.textMuted,
                textSectionTitleColor: theme.colors.text,
                backgroundColor: theme.colors.background,
                calendarBackground: theme.colors.background,
                dayTextColor: theme.colors.text,
              }}
              style={{ marginBottom: 10 }}
            />
          )}

          {/* Session Details */}
          {!loading && selectedDate && selectedSessions && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedSessions.map((session: any) => (
                <View key={session._id}>{renderSessionCard(session)}</View>
              ))}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    maxHeight: height * 0.85,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  planTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  sessionType: { fontSize: theme.fontSizes.regularSmall, fontWeight: theme.fontWeights.bold as "700", color: theme.colors.text },
  sessionStatus: {
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.bold as "700",
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: { fontSize: theme.fontSizes.regularSmall, color: theme.colors.textSecondary, flex: 1, lineHeight: 20 },
  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  trainerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  trainerName: { fontSize: theme.fontSizes.regular, fontWeight: theme.fontWeights.bold as "700", color: theme.colors.text, marginBottom: 2 },
  trainerEmail: { fontSize: theme.fontSizes.regularSmall, color: theme.colors.textSecondary },
  feedbackButton: {
    marginTop: 16,
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackButtonText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.bold as "700",
    fontSize: theme.fontSizes.regular,
  },
});

export default SessionCalendar;
