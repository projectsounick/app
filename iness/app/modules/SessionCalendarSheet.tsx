import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
const Modal = require("react-native-modal");
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
import FeedbackModal from "../Components/ActivePlans.tsx/SessionFeedbackModal";
import SessionFeedback from "./SessionFeedback";
import { date } from "yup";
import { Session } from "../interfaces/sessionInterface";
import { JSX } from "react/jsx-runtime";

const { height } = Dimensions.get("window");

interface SessionCalendarProps {
  isVisible: boolean;
  onClose: () => void;
  setCurrentSession: (session: Session | null) => void;
  currentSession: Session | null;
  setShowFeedbackModal: (value: boolean) => void;
}

// Replace 'Session' with the actual type/interface for a session in your project
const SessionCalendar = ({
  isVisible,
  onClose,
  setCurrentSession,
  currentSession,
  setShowFeedbackModal,
}: SessionCalendarProps): JSX.Element | null => {
  const { data: sessionData, loading } = useGetDataHook(
    sessionService.getSessions
  );
  console.log(sessionData);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Prepare marked dates
  // Prepare marked dates
  // ✅ Filter only Active sessions once
  const activeSessions = sessionData?.filter((s: any) => {
    return s.isActive && s.sessionStatus.toLowerCase().trim() !== "cancelled";
  });

  // Prepare marked dates only for active sessions
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

  // When a day is pressed → check only active sessions
  const onDayPress = (day: DateData) => {
    const sessions = activeSessions?.filter((s: any) => {
      const sessionDate = new Date(s.sessionDate).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      return sessionDate === day.dateString;
    });

    if (sessions && sessions.length) {
      setSelectedDate(day.dateString);
    }
  };

  // Selected sessions for details → only from activeSessions
  const selectedSessions = activeSessions?.filter((s: any) => {
    const sessionDate = new Date(s.sessionDate).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    return sessionDate === selectedDate;
  });

  const renderSessionCard = (session: any) => {
    console.log(session);

    let planTitle =
      session?.activeServiceDetails?.service?.title ||
      session?.activePlanDetails?.plan?.title;

    return (
      <View
        style={{
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
        }}
      >
        {planTitle && planTitle && (
          <View
            style={{
              width: "100%",

              alignSelf: "flex-start",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                textAlign: "center",
                fontWeight: "800",
                color: "#444",
              }}
            >
              {planTitle}
            </Text>
          </View>
        )}
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: session.color,
                marginRight: 10,
              }}
            />
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#333" }}>
              {session.sessionType.toUpperCase()} Session
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: session.color,
              textTransform: "uppercase",
            }}
          >
            {session.sessionStatus}
          </Text>
        </View>

        {/* Date & Time */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <MaterialIcons name="date-range" size={20} color="#6c5ce7" />
          <Text style={{ marginLeft: 8, fontSize: 14, color: "#555" }}>
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Entypo name="clock" size={20} color="#6c5ce7" />
          <Text style={{ marginLeft: 8, fontSize: 14, color: "#555" }}>
            {session.sessionTime} ({session.sessionDuration})
          </Text>
        </View>

        {session.sessionAddress && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <FontAwesome5 name="map-marker-alt" size={20} color="#6c5ce7" />
            <Text style={{ marginLeft: 8, fontSize: 14, color: "#555" }}>
              {session.sessionAddress}
            </Text>
          </View>
        )}

        {/* Trainer Info */}
        {session.trainer && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: "#eee",
            }}
          >
            {session.trainer.profilePic && (
              <Image
                source={{ uri: session.trainer.profilePic }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 12,
                }}
              />
            )}
            <View>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
                {session.trainer.name}
              </Text>
              <Text style={{ fontSize: 13, color: "#777" }}>
                {session.trainer.email}
              </Text>
            </View>
          </View>
        )}

        {/* Workouts */}
        {session.workouts?.length > 0 && (
          <View
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: "#eee",
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 15,
                color: "#333",
                marginBottom: 6,
              }}
            >
              Workouts
            </Text>

            {session.workouts.map((w: any, idx: number) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  padding: 10,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 12,
                }}
              >
                {/* Dumbbell Icon */}
                <FontAwesome5 name="dumbbell" size={18} color="#6c5ce7" />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  {/* Exercise Name */}
                  <Text
                    style={{ fontSize: 15, color: "#333", fontWeight: "700" }}
                  >
                    {w.exercise || "Unnamed Exercise"}
                  </Text>

                  {/* Reps / Sets / Timer */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {w.reps !== undefined && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 15,
                        }}
                      >
                        <MaterialIcons
                          name="repeat"
                          size={16}
                          color="#fd79a8"
                        />
                        <Text
                          style={{ marginLeft: 4, color: "#555", fontSize: 13 }}
                        >
                          {w.reps} {w.reps === 1 ? "rep" : "reps"}
                        </Text>
                      </View>
                    )}

                    {w.sets !== undefined && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 15,
                        }}
                      >
                        <FontAwesome5
                          name="layer-group"
                          size={16}
                          color="#00b894"
                        />
                        <Text
                          style={{ marginLeft: 4, color: "#555", fontSize: 13 }}
                        >
                          {w.sets} {w.sets === 1 ? "set" : "sets"}
                        </Text>
                      </View>
                    )}

                    {w.timer && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 15,
                        }}
                      >
                        <Entypo name="time-slot" size={16} color="#6c5ce7" />
                        <Text
                          style={{ marginLeft: 4, color: "#555", fontSize: 13 }}
                        >
                          {w.timer}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Feedback */}
        {session.sessionFeedback && (
          <View
            style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: "#f0f0f0",
              borderRadius: 12,
            }}
          >
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>
              Your Feedback:
            </Text>
            <Text style={{ color: "#555" }}>{session.sessionFeedback}</Text>
          </View>
        )}

        {/* Feedback Button */}
        <TouchableOpacity
          onPress={() => {
            setCurrentSession(session);
            onClose();
            setShowFeedbackModal(true);
          }}
          style={{
            marginTop: 12,
            backgroundColor: "#6c5ce7",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            {session.sessionFeedback ? "Edit Feedback" : "Add Feedback"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            height: height * 0.5,
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            {selectedDate && (
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                style={{ marginRight: 16 }}
              >
                <AntDesign name="arrowleft" size={24} color="#333" />
              </TouchableOpacity>
            )}
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
              {selectedDate ? "Session Details" : "Your Sessions"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{ marginLeft: "auto", padding: 6 }}
            >
              <Icon name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Loader */}
          {loading && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
      </Modal>
    </>
  );
};

export default SessionCalendar;
