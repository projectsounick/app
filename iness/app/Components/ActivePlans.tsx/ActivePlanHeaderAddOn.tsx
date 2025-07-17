import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Session } from "@/app/interfaces/sessionInterface";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDayLabel = (dateStr: string) => weekdays[new Date(dateStr).getDay()];
const getDayNumber = (dateStr: string) => new Date(dateStr).getDate();
const isToday = (dateStr: string) => {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
};

interface Props {
  sessions: Session[];
  selectedSession: Session | null;
  setSelectedSession: (session: Session) => void;
}

export default function DateBar({
  sessions = [],
  selectedSession,
  setSelectedSession,
}: Props) {
  const scrollViewRef = useRef<ScrollView>(null);

  const [selectedDay, setSelectedDay] = useState(() =>
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

  const itemWidth = 60; // approximate width of each day box
  const spacing = 6; // horizontal margin

  useEffect(() => {
    if (!scrollViewRef.current || days.length === 0) return;

    const todayIndex = days.findIndex((d) => isToday(d.fullDate));
    const fallbackIndex =
      days.findIndex((d) => new Date(d.fullDate) > new Date()) ||
      days.length - 1;

    const targetIndex = todayIndex >= 0 ? todayIndex : fallbackIndex;

    // Scroll to the target date
    scrollViewRef.current.scrollTo({
      x: targetIndex * (itemWidth + spacing),
      animated: true,
    });

    const session = sessions.find(
      (s) =>
        getDayNumber(s.sessionDate) === getDayNumber(days[targetIndex].fullDate)
    );
    if (session) {
      setSelectedSession(session);
      setSelectedDay(getDayNumber(session.sessionDate));
    }
  }, [sessions]);

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
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {days.map((item, index) => {
          const isSelected = item.day === selectedDay;
          return (
            <TouchableOpacity
              key={item.fullDate}
              onPress={() => handleDayPress(item.day)}
              style={{
                alignItems: "center",
                paddingVertical: 8,
                width: itemWidth,
                marginHorizontal: spacing / 2,
                borderRadius: 10,
                backgroundColor: isSelected ? "#C6FF00" : "transparent",
                borderWidth: isSelected ? 0 : 1,
                borderColor: "#fff",
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
                style={{
                  color: isSelected ? "#000" : "#ccc",
                  fontSize: 12,
                }}
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
