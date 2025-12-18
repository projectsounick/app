import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../Theme/globalTheme";

interface SessionCardRowProps {
  selectedSession: any;
  totalSessions: number;
}

const SessionCardRow: React.FC<SessionCardRowProps> = ({
  selectedSession,
  totalSessions,
}) => {

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

const Card: React.FC<CardProps> = ({ icon, title, value, suffix }: any) => {
  const isLongValue = typeof value === "number" && value > 99;
  
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        flex: 1,
        minHeight: 75,
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
          size={14}
          color="#6A1B9A"
          style={{ marginRight: 4 }}
        />
        <Text
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: "#444",
            fontFamily: theme.fonts.bold,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* Value */}
      <Text
        style={{
          fontSize: isLongValue ? 14 : 16,
          fontWeight: "bold",
          color: "#6A1B9A",
          fontFamily: theme.fonts.medium,
        }}
        numberOfLines={1}
      >
        {value}{" "}
        {suffix && <Text style={{ fontSize: 10, color: "#999" }}>{suffix}</Text>}
      </Text>
    </View>
  );
};

export default SessionCardRow;
