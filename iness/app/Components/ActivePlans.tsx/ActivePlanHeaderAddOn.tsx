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
     
    }
  }, [sessions]);

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    const session = sessions.find(
      (s) => !!s.sessionDate && getDayNumber(s.sessionDate) === day
    );
    if (session) {
      setSelectedSession(session);

    }
  };

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
 
      }}
    >
      {/* Days Scroll */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Left Arrow */}
        <TouchableOpacity style={{ paddingRight: 8 }}>
          <Icon name="chevron-left" size={30} color="#000000" />
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
              justifyContent: "flex-start",
            }}
          >
            {days.map((item) => {
              const isSelected = item.day === selectedDay;
              const isScheduled =
                (item.sessionStatus || "").toLowerCase() === "scheduled";
              const isCompleted =
                (item.sessionStatus || "").toLowerCase() === "completed";
              const today =
                new Date(item.fullDate).toDateString() ===
                new Date().toDateString();

              let backgroundColor = "#FFFFFF";
              let borderColor = "#E8E8E8";
              let textColor = "#111";
              let subTextColor = "#666";
              let borderWidth = 1;

              if (isScheduled) {
                backgroundColor = "#FFFFFF";
                borderColor = "#E8E8E8";
                textColor = "#111";
                subTextColor = "#666";
              } else if (isSelected) {
                backgroundColor = "#FFFFFF";
                borderColor = "#9747FF";
                borderWidth = 2.5;
                textColor = "#111";
                subTextColor = "#666";
              } else if (isCompleted) {
                backgroundColor = "#FFFFFF";
                borderColor = "#E8E8E8";
                textColor = "#111";
                subTextColor = "#666";
              }

              return (
                <TouchableOpacity
                  key={item.fullDate}
                  onPress={() => handleDayPress(item.day)}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: itemWidth,
                    marginHorizontal: spacing / 2,
                    borderRadius: 12,
                    height: 60,
                    backgroundColor,
                    borderWidth,
                    borderColor,
                    shadowColor: isSelected ? "#9747FF" : "rgba(0,0,0,0.05)",
                    shadowOffset: { width: 0, height: isSelected ? 4 : 1 },
                    shadowOpacity: isSelected ? 0.2 : 0.06,
                    shadowRadius: isSelected ? 10 : 3,
                    elevation: isSelected ? 5 : 1,
                    transform: [{ scale: isSelected ? 1.03 : 1 }],
                    paddingVertical: 8,
                  }}
                  activeOpacity={0.8}
                >
                    {today ? (
                      <View
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: theme.colors.success,
                        }}
                      />
                    ) : null}
                  <Text
                    style={{
                      color: textColor,
                      fontFamily: theme.fonts.medium,
                      fontSize: theme.fontSizes.regular,
                      marginBottom: 2,
                    }}
                  >
                    {item.day}
                  </Text>

                  <Text
                    style={{
                      color: subTextColor,
                      fontSize: theme.fontSizes.small,
                      fontFamily: theme.fonts.medium,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      color: subTextColor,
                      fontSize: theme.fontSizes.small,
                      fontFamily: theme.fonts.medium,
                    }}
                  >
                    {new Date(item.fullDate).toLocaleString("default", {
                      month: "short",
                    })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Arrow */}
        <TouchableOpacity style={{ paddingLeft: 8 }}>
          <Icon name="chevron-right" size={30} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
