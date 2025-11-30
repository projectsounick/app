import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  Animated,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { trackService } from "@/app/services/track.service";
import {
  setCurrentDateTrackData,
  setTotalTrackData,
} from "@/Slices/trackSlice";
import { ActivityIndicator } from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  color: (opacity = 1) => `rgba(151, 71, 255, ${opacity})`,
  labelColor: () => "#333",
  strokeWidth: 3,
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#9747FF",
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
  const normalizeDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-CA");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const totalTrackData = useSelector(
    (state: RootState) => state.track.totalTrackData as TrackingData[]
  );
  // ✅ Fetch tracking data
  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const formatDate = (d: Date) => d.toLocaleDateString("en-CA");

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = formatDate(startOfMonth);
      const endDate = formatDate(today);

      const [stepsRes, sleepRes, waterRes] = await Promise.all([
        trackService.getTrackingData("walk", startDate, endDate),
        trackService.getTrackingData("sleep", startDate, endDate),
        trackService.getTrackingData("water", startDate, endDate),
      ]);

      if (stepsRes.success && sleepRes.success && waterRes.success) {
        const stepsData = stepsRes.data || [];
        const sleepData = sleepRes.data || [];
        const waterData = waterRes.data || [];

        const dateMap: { [date: string]: TrackingData } = {};

        stepsData.forEach((item: any) => {
          const date = normalizeDate(item.date);
          if (!dateMap[date])
            dateMap[date] = { steps: null, sleep: null, water: null };
          dateMap[date].steps = item;
        });

        sleepData.forEach((item: any) => {
          const date = normalizeDate(item.date);
          if (!dateMap[date])
            dateMap[date] = { steps: null, sleep: null, water: null };
          dateMap[date].sleep = item;
        });

        waterData.forEach((item: any) => {
          const date = normalizeDate(item.date);
          if (!dateMap[date])
            dateMap[date] = { steps: null, sleep: null, water: null };
          dateMap[date].water = item;
        });

        const totalTrackArray: TrackingData[] = Object.values(dateMap).sort(
          (a, b) => {
            const dateA = a.steps?.date || a.sleep?.date || a.water?.date || "";
            const dateB = b.steps?.date || b.sleep?.date || b.water?.date || "";
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          }
        );

        const todayStr = formatDate(today);
        const todayData = dateMap[todayStr] || {
          steps: null,
          sleep: null,
          water: null,
        };

        // ✅ update redux
        dispatch(setTotalTrackData(totalTrackArray));
        dispatch(setCurrentDateTrackData(todayData));
      }
    } catch (err) {
      console.error("Failed to load tracking data", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Run on mount (or when user opens graph page)
  useEffect(() => {
    if (totalTrackData.length === 0) {
      fetchData();
    }
  }, []);

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
  const { height } = Dimensions.get("window");
  const topPadding = height * 0.05;

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f2f2f2" }}
          edges={["left", "right"]}
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator color="#9747FF" size="large" />
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  paddingLeft: 20,
                  marginTop: Platform.OS === "ios" ? topPadding : "4%",
                }}
              >
                <NormalHeader screenName="Tracking Graphs" />
              </View>

              <View style={{ padding: 20 }}>
                {/* Tabs */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 20,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  {tabNames.map((tab) => {
                    const isSelected = selectedTab === tab;
                    return (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => setSelectedTab(tab)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 12,
                          backgroundColor: isSelected ? "#9747FF" : "transparent",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? "#FFFFFF" : "#666",
                            fontWeight: isSelected ? "700" : "500",
                            fontSize: 14,
                          }}
                        >
                          {tab}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Month Switcher Card */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setMonthOffset((prev) => prev - 1)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#F8F8F8",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color="#9747FF"
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                    }}
                  >
                    {currentMonth.format("MMMM YYYY")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setMonthOffset((prev) => prev + 1)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#F8F8F8",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9747FF"
                    />
                  </TouchableOpacity>
                </View>

                {/* Chart Card */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 5,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <LineChart
                      data={getGraphData()}
                      width={screenWidth - 72}
                      height={220}
                      chartConfig={chartConfig}
                      bezier
                      withShadow={false}
                      style={{ borderRadius: 16 }}
                    />
                  </Animated.View>
                </View>

                {/* Records Section */}
                {getSelectedData().length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        width: 3,
                        height: 20,
                        backgroundColor: "#9747FF",
                        borderRadius: 2,
                        marginRight: 10,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#000",
                      }}
                    >
                      {selectedTab} Records
                    </Text>
                  </View>
                )}

                {getSelectedData().length === 0 ? (
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 40,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                    }}
                  >
                    <Ionicons name="bar-chart-outline" size={48} color="#999" />
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#666",
                        marginTop: 12,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      No data available for this month
                    </Text>
                  </View>
                ) : (
                  <View style={{ marginBottom: 20 }}>
                    {getSelectedData().map((item, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: "#FFFFFF",
                          padding: 16,
                          marginBottom: 12,
                          borderRadius: 16,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          elevation: 3,
                          borderWidth: 1,
                          borderColor: "#F5F5F5",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 1,
                          }}
                        >
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: "#F8F8F8",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
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
                              color="#9747FF"
                            />
                          </View>
                          <Text
                            style={{
                              color: "#000",
                              fontWeight: "600",
                              fontSize: 14,
                            }}
                          >
                            {dayjs(item.date).format("MMM D, YYYY")}
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#9747FF",
                          }}
                        >
                          {selectedTab === "Sleep"
                            ? `${item.value} hrs`
                            : selectedTab === "Steps"
                              ? `${item.value} steps`
                              : `${item.value} ml`}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
