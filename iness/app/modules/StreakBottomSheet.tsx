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
import { LinearGradient } from "expo-linear-gradient";
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
    color: ["#FF3B3B", "#FF9E00", "#FFD700"][Math.floor(Math.random() * 3)],
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

      <LinearGradient
        colors={["#2C1453", "#1C0E33"]}
        style={{
          height: height * 0.7,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          padding: 20,
          overflow: "hidden",
        }}
      >
        {/* Dash Handle */}
        <View
          style={{
            width: 45,
            height: 5,
            backgroundColor: "rgba(255,255,255,0.4)",
            borderRadius: 3,
            alignSelf: "center",
            marginTop: 4,
            marginBottom: 10,
          }}
        />

        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: 6,
          }}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 20, zIndex: 2 }}>
          <Ionicons name="flame" size={64} color="#FF3B3B" />
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#fff",
              marginTop: 10,
            }}
          >
            {totalStreak}-Day Streak 🔥
          </Text>
          <Text
            style={{
              color: "#BFAAFF",
              textAlign: "center",
              marginTop: 6,
              fontSize: 14,
              paddingHorizontal: 40,
            }}
          >
            {totalStreak && totalStreak !== 0
              ? "You’re unstoppable! Keep your streak alive by showing up every day."
              : "Start your streak today!"}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            marginTop: 20,
            paddingBottom: 40,
            zIndex: 2,
          }}
        >
          <Calendar
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              dayTextColor: "#fff",
              monthTextColor: "#fff",
              arrowColor: "#FF9E00",
              todayTextColor: "#FFFA67",
              textDayFontWeight: "600",
            }}
            markedDates={markedDates}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
