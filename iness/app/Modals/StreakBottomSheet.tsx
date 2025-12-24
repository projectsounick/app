import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { LinearGradient } from "expo-linear-gradient";
import theme from "@/app/Theme/globalTheme";

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
      dotColor: theme.colors.secondPrimary,
      dotStyle: { width: 8, height: 8, borderRadius: 4 },
    };
  });

  // 🎉 Confetti setup with theme colors
  const confetti = Array.from({ length: 20 }).map(() => ({
    x: Math.random() * width,
    rotate: new Animated.Value(Math.random() * 360),
    fall: new Animated.Value(-Math.random() * height),
    color: [
      theme.colors.secondPrimary,
      "#BDFF84",
      "#844ACF",
      "#FFD700",
    ][Math.floor(Math.random() * 4)],
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
    <View style={styles.overlay}>
      {/* Confetti */}
      {confetti.map((piece, i) => (
        <Animated.View
          key={i}
          style={[
            styles.confetti,
            {
              width: piece.size,
              height: piece.size,
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
            },
          ]}
        />
      ))}

      <View style={styles.modalContainer}>
        {/* Gradient Header */}
        <LinearGradient
          colors={["#844ACF", "#432569"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Dash Handle */}
          <View style={styles.handle} />

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Streak Icon and Title */}
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={["#9747FF", "#844ACF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Ionicons name="flame" size={44} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.streakTitle}>
              {totalStreak}-Day Streak 🔥
            </Text>
            <Text style={styles.streakSubtitle}>
              {totalStreak && totalStreak !== 0
                ? "You're unstoppable! Keep your streak alive by showing up every day."
                : "Start your streak today!"}
            </Text>
          </View>
        </LinearGradient>

        {/* Calendar Section */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.calendarContainer}>
            <Calendar
              theme={{
                backgroundColor: "#FFFFFF",
                calendarBackground: "#FFFFFF",
                dayTextColor: "#1A1A1A",
                monthTextColor: theme.colors.secondPrimary,
                arrowColor: theme.colors.secondPrimary,
                todayTextColor: theme.colors.secondPrimary,
                textDayFontWeight: "600",
                textMonthFontWeight: "700",
                textDayHeaderFontWeight: "600",
                textDayFontSize: 14,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 12,
                selectedDayBackgroundColor: theme.colors.secondPrimary,
                selectedDayTextColor: "#FFFFFF",
                todayBackgroundColor: `${theme.colors.secondPrimary}20`,
                dotColor: theme.colors.secondPrimary,
                selectedDotColor: "#FFFFFF",
              }}
              markedDates={markedDates}
              markingType="dot"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  confetti: {
    position: "absolute",
    borderRadius: 2,
    opacity: 0.9,
    zIndex: 1,
  },
  modalContainer: {
    height: height * 0.75,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerContent: {
    alignItems: "center",
    marginTop: 8,
    zIndex: 2,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  streakTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
    fontFamily: theme.fonts.heading,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  streakSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginTop: 8,
    fontSize: 15,
    paddingHorizontal: 40,
    lineHeight: 22,
    fontFamily: theme.fonts.body,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
});
