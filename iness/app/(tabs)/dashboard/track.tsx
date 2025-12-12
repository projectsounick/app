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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
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

const tabNames = ["Sleep", "Steps", "Water"] as const;
type TabType = (typeof tabNames)[number];

const getChartConfig = (tab: TabType) => {
  const colors = {
    Sleep: { primary: "#67C694", gradient: "#E8F5E9" },
    Steps: { primary: "#9747FF", gradient: "#F3EDFF" },
    Water: { primary: "#4FC3F7", gradient: "#E3F2FD" },
  };
  const color = colors[tab];
  
  return {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => {
      const rgb = tab === "Sleep" ? "103, 198, 148" : tab === "Steps" ? "151, 71, 255" : "79, 195, 247";
      return `rgba(${rgb}, ${opacity})`;
    },
    labelColor: () => "#666",
    strokeWidth: 3,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: color.primary,
    },
  };
};

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
          style={{ flex: 1, backgroundColor: "transparent" }}
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
                  paddingHorizontal: 20,
                  marginTop: Platform.OS === "ios" ? topPadding : "4%",
                }}
              >
                <NormalHeader screenName="Track" />
              </View>

              <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}>
                {/* Tabs */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 24,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  {tabNames.map((tab) => {
                    const isSelected = selectedTab === tab;
                    const tabColors = {
                      Sleep: { bg: "#67C694", text: "#FFFFFF", icon: "#FFFFFF" },
                      Steps: { bg: "#9747FF", text: "#FFFFFF", icon: "#FFFFFF" },
                      Water: { bg: "#4FC3F7", text: "#FFFFFF", icon: "#FFFFFF" },
                    };
                    const inactiveColors = {
                      Sleep: { bg: "transparent", text: "#666", icon: "#999" },
                      Steps: { bg: "transparent", text: "#666", icon: "#999" },
                      Water: { bg: "transparent", text: "#666", icon: "#999" },
                    };
                    const color = isSelected ? tabColors[tab] : inactiveColors[tab];
                    
                    return (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => setSelectedTab(tab)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          paddingHorizontal: 8,
                          borderRadius: 12,
                          backgroundColor: color.bg,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 6,
                          shadowColor: isSelected ? color.bg : "transparent",
                          shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                          shadowOpacity: isSelected ? 0.3 : 0,
                          shadowRadius: isSelected ? 4 : 0,
                          elevation: isSelected ? 3 : 0,
                        }}
                      >
                        <MaterialCommunityIcons
                          name={
                            tab === "Sleep"
                              ? "moon-waning-crescent"
                              : tab === "Steps"
                                ? "walk"
                                : "cup-water"
                          }
                          size={18}
                          color={color.icon}
                        />
                        <Text
                          style={{
                            color: color.text,
                            fontWeight: "700",
                            fontSize: 13,
                            fontFamily: theme.fonts.bold,
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
                    marginBottom: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {(() => {
                    const arrowColors = {
                      Sleep: "#67C694",
                      Steps: "#9747FF",
                      Water: "#4FC3F7",
                    };
                    const arrowBgColors = {
                      Sleep: "#E8F5E9",
                      Steps: "#F3EDFF",
                      Water: "#E3F2FD",
                    };
                    const arrowColor = arrowColors[selectedTab];
                    const arrowBg = arrowBgColors[selectedTab];
                    
                    return (
                      <>
                        <TouchableOpacity
                          onPress={() => setMonthOffset((prev) => prev - 1)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: arrowBg,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons
                            name="chevron-back"
                            size={20}
                            color={arrowColor}
                          />
                        </TouchableOpacity>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#1A1A1A",
                            fontFamily: theme.fonts.bold,
                          }}
                        >
                          {currentMonth.format("MMMM YYYY")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setMonthOffset((prev) => prev + 1)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: arrowBg,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={arrowColor}
                          />
                        </TouchableOpacity>
                      </>
                    );
                  })()}
                </View>

                {/* Chart Card */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <LineChart
                      data={getGraphData()}
                      width={screenWidth - 72}
                      height={220}
                      chartConfig={getChartConfig(selectedTab)}
                      bezier
                      withShadow={false}
                      style={{ borderRadius: 16 }}
                    />
                  </Animated.View>
                </View>

                {/* Detailed Report Section */}
                {getSelectedData().length > 0 && (() => {
                  const selectedData = getSelectedData();
                  const total = selectedData.reduce((sum, item) => sum + item.value, 0);
                  const count = selectedData.length;
                  
                  // Base/Target values per day
                  const dailyTargets = {
                    Sleep: 8, // hours
                    Steps: 10000, // steps
                    Water: 8, // glasses
                  };
                  
                  // Calculate days in the month
                  const daysInMonth = currentMonth.daysInMonth();
                  const targetTotal = dailyTargets[selectedTab] * daysInMonth;
                  const difference = total - targetTotal;
                  const percentage = targetTotal > 0 ? (total / targetTotal) * 100 : 0;
                  const isLagging = difference < 0;
                  
                  const colors = {
                    Sleep: { text: "#67C694", bg: "#E8F5E9" },
                    Steps: { text: "#9747FF", bg: "#F3EDFF" },
                    Water: { text: "#4FC3F7", bg: "#E3F2FD" },
                  };
                  const color = colors[selectedTab];
                  
                  return (
                    <>
                      {/* Detailed Report Header */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 16,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: "#1A1A1A",
                            fontFamily: theme.fonts.bold,
                          }}
                        >
                          Detailed Report
                        </Text>
                        <View
                          style={{
                            width: 30,
                            height: 3,
                            backgroundColor: "#9747FF",
                            borderRadius: 2,
                          }}
                        />
                      </View>
                      
                      {/* Detailed Report Card */}
                      <View
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: 16,
                          padding: 20,
                          marginBottom: 24,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                          borderWidth: 1,
                          borderColor: "#F5F5F5",
                        }}
                      >
                        {/* Stats Row */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            marginBottom: 20,
                            paddingBottom: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: "#F5F5F5",
                          }}
                        >
                          <View style={{ alignItems: "center", flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 24,
                                fontWeight: "700",
                                color: color.text,
                                fontFamily: theme.fonts.bold,
                                marginBottom: 4,
                              }}
                            >
                              {selectedTab === "Sleep"
                                ? `${total.toFixed(1)} hrs`
                                : selectedTab === "Steps"
                                  ? total.toLocaleString()
                                  : `${total} glasses`}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: "#666",
                                fontFamily: theme.fonts.medium,
                              }}
                            >
                              Total {selectedTab}
                            </Text>
                          </View>
                          
                          <View
                            style={{
                              width: 1,
                              height: 50,
                              backgroundColor: "#E8E8E8",
                              marginHorizontal: 16,
                            }}
                          />
                          
                          <View style={{ alignItems: "center", flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 24,
                                fontWeight: "700",
                                color: color.text,
                                fontFamily: theme.fonts.bold,
                                marginBottom: 4,
                              }}
                            >
                              {count}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: "#666",
                                fontFamily: theme.fonts.medium,
                              }}
                            >
                              {count === 1 ? "Entry" : "Entries"}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Analysis Section */}
                        <View
                          style={{
                            backgroundColor: "#F9F9F9",
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "#F0F0F0",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 16,
                            }}
                          >
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: isLagging ? "#FFEBEE" : "#E8F5E9",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                              }}
                            >
                              <Ionicons
                                name={isLagging ? "trending-down" : "trending-up"}
                                size={20}
                                color={isLagging ? "#D32F2F" : "#2F8C62"}
                              />
                            </View>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "700",
                                color: "#1A1A1A",
                                fontFamily: theme.fonts.bold,
                              }}
                            >
                              Monthly Analysis
                            </Text>
                          </View>
                          
                          {/* Progress Bar Section */}
                          <View style={{ marginBottom: 20 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#888",
                                  fontFamily: theme.fonts.medium,
                                }}
                              >
                                Progress
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "700",
                                  color: isLagging ? "#D32F2F" : "#2F8C62",
                                  fontFamily: theme.fonts.bold,
                                }}
                              >
                                {percentage.toFixed(1)}%
                              </Text>
                            </View>
                            
                            <View
                              style={{
                                height: 10,
                                backgroundColor: "#E8E8E8",
                                borderRadius: 5,
                                overflow: "hidden",
                                marginBottom: 16,
                              }}
                            >
                              <View
                                style={{
                                  height: "100%",
                                  width: `${Math.min(percentage, 100)}%`,
                                  backgroundColor: isLagging ? "#FF6B6B" : "#67C694",
                                  borderRadius: 5,
                                }}
                              />
                            </View>
                          </View>
                          
                          {/* Target vs Actual Cards */}
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 12,
                              marginBottom: 16,
                            }}
                          >
                            {/* Target Card */}
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: "#FFFFFF",
                                borderRadius: 12,
                                padding: 14,
                                borderWidth: 1,
                                borderColor: "#E8E8E8",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#888",
                                  fontFamily: theme.fonts.medium,
                                  marginBottom: 6,
                                }}
                              >
                                Target
                              </Text>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "700",
                                  color: "#1A1A1A",
                                  fontFamily: theme.fonts.bold,
                                  marginBottom: 2,
                                }}
                              >
                                {selectedTab === "Sleep"
                                  ? `${targetTotal.toFixed(1)} hrs`
                                  : selectedTab === "Steps"
                                    ? targetTotal.toLocaleString()
                                    : `${targetTotal} glasses`}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: "#999",
                                  fontFamily: theme.fonts.regular,
                                }}
                              >
                                {dailyTargets[selectedTab].toLocaleString()} {selectedTab === "Sleep" ? "hrs" : selectedTab === "Steps" ? "steps" : "glasses"}/day
                              </Text>
                            </View>
                            
                            {/* Actual Card */}
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: color.bg,
                                borderRadius: 12,
                                padding: 14,
                                borderWidth: 1,
                                borderColor: color.text + "20",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#888",
                                  fontFamily: theme.fonts.medium,
                                  marginBottom: 6,
                                }}
                              >
                                Actual
                              </Text>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "700",
                                  color: color.text,
                                  fontFamily: theme.fonts.bold,
                                  marginBottom: 2,
                                }}
                              >
                                {selectedTab === "Sleep"
                                  ? `${total.toFixed(1)} hrs`
                                  : selectedTab === "Steps"
                                    ? total.toLocaleString()
                                    : `${total} glasses`}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: "#999",
                                  fontFamily: theme.fonts.regular,
                                }}
                              >
                                {count} {count === 1 ? "entry" : "entries"}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Difference Card */}
                          <View
                            style={{
                              backgroundColor: isLagging ? "#FFEBEE" : "#E8F5E9",
                              borderRadius: 12,
                              padding: 14,
                              borderWidth: 1,
                              borderColor: isLagging ? "#FFCDD2" : "#C8E6C9",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                              <Ionicons
                                name={isLagging ? "alert-circle" : "checkmark-circle"}
                                size={20}
                                color={isLagging ? "#D32F2F" : "#2F8C62"}
                                style={{ marginRight: 10 }}
                              />
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color: "#666",
                                    fontFamily: theme.fonts.medium,
                                    marginBottom: 2,
                                  }}
                                >
                                  {isLagging ? "Lagging by" : "Ahead by"}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontWeight: "700",
                                    color: isLagging ? "#D32F2F" : "#2F8C62",
                                    fontFamily: theme.fonts.bold,
                                  }}
                                >
                                  {selectedTab === "Sleep"
                                    ? `${Math.abs(difference).toFixed(1)} hrs`
                                    : selectedTab === "Steps"
                                      ? Math.abs(difference).toLocaleString()
                                      : `${Math.abs(difference)} glasses`}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </>
                  );
                })()}

                {/* Records Section Header */}
                {getSelectedData().length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#1A1A1A",
                        fontFamily: theme.fonts.bold,
                      }}
                    >
                      {selectedTab} Records
                    </Text>
                    <View
                      style={{
                        width: 30,
                        height: 3,
                        backgroundColor: "#9747FF",
                        borderRadius: 2,
                      }}
                    />
                  </View>
                )}

                {getSelectedData().length === 0 ? (
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 20,
                      padding: 40,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 12,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                    }}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        backgroundColor: "#F3EDFF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="bar-chart-outline" size={32} color="#9747FF" />
                    </View>
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
                    {getSelectedData().map((item, index) => {
                      const colors = {
                        Sleep: { bg: "#E8F5E9", icon: "#67C694", text: "#67C694" },
                        Steps: { bg: "#F3EDFF", icon: "#9747FF", text: "#9747FF" },
                        Water: { bg: "#E3F2FD", icon: "#4FC3F7", text: "#4FC3F7" },
                      };
                      const color = colors[selectedTab];
                      
                      return (
                        <View
                          key={index}
                          style={{
                            backgroundColor: "#FFFFFF",
                            padding: 16,
                            marginBottom: 12,
                            borderRadius: 16,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
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
                            <Text
                              style={{
                                color: "#000",
                                fontWeight: "600",
                                fontSize: 15,
                                fontFamily: theme.fonts.medium,
                              }}
                            >
                              {dayjs(item.date).format("MMM D, YYYY")}
                            </Text>
                          </View>

                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: color.text,
                            }}
                          >
                            {selectedTab === "Sleep"
                              ? `${item.value} hrs`
                              : selectedTab === "Steps"
                                ? `${item.value.toLocaleString()} steps`
                                : `${item.value} glasses`}
                          </Text>
                        </View>
                      );
                    })}
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
