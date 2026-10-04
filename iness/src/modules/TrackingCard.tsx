import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../Theme/ThemeContext";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Entypo,
} from "@expo/vector-icons";

const TrackingCard = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const shimmerColors = isDark 
    ? ["#1a1a1a", "#2a2a2a", "#1a1a1a"]
    : ["#E1E9EE", "#F2F8FC", "#E1E9EE"];
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Hardcoded values
  const sleep = 5; // hours
  const water = 4; // glasses
  const steps = 6200; // steps

  const items = [
    {
      icon: (
        <MaterialCommunityIcons
          name="weather-night"
          size={20}
          color="#78AFFF"
        />
      ),
      value: sleep,
      goal: 10,
      unit: "h",
      color: "#78AFFF",
    },
    {
      icon: <Entypo name="drink" size={20} color="#00E4FF" />,
      value: water,
      goal: 10,
      unit: "gls",
      color: "#00E4FF",
    },
    {
      icon: <FontAwesome5 name="shoe-prints" size={20} color="#FFD93D" />,
      value: steps,
      goal: 10000,
      unit: "k",
      color: "#FFD93D",
    },
  ];

  return (
    <View
      style={{
        backgroundColor: theme.colors.secondPrimary,
        padding: 16,
        borderRadius: 16,
      }}
    >
      {items.map((item, index) => {
        const progress = Math.min(item.value / item.goal, 1);
        return (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            {item.icon}
            {loading ? (
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  height: 6,
                  borderRadius: 5,
                  flex: 1,
                  marginHorizontal: 8,
                }}
                shimmerColors={shimmerColors}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: theme.colors.textMuted,
                  borderRadius: 5,
                  marginHorizontal: 8,
                }}
              >
                <View
                  style={{
                    width: `${progress * 100}%`,
                    height: 6,
                    backgroundColor: item.color,
                    borderRadius: 5,
                  }}
                />
              </View>
            )}
            {loading ? (
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  width: 40,
                  height: 10,
                  borderRadius: 5,
                }}
                shimmerColors={shimmerColors}
              />
            ) : (
              <Text
                style={{
                  fontSize: theme.fontSizes.small,
                  fontWeight: theme.fontWeights.medium as "500",
                  color: item.color,
                }}
              >
                {item.unit === "k"
                  ? `${Math.floor(item.value / 1000)}k/${item.goal / 1000}k`
                  : `${item.value}${item.unit}/${item.goal}${item.unit}`}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default TrackingCard;
