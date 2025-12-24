import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { useAppleHealthSync } from "@/hooks/useAppleHealthSync";
import { useAndroidHealthSync } from "@/hooks/useAndroidHealthSync";
import CustomSnackbar from "@/app/modules/Snackbar";
import TrackShimmer from "@/app/modules/Shimmer/TrackShimmer";

const screenWidth = Dimensions.get("window").width;

const tabNames = ["Sleep", "Steps", "Water"] as const;
type TabType = (typeof tabNames)[number];

const getChartConfig = (tab: TabType) => {
  const colors = {
    Sleep: { primary: "#B39DDB", gradient: "#EDE7F6" },
    Steps: { primary: "#9747FF", gradient: "#F3EDFF" },
    Water: { primary: "#4FC3F7", gradient: "#E3F2FD" },
  };
  const color = colors[tab];
  
  return {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => {
      const rgb = tab === "Sleep" ? "179, 157, 219" : tab === "Steps" ? "151, 71, 255" : "79, 195, 247";
      return `rgba(${rgb}, ${opacity})`;
    },
    labelColor: (opacity = 1) => {
      // Y-axis labels should be darker
      return `rgba(51, 51, 51, ${opacity})`;
    },
    strokeWidth: 3,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: color.primary,
      fill: "#FFFFFF",
    },
    propsForLabels: {
      fontSize: 10,
      fontFamily: theme.fonts.regular,
      fontWeight: "500",
      fill: "#000000",
    },
    propsForVerticalLabels: {
      fontSize: 10,
      fontFamily: theme.fonts.regular,
      fontWeight: "500",
      fill: "#000000",
      color: "#000000",
    },
    propsForBackgroundLines: {
      strokeWidth: 1.5,
      stroke: "#E8E8E8",
      strokeDasharray: "0", // Solid lines
    },
    decimalPlaces: 0,
    formatYLabel: (value) => {
      const num = parseFloat(value);
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
      }
      return num.toFixed(0);
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
  const [syncingSteps, setSyncingSteps] = useState(false);
  const [syncingSleep, setSyncingSleep] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const dispatch = useDispatch();
  const totalTrackData = useSelector(
    (state: RootState) => state.track.totalTrackData as TrackingData[]
  );
  
  // Platform-specific health sync hooks
  const iosHealthSync = useAppleHealthSync();
  const androidHealthSync = useAndroidHealthSync();
  
  // Use platform-specific hook based on OS
  const { isAvailable, syncData, syncStatus } = Platform.OS === "ios" 
    ? iosHealthSync 
    : androidHealthSync;
  
  // Store data per month: { "2024-12": TrackingData[], "2024-11": TrackingData[], ... }
  const [monthDataMap, setMonthDataMap] = useState<{ [monthKey: string]: TrackingData[] }>({});
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [loadingMonths, setLoadingMonths] = useState<Set<string>>(new Set());
  const [chartKey, setChartKey] = useState(0); // Force chart remount when data changes
  
  // Use refs to avoid dependency issues in useEffect
  const loadedMonthsRef = useRef<Set<string>>(new Set());
  const loadingMonthsRef = useRef<Set<string>>(new Set());
  
  // Keep refs in sync with state
  useEffect(() => {
    loadedMonthsRef.current = loadedMonths;
  }, [loadedMonths]);
  
  useEffect(() => {
    loadingMonthsRef.current = loadingMonths;
  }, [loadingMonths]);

  // ✅ Fetch tracking data for a specific month
  const fetchDataForMonth = useCallback(async (month: dayjs.Dayjs) => {
    const monthKey = month.format("YYYY-MM");
    
    // Check if already loaded or currently loading (use refs to avoid dependency issues)
    if (loadedMonthsRef.current.has(monthKey)) {
      return;
    }
    
    if (loadingMonthsRef.current.has(monthKey)) {
      return;
    }

    // Mark as loading
    setLoadingMonths((prev) => {
      const next = new Set(prev);
      next.add(monthKey);
      loadingMonthsRef.current = next;
      return next;
    });
    setLoading(true);
    try {
      const formatDate = (d: Date) => d.toLocaleDateString("en-CA");

      // Calculate start and end of the month
      const startOfMonth = month.startOf("month").toDate();
      const endOfMonth = month.endOf("month").toDate();
      const startDate = formatDate(startOfMonth);
      const endDate = formatDate(endOfMonth);


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

        const monthTrackArray: TrackingData[] = Object.values(dateMap).sort(
          (a, b) => {
            const dateA = a.steps?.date || a.sleep?.date || a.water?.date || "";
            const dateB = b.steps?.date || b.sleep?.date || b.water?.date || "";
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          }
        );

        // Store this month's data (Redux will update via useEffect)
        setMonthDataMap((prev) => {
          const updated = {
            ...prev,
            [monthKey]: monthTrackArray,
          };
          
          // Force chart remount by updating key
          setChartKey((prev) => prev + 1);
          
          return updated;
        });
        
        setLoadedMonths((prev) => {
          const next = new Set(prev);
          next.add(monthKey);
          loadedMonthsRef.current = next;
          return next;
        });
        
        setLoadingMonths((prev) => {
          const next = new Set(prev);
          next.delete(monthKey);
          loadingMonthsRef.current = next;
          return next;
        });
        

        // Update today's data if this is the current month
        const today = new Date();
        if (month.isSame(today, "month")) {
          const todayStr = formatDate(today);
          const todayData = dateMap[todayStr] || {
            steps: null,
            sleep: null,
            water: null,
          };
          dispatch(setCurrentDateTrackData(todayData));
        }
      }
    } catch (err) {
      console.error(`[Track] Failed to load tracking data for ${monthKey}:`, err);
      setLoadingMonths((prev) => {
        const next = new Set(prev);
        next.delete(monthKey);
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Update Redux whenever monthDataMap changes
  useEffect(() => {
    const monthKeys = Object.keys(monthDataMap);
    if (monthKeys.length === 0) {
      return;
    }
    
    // Merge all months into one array
    const allData: TrackingData[] = [];
    Object.values(monthDataMap).forEach((monthData) => {
      allData.push(...monthData);
    });
    
    // Sort by date (oldest to newest)
    allData.sort((a, b) => {
      const dateA = a.steps?.date || a.sleep?.date || a.water?.date || "";
      const dateB = b.steps?.date || b.sleep?.date || b.water?.date || "";
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
    
    // Update Redux
    dispatch(setTotalTrackData(allData));
  }, [monthDataMap, dispatch]);

  // ✅ Fetch data when month changes OR on initial mount
  useEffect(() => {
    const monthKey = currentMonth.format("YYYY-MM");
    
    // Show shimmer when month changes
    setLoading(true);
    
    // Use refs to check without causing dependency issues
    if (!loadedMonthsRef.current.has(monthKey) && !loadingMonthsRef.current.has(monthKey)) {
      fetchDataForMonth(currentMonth);
    } else {
      // Data already loaded, hide shimmer after brief delay for smooth transition
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  }, [monthOffset, fetchDataForMonth]);

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

  const filterMonthData = (dataArray: ChartPoint[]): ChartPoint[] => {
    const monthKey = currentMonth.format("YYYY-MM");
    
    const filtered = dataArray.filter((d) => {
      const dateMonthKey = dayjs(d.date).format("YYYY-MM");
      return dateMonthKey === monthKey;
    });
    
    return filtered.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
  };

  // Get graph data directly from monthDataMap for current month (more reliable than Redux)
  const getGraphData = useMemo(() => {
    const monthKey = currentMonth.format("YYYY-MM");
    
    // Get data directly from monthDataMap for current month
    const currentMonthData = monthDataMap[monthKey] || [];
    
    // Convert to chart points based on selected tab
    let dataset: ChartPoint[] = [];
    
    currentMonthData.forEach((entry) => {
      if (selectedTab === "Sleep" && entry.sleep?.date && entry.sleep.sleepDuration != null) {
        dataset.push({
          date: entry.sleep.date,
          value: entry.sleep.sleepDuration,
        });
      } else if (selectedTab === "Steps" && entry.steps?.date && entry.steps.steps != null) {
        dataset.push({
          date: entry.steps.date,
          value: entry.steps.steps,
        });
      } else if (selectedTab === "Water" && entry.water?.date && entry.water.waterIntake != null) {
        dataset.push({
          date: entry.water.date,
          value: entry.water.waterIntake,
        });
      }
    });
    
    // Sort by date
    dataset.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    if (dataset.length === 0) {
      return {
        labels: ["No data"],
        datasets: [{ data: [0] }],
      };
    }

    const allLabels = dataset.map((d) => dayjs(d.date).format("D"));
    const values = dataset.map((d) => d.value);

    // Ensure all values are numbers
    const validValues = values.map(v => typeof v === 'number' ? v : 0);
    
    // Reduce label congestion: show fewer labels for better readability
    // Keep array length the same, but use empty strings for labels we want to hide
    const getSparseLabels = (labels: string[]): string[] => {
      const totalLabels = labels.length;
      
      // If we have few labels (<= 12), show all
      if (totalLabels <= 12) {
        return labels;
      }
      
      // For more labels, show approximately 6-7 labels
      // Calculate step size to distribute labels evenly
      const targetCount = 7;
      const step = Math.ceil((totalLabels - 1) / (targetCount - 1));
      
      const sparseLabels = labels.map(() => ""); // Start with all empty
      
      // Set labels at calculated intervals
      for (let i = 0; i < totalLabels; i += step) {
        if (i < totalLabels) {
          sparseLabels[i] = labels[i];
        }
      }
      
      // Always ensure first and last labels are shown
      sparseLabels[0] = labels[0];
      if (sparseLabels[totalLabels - 1] === "") {
        sparseLabels[totalLabels - 1] = labels[totalLabels - 1];
      }
      
      return sparseLabels;
    };
    
    const sparseLabels = getSparseLabels(allLabels);
    
    return {
      labels: sparseLabels,
      datasets: [{ data: validValues }],
    };
  }, [selectedTab, currentMonth, monthDataMap, sleepData, stepsData, waterData]);

  const getSelectedData = useMemo(() => {
    const monthKey = currentMonth.format("YYYY-MM");
    const currentMonthData = monthDataMap[monthKey] || [];
    
    // Convert to chart points based on selected tab
    let data: ChartPoint[] = [];
    
    currentMonthData.forEach((entry) => {
      if (selectedTab === "Sleep" && entry.sleep?.date && entry.sleep.sleepDuration != null) {
        data.push({
          date: entry.sleep.date,
          value: entry.sleep.sleepDuration,
        });
      } else if (selectedTab === "Steps" && entry.steps?.date && entry.steps.steps != null) {
        data.push({
          date: entry.steps.date,
          value: entry.steps.steps,
        });
      } else if (selectedTab === "Water" && entry.water?.date && entry.water.waterIntake != null) {
        data.push({
          date: entry.water.date,
          value: entry.water.waterIntake,
        });
      }
    });
    
    // Sort by date (oldest to newest), then reverse to show newest first
    data.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
    return data.reverse();
  }, [selectedTab, currentMonth, monthDataMap]);
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
              <TrackShimmer />
            </ScrollView>
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
                      Sleep: { bg: "#B39DDB", text: "#FFFFFF", icon: "#FFFFFF" },
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
                  {/* Left side: Arrows and Month */}
                  <View style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    flex: isAvailable && 
                      ((selectedTab === "Steps" && syncStatus?.stepSync) || 
                       (selectedTab === "Sleep" && syncStatus?.sleepSync)) ? 1 : undefined,
                    justifyContent: isAvailable && 
                      ((selectedTab === "Steps" && syncStatus?.stepSync) || 
                       (selectedTab === "Sleep" && syncStatus?.sleepSync)) ? "flex-start" : "center",
                    width: isAvailable && 
                      ((selectedTab === "Steps" && syncStatus?.stepSync) || 
                       (selectedTab === "Sleep" && syncStatus?.sleepSync)) ? undefined : "100%",
                  }}>
                    {(() => {
                      const arrowColors = {
                        Sleep: "#B39DDB",
                        Steps: "#9747FF",
                        Water: "#4FC3F7",
                      };
                      const arrowBgColors = {
                        Sleep: "#EDE7F6",
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
                              marginHorizontal: 12,
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

                  {/* Right side: Sync buttons (only when sync is enabled) */}
                  {isAvailable && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {/* Steps Sync Button */}
                      {selectedTab === "Steps" && syncStatus?.stepSync && (
                        <TouchableOpacity
                          onPress={async () => {
                            if (!isAvailable || syncingSteps) return;
                            setSyncingSteps(true);
                            try {
                              const result = await syncData("steps");
                              if (result.success) {
                                // Refresh data for current month
                                const monthKey = currentMonth.format("YYYY-MM");
                                setLoadedMonths((prev) => {
                                  const next = new Set(prev);
                                  next.delete(monthKey);
                                  return next;
                                });
                                fetchDataForMonth(currentMonth);
                                // Show success message
                                const message = result.syncedCount 
                                  ? `Steps synced successfully! (${result.syncedCount} entries)`
                                  : "Steps synced successfully!";
                                setSnackbarMessage(message);
                                setTimeout(() => setSnackbarVisible(true), 100);
                              } else {
                                // Show error message
                                setSnackbarMessage(result.error || "Failed to sync steps");
                                setSnackbarVisible(true);
                              }
                            } catch (error) {
                              console.error("[Track] Manual sync error:", error);
                              setSnackbarMessage("An error occurred while syncing steps");
                              setSnackbarVisible(true);
                            } finally {
                              setSyncingSteps(false);
                            }
                          }}
                          disabled={syncingSteps}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            backgroundColor: "#67C694",
                            borderRadius: 20,
                            opacity: syncingSteps ? 0.6 : 1,
                          }}
                        >
                          {syncingSteps ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontFamily: theme.fonts.medium,
                                  fontWeight: "600",
                                  fontSize: 12,
                                }}
                              >
                                Sync Now
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}

                      {/* Sleep Sync Button */}
                      {selectedTab === "Sleep" && syncStatus?.sleepSync && (
                        <TouchableOpacity
                          onPress={async () => {
                            if (!isAvailable || syncingSleep) return;
                            setSyncingSleep(true);
                            try {
                              const result = await syncData("sleep");
                              if (result.success) {
                                // Refresh data for current month
                                const monthKey = currentMonth.format("YYYY-MM");
                                setLoadedMonths((prev) => {
                                  const next = new Set(prev);
                                  next.delete(monthKey);
                                  return next;
                                });
                                fetchDataForMonth(currentMonth);
                                // Show success message
                                const message = result.syncedCount 
                                  ? `Sleep synced successfully! (${result.syncedCount} entries)`
                                  : "Sleep synced successfully!";
                                setSnackbarMessage(message);
                                setTimeout(() => setSnackbarVisible(true), 100);
                              } else {
                                // Show error message
                                setSnackbarMessage(result.error || "Failed to sync sleep");
                                setSnackbarVisible(true);
                              }
                            } catch (error) {
                              console.error("[Track] Manual sync error:", error);
                              setSnackbarMessage("An error occurred while syncing sleep");
                              setSnackbarVisible(true);
                            } finally {
                              setSyncingSleep(false);
                            }
                          }}
                          disabled={syncingSleep}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            backgroundColor: "#67C694",
                            borderRadius: 20,
                            opacity: syncingSleep ? 0.6 : 1,
                          }}
                        >
                          {syncingSleep ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontFamily: theme.fonts.medium,
                                  fontWeight: "600",
                                  fontSize: 12,
                                }}
                              >
                                Sync Now
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {/* Chart Card */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  <View>
                    {getGraphData.labels.length > 0 && getGraphData.labels[0] !== "No data" ? (
                      <View style={{ 
                        backgroundColor: "#FAFAFA", 
                        borderRadius: 16, 
                        paddingTop: 8,
                        paddingBottom: 8,
                        paddingRight: 8,
                        paddingLeft: 0,
                      }}>
                        <LineChart
                          key={`chart-${selectedTab}-${currentMonth.format("YYYY-MM")}-${chartKey}`}
                          data={getGraphData}
                          width={screenWidth - 64}
                          height={240}
                          chartConfig={getChartConfig(selectedTab)}
                          bezier
                          withShadow={false}
                          withInnerLines={true}
                          withVerticalLines={false}
                          withHorizontalLines={true}
                          withVerticalLabels={true}
                          withHorizontalLabels={true}
                          segments={5}
                          fromZero={true}
                          style={{ 
                            borderRadius: 12,
                            marginLeft: -8,
                          }}
                        />
                      </View>
                    ) : (
                      <View style={{ height: 240, justifyContent: 'center', alignItems: 'center', backgroundColor: "#FAFAFA", borderRadius: 16 }}>
                        <Text style={{ color: '#999', fontSize: 14, fontFamily: theme.fonts.regular }}>No data available</Text>
                      </View>
                    )}
                  </View>
                </View>


                {/* Detailed Report Section */}
                {getSelectedData.length > 0 && (() => {
                  const selectedData = getSelectedData;
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
                  
                  // Additional Analytics
                  const averagePerDay = count > 0 ? total / count : 0;
                  
                  // Find best and worst days
                  const bestDay = selectedData.length > 0 
                    ? selectedData.reduce((max, item) => item.value > max.value ? item : max, selectedData[0])
                    : null;
                  const worstDay = selectedData.length > 0 
                    ? selectedData.reduce((min, item) => item.value < min.value ? item : min, selectedData[0])
                    : null;
                  
                  // Days with data vs days without
                  const daysWithData = count;
                  const daysWithoutData = daysInMonth - count;
                  const dataCompleteness = (daysWithData / daysInMonth) * 100;
                  
                  // Days above/below target
                  const daysAboveTarget = selectedData.filter(item => item.value >= dailyTargets[selectedTab]).length;
                  const daysBelowTarget = selectedData.filter(item => item.value < dailyTargets[selectedTab]).length;
                  const targetAchievementRate = count > 0 ? (daysAboveTarget / count) * 100 : 0;
                  
                  const colors = {
                    Sleep: { text: "#B39DDB", bg: "#EDE7F6" },
                    Steps: { text: "#9747FF", bg: "#F3EDFF" },
                    Water: { text: "#4FC3F7", bg: "#E3F2FD" },
                  };
                  const color = colors[selectedTab];
                  
                  return (
                    <>
                      {/* Summary Report Header */}
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
                          Summary Report
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
                      
                      {/* Summary Report Card */}
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
                        {/* Stats Row - Enhanced */}
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
                              {selectedTab === "Sleep"
                                ? `${averagePerDay.toFixed(1)}`
                                : selectedTab === "Steps"
                                  ? Math.round(averagePerDay).toLocaleString()
                                  : `${averagePerDay.toFixed(1)}`}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: "#666",
                                fontFamily: theme.fonts.medium,
                              }}
                            >
                              Avg/Day
                            </Text>
                          </View>
                        </View>
                        
                        {/* Best & Worst Day Row */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 20,
                            paddingBottom: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: "#F5F5F5",
                            gap: 12,
                          }}
                        >
                          {/* Best Day Card */}
                          <View
                            style={{
                              flex: 1,
                              backgroundColor: "#E8F5E9",
                              borderRadius: 12,
                              padding: 16,
                              borderWidth: 1,
                              borderColor: "#C8E6C9",
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                              <Ionicons name="trophy" size={18} color="#2F8C62" style={{ marginRight: 6 }} />
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#666",
                                  fontFamily: theme.fonts.medium,
                                  fontWeight: "600",
                                }}
                              >
                                Best Day
                              </Text>
                            </View>
                            {bestDay ? (
                              <>
                                <Text
                                  style={{
                                    fontSize: 22,
                                    fontWeight: "700",
                                    color: "#2F8C62",
                                    fontFamily: theme.fonts.bold,
                                    marginBottom: 4,
                                  }}
                                >
                                  {selectedTab === "Sleep"
                                    ? `${bestDay.value.toFixed(1)} hrs`
                                    : selectedTab === "Steps"
                                      ? `${Math.round(bestDay.value).toLocaleString()} steps`
                                      : `${bestDay.value} glasses`}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 13,
                                    color: "#666",
                                    fontFamily: theme.fonts.medium,
                                  }}
                                >
                                  {dayjs(bestDay.date).format("MMMM D, YYYY")}
                                </Text>
                              </>
                            ) : (
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "#999",
                                  fontFamily: theme.fonts.regular,
                                }}
                              >
                                No data
                              </Text>
                            )}
                          </View>
                          
                          {/* Worst Day Card */}
                          <View
                            style={{
                              flex: 1,
                              backgroundColor: "#FFEBEE",
                              borderRadius: 12,
                              padding: 16,
                              borderWidth: 1,
                              borderColor: "#FFCDD2",
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                              <Ionicons name="trending-down" size={18} color="#D32F2F" style={{ marginRight: 6 }} />
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#666",
                                  fontFamily: theme.fonts.medium,
                                  fontWeight: "600",
                                }}
                              >
                                Worst Day
                              </Text>
                            </View>
                            {worstDay ? (
                              <>
                                <Text
                                  style={{
                                    fontSize: 22,
                                    fontWeight: "700",
                                    color: "#D32F2F",
                                    fontFamily: theme.fonts.bold,
                                    marginBottom: 4,
                                  }}
                                >
                                  {selectedTab === "Sleep"
                                    ? `${worstDay.value.toFixed(1)} hrs`
                                    : selectedTab === "Steps"
                                      ? `${Math.round(worstDay.value).toLocaleString()} steps`
                                      : `${worstDay.value} glasses`}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 13,
                                    color: "#666",
                                    fontFamily: theme.fonts.medium,
                                  }}
                                >
                                  {dayjs(worstDay.date).format("MMMM D, YYYY")}
                                </Text>
                              </>
                            ) : (
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "#999",
                                  fontFamily: theme.fonts.regular,
                                }}
                              >
                                No data
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* Monthly Analysis Section Header */}
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
                          Monthly Analysis
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

                      {/* Monthly Analysis Card */}
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
                        {/* Analysis Section */}
                        <View
                          style={{
                            backgroundColor: "#F9F9F9",
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "#F0F0F0",
                            marginBottom: 16,
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
                                backgroundColor: isLagging ? "#FFEBEE" : "#EDE7F6",
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
                                  color: isLagging ? "#D32F2F" : selectedTab === "Sleep" ? "#B39DDB" : "#2F8C62",
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
                                  backgroundColor: isLagging ? "#FF6B6B" : "#B39DDB",
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

                        {/* Data Completeness & Target Achievement */}
                        <View style={{ flexDirection: "row", gap: 12 }}>
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
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                              <Ionicons name="calendar" size={16} color="#666" style={{ marginRight: 6 }} />
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#888",
                                  fontFamily: theme.fonts.medium,
                                }}
                              >
                                Data Completeness
                              </Text>
                            </View>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "700",
                                color: "#1A1A1A",
                                fontFamily: theme.fonts.bold,
                                marginBottom: 4,
                              }}
                            >
                              {dataCompleteness.toFixed(0)}%
                            </Text>
                            <Text
                              style={{
                                fontSize: 10,
                                color: "#999",
                                fontFamily: theme.fonts.regular,
                              }}
                            >
                              {daysWithData} of {daysInMonth} days
                            </Text>
                          </View>
                          
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
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                              <Ionicons name="flag" size={16} color="#666" style={{ marginRight: 6 }} />
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#888",
                                  fontFamily: theme.fonts.medium,
                                }}
                              >
                                Target Achievement
                              </Text>
                            </View>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "700",
                                color: selectedTab === "Sleep" 
                                  ? (targetAchievementRate >= 70 ? "#B39DDB" : targetAchievementRate >= 50 ? "#CE93D8" : "#D32F2F")
                                  : (targetAchievementRate >= 70 ? "#2F8C62" : targetAchievementRate >= 50 ? "#FF9800" : "#D32F2F"),
                                fontFamily: theme.fonts.bold,
                                marginBottom: 4,
                              }}
                            >
                              {targetAchievementRate.toFixed(0)}%
                            </Text>
                            <Text
                              style={{
                                fontSize: 10,
                                color: "#999",
                                fontFamily: theme.fonts.regular,
                              }}
                            >
                              {daysAboveTarget} above, {daysBelowTarget} below
                            </Text>
                          </View>
                        </View>
                      </View>
                    </>
                  );
                })()}

                {/* Records Section Header */}
                {getSelectedData.length > 0 && (
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
                        backgroundColor: selectedTab === "Sleep" ? "#B39DDB" : selectedTab === "Steps" ? "#9747FF" : "#4FC3F7",
                        borderRadius: 2,
                      }}
                    />
                  </View>
                )}

                {getSelectedData.length === 0 ? (
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
                        backgroundColor: selectedTab === "Sleep" ? "#EDE7F6" : selectedTab === "Steps" ? "#F3EDFF" : "#E3F2FD",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons 
                        name="bar-chart-outline" 
                        size={32} 
                        color={selectedTab === "Sleep" ? "#B39DDB" : selectedTab === "Steps" ? "#9747FF" : "#4FC3F7"} 
                      />
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
                    {getSelectedData.map((item, index) => {
                      const colors = {
                        Sleep: { bg: "#EDE7F6", icon: "#B39DDB", text: "#B39DDB" },
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
          
          <CustomSnackbar
            visible={snackbarVisible}
            message={snackbarMessage}
            onDismiss={() => setSnackbarVisible(false)}
            bgColor="#FFFFFF"
          />
        </SafeAreaView>
    </ImageBackground>
  );
}
