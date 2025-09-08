import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SessionCardRowProps {
  selectedSession: any;
  totalSessions: number;
}

const SessionCardRow: React.FC<SessionCardRowProps> = ({
  selectedSession,
  totalSessions,
}) => {
  console.log(selectedSession);

  const activePlan =
    selectedSession?.activePlanDetails || selectedSession?.activeServiceDetails;

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
      {/* First Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Card
          icon="calendar-check"
          title="Total Sessions"
          value={activePlan?.totalSessions ?? "--"}
        />
        <Card
          icon="clock-outline"
          title="Session Time"
          value={selectedSession?.sessionDuration ?? "--"}
          suffix="mins"
        />
      </View>

      {/* Second Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Card
          icon="timer-sand"
          title="Remaining Sessions"
          value={activePlan?.remainingSessions ?? "--"}
        />
        <Card
          icon="progress-check"
          title="Completed/Progress"
          value={totalSessions}
        />
      </View>
    </View>
  );
};

interface CardProps {
  icon: string;
  title: string;
  value: string | number;
  suffix?: string;
}

const Card: React.FC<CardProps> = ({ icon, title, value, suffix }: any) => (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 12,
      flex: 1,
      height: 80,
      justifyContent: "center",
      borderWidth: 1.2,
      borderColor: "#E0E0E0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      marginHorizontal: 4,
    }}
  >
    {/* Headline with Icon */}
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color="#6A1B9A"
        style={{ marginRight: 4 }}
      />
      <Text style={{ fontSize: 12, fontWeight: "500", color: "#444" }}>
        {title}
      </Text>
    </View>

    {/* Value */}
    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#6A1B9A" }}>
      {value}{" "}
      {suffix && <Text style={{ fontSize: 12, color: "#999" }}>{suffix}</Text>}
    </Text>
  </View>
);

export default SessionCardRow;
