import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  Animated,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import NormalHeader from "@/app/modules/NormalHeader";

import theme from "@/app/Theme/globalTheme";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF", // white background
  backgroundGradientTo: "#FFFFFF", // white background
  color: (opacity = 1) => `rgba(108, 27, 155, ${opacity})`,
  labelColor: () => "#333",
  strokeWidth: 2,
  propsForDots: {
    r: "3",
    strokeWidth: "1",
    stroke: theme.colors.secondPriamy,
  },
};

const tabNames = ["Sleep", "Steps", "Water"] as const;
type TabType = (typeof tabNames)[number];

interface TrackingData {
  steps: { steps: number; date: string; userId: string; _id: string } | null;
  sleep: {
    sleepDuration: number;
    date: string;
    userId: string;
    _id: string;
  } | null;
  water: {
    waterIntake: number;
    date: string;
    userId: string;
    _id: string;
  } | null;
}

interface ChartPoint {
  date: string;
  value: number;
}

export default function TrackingGraphPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>("Sleep");
  const [monthOffset, setMonthOffset] = useState(0);
  const currentMonth = dayjs().add(monthOffset, "month");

  const totalTrackData = useSelector(
    (state: RootState) => state.track.totalTrackData as TrackingData[]
  );

  const { sleepData, stepsData, waterData } = useMemo(() => {
    const sleepData: ChartPoint[] = [];
    const stepsData: ChartPoint[] = [];
    const waterData: ChartPoint[] = [];

    totalTrackData.forEach((entry) => {
      if (entry.sleep?.date && entry.sleep.sleepDuration != null) {
        sleepData.push({
          date: entry.sleep.date,
          value: entry.sleep.sleepDuration,
        });
      }
      if (entry.steps?.date && entry.steps.steps != null) {
        stepsData.push({ date: entry.steps.date, value: entry.steps.steps });
      }
      if (entry.water?.date && entry.water.waterIntake != null) {
        waterData.push({
          date: entry.water.date,
          value: entry.water.waterIntake,
        });
      }
    });

    return { sleepData, stepsData, waterData };
  }, [totalTrackData]);

  const filterMonthData = (dataArray: ChartPoint[]): ChartPoint[] =>
    dataArray
      .filter((d) => dayjs(d.date).isSame(currentMonth, "month"))
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

  const getGraphData = () => {
    let dataset: ChartPoint[] = [];

    if (selectedTab === "Sleep") dataset = filterMonthData(sleepData);
    else if (selectedTab === "Steps") dataset = filterMonthData(stepsData);
    else if (selectedTab === "Water") dataset = filterMonthData(waterData);

    if (dataset.length === 0) {
      return {
        labels: ["No data"],
        datasets: [{ data: [0] }],
      };
    }

    const labels = dataset.map((d) => dayjs(d.date).format("D"));
    const values = dataset.map((d) => d.value);

    return {
      labels,
      datasets: [{ data: values }],
    };
  };

  const getSelectedData = () => {
    if (selectedTab === "Sleep") return filterMonthData(sleepData);
    if (selectedTab === "Steps") return filterMonthData(stepsData);
    return filterMonthData(waterData);
  };
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [selectedTab, monthOffset]);
  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpg")} // Replace with your image
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingLeft: 20, paddingTop: 20 }}>
          <NormalHeader screenName="Tracking Graphs" />
        </View>

        <View style={{ padding: 16 }}>
          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {tabNames.map((tab) => {
              const isSelected = selectedTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    borderBottomWidth: 2,
                    borderBottomColor: isSelected ? "#6C1B9B" : "transparent",
                    transform: [{ scale: isSelected ? 1.05 : 1 }],
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#6C1B9B" : theme.colors.normal, // lighter when unselected
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Month Switcher */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setMonthOffset((prev) => prev - 1)}
            >
              <Ionicons name="chevron-back-outline" size={24} color="#6C1B9B" />
            </TouchableOpacity>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginHorizontal: 16 }}
            >
              {currentMonth.format("MMMM YYYY")}
            </Text>
            <TouchableOpacity
              onPress={() => setMonthOffset((prev) => prev + 1)}
            >
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="#6C1B9B"
              />
            </TouchableOpacity>
          </View>

          {/* Chart with Gradient and Border */}
          <View
            style={{
              borderWidth: 1,
              backgroundColor: theme.colors.text,
              borderColor: theme.colors.secondPrimary,
              borderRadius: 16,
              padding: 10,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              <LineChart
                data={getGraphData()}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                withShadow={false}
                style={{ borderRadius: 16 }}
              />
            </Animated.View>
          </View>

          {/* Title above cards */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 16,
              color: theme.colors.dark,
              textAlign: "center",
            }}
          >
            Here are your {selectedTab.toLowerCase()} tracking records
          </Text>
          {getSelectedData().length === 0 && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#6C1B9B",
                  marginTop: 8,
                  fontWeight: "bold",
                }}
              >
                No data available for this date
              </Text>
            </Animated.View>
          )}
          {getSelectedData().length > 0 ? (
            <View style={{ maxHeight: 300 }}>
              <ScrollView>
                {getSelectedData().map((item, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: theme.colors.cardLight,
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 10,
                      borderColor: theme.colors.cardLight,
                      borderWidth: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name={
                          selectedTab === "Sleep"
                            ? "moon"
                            : selectedTab === "Steps"
                            ? "walk"
                            : "water"
                        }
                        size={20}
                        color="#6C1B9B"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#6C1B9B", fontWeight: "bold" }}>
                        {dayjs(item.date).format("MMM D, YYYY")}
                      </Text>
                    </View>

                    <Text style={{ fontSize: 16, fontWeight: "600" }}>
                      {selectedTab === "Sleep"
                        ? `${item.value} hrs`
                        : selectedTab === "Steps"
                        ? `${item.value} steps`
                        : `${item.value} ml`}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
          {/* Scrollable Cards */}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
