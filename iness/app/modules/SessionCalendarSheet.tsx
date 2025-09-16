import React, { useState } from "react";
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
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  AntDesign,
  Entypo,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";

import useGetDataHook from "@/hooks/useFetchHook";
import { sessionService } from "../services/sessionService";
import { Session } from "../interfaces/sessionInterface";

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
  const { data: sessionData, loading } = useGetDataHook(
    sessionService.getSessions
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
        {planTitle && <Text style={styles.planTitle}>{planTitle}</Text>}

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.dot, { backgroundColor: session.color }]} />
            <Text style={styles.sessionType}>
              {session.sessionType.toUpperCase()} Session
            </Text>
          </View>
          <Text style={[styles.sessionStatus, { color: session.color }]}>
            {session.sessionStatus}
          </Text>
        </View>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <MaterialIcons name="date-range" size={20} color="#6c5ce7" />
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
          <Entypo name="clock" size={20} color="#6c5ce7" />
          <Text style={styles.infoText}>
            {session.sessionTime} ({session.sessionDuration})
          </Text>
        </View>

        {session.sessionAddress && (
          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#6c5ce7" />
            <Text style={styles.infoText}>{session.sessionAddress}</Text>
          </View>
        )}

        {/* Trainer Info */}
        {session.trainer && (
          <View style={styles.trainerRow}>
            {session.trainer.profilePic && (
              <Image
                source={{ uri: session.trainer.profilePic }}
                style={styles.trainerImage}
              />
            )}
            <View>
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
          <Text style={styles.feedbackButtonText}>
            {session.sessionFeedback ? "Edit Feedback" : "Add Feedback"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      >
        <View style={styles.bottomSheetContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            {selectedDate && (
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                style={{ marginRight: 16 }}
              >
                <AntDesign name="arrowleft" size={24} color="#333" />
              </TouchableOpacity>
            )}
            <Text style={styles.modalTitle}>
              {selectedDate ? "Session Details" : "Your Sessions"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                marginLeft: "auto",
                padding: 6,
                backgroundColor: "#eee", // circular background color
                borderRadius: 20, // make it circular
                width: 36,
                height: 36,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Loader */}
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#6c5ce7" />
              <Text style={{ marginTop: 10, color: "#555" }}>
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
                todayTextColor: "#6c5ce7",
                arrowColor: "#6c5ce7",
                monthTextColor: "#333",
                textDayFontWeight: "500",
                textMonthFontWeight: "600",
                textDayHeaderFontWeight: "600",
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    maxHeight: height * 0.6,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  planTitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "800",
    color: "#444",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  sessionType: { fontSize: 14, fontWeight: "700", color: "#333" },
  sessionStatus: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoText: { marginLeft: 8, fontSize: 14, color: "#555" },
  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  trainerImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  trainerName: { fontSize: 16, fontWeight: "600", color: "#333" },
  trainerEmail: { fontSize: 13, color: "#777" },
  feedbackButton: {
    marginTop: 12,
    backgroundColor: "#6c5ce7",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  feedbackButtonText: { color: "#fff", fontWeight: "600" },
});

export default SessionCalendar;
