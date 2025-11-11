import React, { memo, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import theme from "@/app/Theme/globalTheme";
import AddActivityModal from "@/app/Modals/ActivityModal";

const { width } = Dimensions.get("window");

// Activity categories with colors
const ACTIVITY_CATEGORIES = [
  { name: "Running", color: "#FF6B6B" },
  { name: "Yoga", color: "#4ECDC4" },
  { name: "Weight Training", color: "#FFD93D" },
  { name: "Walking", color: "#5D5FEF" },
  { name: "Swimming", color: "#48BFE3" },
];

const MONTHLY_ACTIVITY_DATA = [
  { id: 1, category: "Running", duration: 60, date: "2025-11-03" },
  { id: 2, category: "Yoga", duration: 40, date: "2025-11-04" },
  { id: 3, category: "Walking", duration: 50, date: "2025-11-05" },
  { id: 4, category: "Running", duration: 30, date: "2025-11-06" },
];

const WeeklyActivityCard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activities, setActivities] = useState<
    { id: number; category: string; duration: number; date: string }[]
  >(MONTHLY_ACTIVITY_DATA);

  // Summarize activities
  const summaryData = useMemo(() => {
    return ACTIVITY_CATEGORIES.map((cat) => {
      const total = activities
        .filter((a) => a.category === cat.name)
        .reduce((sum, item) => sum + item.duration, 0);
      return { name: cat.name, duration: total, color: cat.color };
    }).filter((a) => a.duration > 0);
  }, [activities]);

  const handleAddActivity = (activity: string, duration: number) => {
    setActivities((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        category: activity,
        duration,
        date: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginVertical: 12,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: theme.fonts.bold,
            color: "#140A21",
          }}
        >
          Weekly Activity
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <AntDesign name="pluscircle" size={26} color="#67c694" />
        </TouchableOpacity>
      </View>

      {/* Content Row: Pie + Vertical List */}
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Pie chart */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",

            width: "70%",
          }}
        >
          {summaryData.length > 0 ? (
            <PieChart
              data={summaryData.map((d) => ({
                name: d.name,
                population: d.duration,
                color: d.color,
                legendFontColor: "#333",
                legendFontSize: 12,
              }))}
              width={width}
              height={200}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: () => "#000",
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="80"
              hasLegend={false}
            />
          ) : (
            <View
              style={{
                height: 180,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#999", fontSize: 16 }}>
                No activities this week
              </Text>
            </View>
          )}
        </View>

        {/* Right side vertical scrollable activities */}
        <ScrollView
          style={{ flex: 1, maxHeight: 180, marginLeft: 2 }}
          showsVerticalScrollIndicator={false}
        >
          {summaryData.length > 0 ? (
            summaryData.map((act) => (
              <View
                key={act.name}
                style={{
                  padding: 6,
                  marginBottom: 8,
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: act.color,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: theme.fonts.medium,
                      fontSize: 13,
                      marginLeft: 4,
                      textAlign: "center",
                    }}
                  >
                    {act.name}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: "#777", marginTop: 4 }}>
                  {act.duration} min
                </Text>
              </View>
            ))
          ) : (
            <View
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: "#f0f0f0",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 120,
              }}
            >
              <Text style={{ color: "#777", fontSize: 14 }}>
                No activities available
              </Text>
              <Text style={{ color: "#777", fontSize: 12, marginTop: 4 }}>
                Try adding some!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add Activity Modal */}
      <AddActivityModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddActivity={handleAddActivity}
      />
    </View>
  );
};

export default memo(WeeklyActivityCard);
