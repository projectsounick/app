import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import theme from "../Theme/globalTheme";

const FitnessGoalsCard = () => {
  const loading = useSelector((state: RootState) => state.loader.mainLoader);
  const currentDayTrackData = useSelector(
    (state: RootState) => state.track.currentDateTrackData
  );

  // Goals
  const goalSteps = 10000;
  const goalSleep = 10; // hours
  const goalWater = 10; // glasses

  // Progress calculation
  const progressSteps = Math.min(
    ((currentDayTrackData.steps?.steps || 0) / goalSteps) * 100,
    100
  );
  const progressSleep = Math.min(
    ((currentDayTrackData.sleep?.sleepDuration || 0) / goalSleep) * 100,
    100
  );
  const progressWater = Math.min(
    ((currentDayTrackData.water?.waterIntake || 0) / goalWater) * 100,
    100
  );

  // Shimmer setup
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading]);

  const renderShimmer = () => {
    const translateX = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 300],
    });

    return (
      <View
        style={{
          flex: 1,
          height: 6,
          backgroundColor: "#3E2A6A",
          borderRadius: 6,
          marginHorizontal: 6,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "30%",
            backgroundColor: "#6D4DC3",
            opacity: 0.6,
            transform: [{ translateX }],
          }}
        />
      </View>
    );
  };

  const renderProgressBar = (progress: number, color: string) => {
    if (loading) return renderShimmer();

    return (
      <View
        style={{
          flex: 1,
          height: 6,
          backgroundColor: "#3E2A6A",
          borderRadius: 6,
          overflow: "hidden",
          marginHorizontal: 6,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: color,
          }}
        />
      </View>
    );
  };

  return (
    <View
      style={{ padding: 0, marginTop: 14, width: "100%", alignSelf: "center" }}
    >
      {/* Sleep */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
      >
        <Ionicons name="moon" size={16} color="#ADD8E6" style={{ width: 24 }} />
        {renderProgressBar(progressSleep, "#ADD8E6")}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
            width: 50,
            fontFamily: theme.fonts.regular,
            textAlign: "right",
          }}
        >
          {currentDayTrackData.sleep?.sleepDuration || 0}h/{goalSleep}h
        </Text>
      </View>

      {/* Water */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
      >
        <FontAwesome5
          name="glass-whiskey"
          size={14}
          color="#00E5FF"
          style={{ width: 24 }}
        />
        {renderProgressBar(progressWater, "#00E5FF")}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
            width: 50,
            textAlign: "right",
            fontFamily: theme.fonts.regular,
          }}
        >
          {currentDayTrackData.water?.waterIntake || 0}gls/{goalWater}gls
        </Text>
      </View>

      {/* Steps */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <MaterialIcons
          name="directions-walk"
          size={16}
          color="#FFD700"
          style={{ width: 24 }}
        />
        {renderProgressBar(progressSteps, "#FFD700")}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
            width: 50,
            fontFamily: theme.fonts.regular,
            textAlign: "right",
          }}
        >
          {(currentDayTrackData.steps?.steps || 0) / 1000}k/{goalSteps / 1000}k
        </Text>
      </View>

      {/* Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 0,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#4A2A75",
            paddingVertical: 4,
            paddingHorizontal: 16,
            borderRadius: 20,
            borderColor: "#A4FF55",
            borderWidth: 1,
          }}
          onPress={() => router.push("/dashboard/supportchat")}
        >
          <Text
            style={{
              color: "#A4FF55",
              fontSize: 14,
              fontFamily: theme.fonts.regular,
            }}
          >
            💬 Chat with us
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            paddingVertical: 6,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => router.push("/(tabs)/dashboard/track")}
        >
          <Text
            style={{
              color: "#000000",
              fontWeight: "500",
              fontSize: 14,
              fontFamily: theme.fonts.regular,
            }}
          >
            View Tracker
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FitnessGoalsCard;
