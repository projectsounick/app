import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const { height, width } = Dimensions.get("window");

export default function StreaksBottomSheet({
  onClose,
}: {
  onClose: () => void;
}) {
  // Redux store
  const streakData = useSelector((state: RootState) => state.streak.streakData);
  const totalStreak = useSelector(
    (state: RootState) => state.streak.totalStreak
  );

  // Transform streak dates for Calendar (circle marking)
  const markedDates: {
    [key: string]: { marked: boolean; dotColor: string; dotStyle?: any };
  } = {};
  streakData?.streaks?.forEach((dateStr: any) => {
    const dateKey = dateStr.split("T")[0]; // "YYYY-MM-DD"
    markedDates[dateKey] = {
      marked: true,
      dotColor: "#FF3B3B",
      dotStyle: { width: 8, height: 8, borderRadius: 4 },
    };
  });

  // 🎉 Confetti setup
  const confetti = Array.from({ length: 20 }).map(() => ({
    x: Math.random() * width,
    rotate: new Animated.Value(Math.random() * 360),
    fall: new Animated.Value(-Math.random() * height),
    color: ["#FF3B3B", "#FF9E00", "#FFD700", "#67C694"][
      Math.floor(Math.random() * 4)
    ],
    size: Math.random() * 10 + 6,
    delay: Math.random() * 1000,
  }));

  useEffect(() => {
    confetti.forEach((piece) => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(piece.fall, {
            toValue: height + 50,
            duration: 4000 + Math.random() * 2000,
            delay: piece.delay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotate, {
            toValue: 360,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      {/* Confetti */}
      {confetti.map((piece, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: piece.size,
            height: piece.size,
            borderRadius: 2,
            backgroundColor: piece.color,
            transform: [
              { translateX: piece.x },
              { translateY: piece.fall },
              {
                rotate: piece.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
            opacity: 0.9,
            zIndex: 1,
          }}
        />
      ))}

      <View
        style={{
          height: height * 0.7,
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 30,
          overflow: "hidden",
        }}
      >
        {/* Dash Handle */}
        <View
          style={{
            width: 50,
            height: 5,
            backgroundColor: "#ccc",
            borderRadius: 3,
            alignSelf: "center",
            marginBottom: 20,
          }}
        />

        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            backgroundColor: "#F0F0F0",
            borderRadius: 16,
            width: 32,
            height: 32,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <Ionicons name="close" size={20} color="#000" />
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 10, zIndex: 2 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#FFEBEE",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="flame" size={40} color="#FF3B3B" />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#000",
              marginTop: 8,
            }}
          >
            {totalStreak}-Day Streak 🔥
          </Text>
          <Text
            style={{
              color: "#666",
              textAlign: "center",
              marginTop: 8,
              fontSize: 15,
              paddingHorizontal: 40,
              lineHeight: 22,
            }}
          >
            {totalStreak && totalStreak !== 0
              ? "You're unstoppable! Keep your streak alive by showing up every day."
              : "Start your streak today!"}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            marginTop: 20,
            paddingBottom: 20,
            zIndex: 2,
          }}
        >
          <Calendar
            theme={{
              backgroundColor: "#FFFFFF",
              calendarBackground: "#FFFFFF",
              dayTextColor: "#000",
              monthTextColor: "#000",
              arrowColor: "#9747FF",
              todayTextColor: "#67C694",
              textDayFontWeight: "600",
              textMonthFontWeight: "700",
              textDayHeaderFontWeight: "600",
              selectedDayBackgroundColor: "#9747FF",
              selectedDayTextColor: "#FFFFFF",
            }}
            markedDates={markedDates}
          />
        </ScrollView>
      </View>
    </View>
  );
}
