import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Session } from "@/app/interfaces/sessionInterface";
import Icon from "react-native-vector-icons/Feather";
import theme from "@/app/Theme/globalTheme";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDayLabel = (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return weekdays[date.getDay()] || "";
};

const getDayNumber = (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.getDate();
};

const isToday = (dateStr?: string) => {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
};

const getMonthName = (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleString("default", { month: "long", year: "numeric" });
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

  const [currentMonth, setCurrentMonth] = useState(() =>
    getMonthName(selectedSession?.sessionDate)
  );

  const days = sessions
    .filter((s) => !!s.sessionDate)
    .map((s) => ({
      day: getDayNumber(s.sessionDate),
      label: getDayLabel(s.sessionDate),
      fullDate: s.sessionDate!,
      sessionStatus: s.sessionStatus,
    }));

  const itemWidth = 43;
  const spacing = 6;

  useEffect(() => {
    if (!scrollViewRef.current || days.length === 0) return;

    const todayIndex = days.findIndex((d) => isToday(d.fullDate));
    const fallbackIndex =
      days.findIndex((d) => new Date(d.fullDate) > new Date()) ||
      days.length - 1;

    const targetIndex = todayIndex >= 0 ? todayIndex : fallbackIndex;

    scrollViewRef.current.scrollTo({
      x: targetIndex * (itemWidth + spacing),
      animated: true,
    });

    const session = sessions.find(
      (s) =>
        !!s.sessionDate &&
        getDayNumber(s.sessionDate) ===
          getDayNumber(days[targetIndex]?.fullDate)
    );

    if (session) {
      setSelectedSession(session);
      setSelectedDay(getDayNumber(session.sessionDate));
      setCurrentMonth(getMonthName(session.sessionDate));
    }
  }, [sessions]);

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    const session = sessions.find(
      (s) => !!s.sessionDate && getDayNumber(s.sessionDate) === day
    );
    if (session) {
      setSelectedSession(session);
      setCurrentMonth(getMonthName(session.sessionDate));
    }
  };

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Month Display */}

      {/* Days Scroll */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Left Arrow */}
        <TouchableOpacity style={{ paddingRight: 8 }}>
          <Icon name="chevron-left" size={30} color="#BDFF84" />
        </TouchableOpacity>

        {/* Scroll Container */}
        <View
          style={{
            flex: 1,

            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 2,
              justifyContent: "flex-start", // aligns items to start
            }}
          >
            {days.map((item, index) => {
              const isSelected = item.day === selectedDay;
              const isScheduled = item.sessionStatus === "scheduled";
              const isCompleted = item.sessionStatus === "completed";

              let backgroundColor = "transparent";
              let borderColor = "#fff";
              let textColor = "#fff";
              let subTextColor = "#ccc";

              if (isScheduled) {
                backgroundColor = "orange";
                borderColor = "orange";
                textColor = "#000";
                subTextColor = "#000";
              } else if (isSelected) {
                backgroundColor = "#C6FF00";
                borderColor = "#C6FF00";
                textColor = "#000";
                subTextColor = "#000";
              } else if (isCompleted) {
                borderColor = "#C6FF00";
                textColor = "#C6FF00";
              }

              return (
                <TouchableOpacity
                  key={item.fullDate}
                  onPress={() => handleDayPress(item.day)}
                  style={{
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    width: itemWidth,
                    marginHorizontal: spacing / 2,
                    borderRadius: 6,

                    height: 78,
                    backgroundColor,
                    borderWidth: isSelected || isScheduled ? 0 : 1,
                    borderColor,
                  }}
                >
                  {/* Dot placeholder */}
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 6,
                      backgroundColor: isSelected ? "#000" : "transparent", // show dot only if selected
                      marginBottom: 4,
                    }}
                  />

                  <Text
                    style={{
                      color: textColor,
                      fontFamily: theme.fonts.medium,
                      fontSize: 16,
                    }}
                  >
                    {item.day}
                  </Text>

                  <Text
                    style={{
                      color: subTextColor,
                      fontSize: 12,
                      fontFamily: theme.fonts.medium,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      color: subTextColor,
                      fontSize: 12,
                      marginBottom: 4,
                      fontFamily: theme.fonts.medium,
                    }}
                  >
                    (
                    {new Date(item.fullDate).toLocaleString("default", {
                      month: "short",
                    })}
                    )
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Arrow */}
        <TouchableOpacity style={{ paddingLeft: 8 }}>
          <Icon name="chevron-right" size={30} color="#BDFF84" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
