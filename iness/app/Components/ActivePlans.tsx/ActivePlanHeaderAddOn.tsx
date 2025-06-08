import { Session } from "@/app/interfaces/sessionInterface";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Get label and day from ISO date
const getDayLabel = (dateStr: string) => weekdays[new Date(dateStr).getDay()];
const getDayNumber = (dateStr: string) => new Date(dateStr).getDate();
interface props {
  sessions: Session[];
  selectedSession: Session | null;
  setSelectedSession: any;
}
export default function DateBar({
  sessions = [],
  selectedSession,
  setSelectedSession,
}: props) {
  const [selectedDay, setSelectedDay] = useState(
    getDayNumber(
      selectedSession?.sessionDate ||
        sessions[0]?.sessionDate ||
        new Date().toISOString()
    )
  );

  const days = sessions.map((s) => ({
    day: getDayNumber(s.sessionDate),
    label: getDayLabel(s.sessionDate),
    fullDate: s.sessionDate,
  }));

  const getOpacity = (index: number) => {
    const center = Math.floor(days.length / 2);
    const distance = Math.abs(index - center);
    return 1 - distance * 0.15;
  };

  const currentSelectedSession = sessions.find(
    (s) => getDayNumber(s.sessionDate) === selectedDay
  );

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    const session = sessions.find((s) => getDayNumber(s.sessionDate) === day);
    if (session) {
      setSelectedSession(session);
    }
  };

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        paddingHorizontal: 10,
        marginTop: 10,
      }}
    >
      {/* Scrollable Dates */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {days.map((item, index) => {
          const isSelected = item.day === selectedDay;
          const opacity = getOpacity(index);
          return (
            <TouchableOpacity
              key={item.fullDate}
              onPress={() => handleDayPress(item.day)}
              style={{
                alignItems: "center",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: isSelected ? "#C6FF00" : "transparent",
                borderWidth: isSelected ? 0 : 1,
                borderColor: "#fff",
                opacity,
                marginHorizontal: 3,
              }}
            >
              <Text
                style={{
                  color: isSelected ? "#000" : "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                {item.day}
              </Text>
              <Text
                style={{ color: isSelected ? "#000" : "#ccc", fontSize: 12 }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
