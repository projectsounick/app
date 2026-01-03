import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { weightService } from "@/app/services/weight.service";
import { createStreak } from "@/app/services/streaks.service";
import { useDispatch } from "react-redux";
import { setStreakData } from "@/Slices/streakSlice";

const { height, width } = Dimensions.get("window");

interface WeightTrackerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function WeightTrackerBottomSheet({
  visible,
  onClose,
}: WeightTrackerBottomSheetProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [weightData, setWeightData] = useState<
    { weight: number; date: string; _id?: string }[]
  >([]);
  const [newWeight, setNewWeight] = useState("");
  const [addingWeight, setAddingWeight] = useState(false);
  const dispatch = useDispatch();

  const fetchWeights = async () => {
    try {
      const response = await weightService.getWeights();
      if (response.success && response.data) {
        setWeightData(response.data);
      } else {
        setWeightData([]);
      }
    } catch (error) {
      console.error(error);
      setWeightData([]);
    }
  };

  useEffect(() => {
    if (visible) fetchWeights();
  }, [visible]);

  const handleAddWeight = async () => {
    if (!newWeight) return;
    try {
      setAddingWeight(true);
      const response = await weightService.addWeight({
        weight: parseFloat(newWeight),
      });
      if (response.success && response.data) {
        const streakResp = await createStreak();
        if (streakResp.success) dispatch(setStreakData(streakResp.data));
        setWeightData((prev) => [...prev, response.data]);
      }
      setNewWeight("");
      setAddingWeight(false);
    } catch (error) {
      console.error(error);
      setAddingWeight(false);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    try {
      const res = await weightService.deleteWeight(id);
      if (res.success)
        setWeightData((prev) => prev.filter((w) => w._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const chartData = {
    labels: weightData.map((w) =>
      new Date(w.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    ),
    datasets: [
      {
        data: weightData.map((w) => w.weight),
        color: () => "#7771de",
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(119,113,222,${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    propsForDots: { r: "5", strokeWidth: "2", stroke: "#67c694" },
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, justifyContent: "flex-end" }}
    >
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
        {/* Dash handle */}
        <View
          style={{
            width: 50,
            height: 5,
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: 3,
            alignSelf: "center",
            marginTop: 4,
            marginBottom: 10,
          }}
        />

        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: 6,
            zIndex: 2,
          }}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <MaterialCommunityIcons
            name="weight-kilogram"
            size={28}
            color="#7771de"
          />
            <Text
              style={{
                fontFamily: theme.fonts.bold,
                fontSize: theme.fontSizes.large,
                color: theme.colors.textWhite,
                marginLeft: 8,
              }}
            >
              Weight Tracker
            </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Chart */}
          <View
            style={{
              marginBottom: 20,
              padding: 12,
            }}
          >
            {weightData.length > 0 ? (
              <LineChart
                data={chartData}
                width={width - 64}
                height={240}
                yAxisSuffix="kg"
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 16 }}
              />
            ) : (
              <View
                style={{
                  width: width - 64,
                  height: 200,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#ccc", fontFamily: theme.fonts.regular }}
                >
                  No weight data to display
                </Text>
              </View>
            )}
          </View>

          {/* New Weight Input */}
          <View
            style={{
              marginBottom: 20,
              padding: 16,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSizes.regularSmall,
                fontFamily: theme.fonts.medium,
                color: theme.colors.textWhite,
                marginBottom: 6,
              }}
            >
              Enter Weight (kg)
            </Text>
            <TextInput
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="numeric"
              placeholder="e.g., 70"
              placeholderTextColor="#ccc"
              style={{
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
                borderRadius: 12,
                padding: 12,
                fontSize: theme.fontSizes.regular,
                fontFamily: theme.fonts.regular,
                color: theme.colors.textWhite,
              }}
            />
            <TouchableOpacity
              onPress={handleAddWeight}
              disabled={addingWeight}
              style={{
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                paddingVertical: 14,
                backgroundColor: addingWeight ? "#a6a3f0" : "#67c694",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 4,
              }}
            >
              <Feather name="save" size={18} color="#fff" />
              <Text
                style={{
                  color: theme.colors.textWhite,
                  fontFamily: theme.fonts.bold,
                  fontSize: theme.fontSizes.regular,
                  marginLeft: 8,
                }}
              >
                {addingWeight ? "Saving..." : "Save Entry"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Logs Heading */}
          {weightData.length > 0 && (
            <Text
              style={{
                fontFamily: theme.fonts.bold,
                fontSize: theme.fontSizes.medium,
                color: theme.colors.textWhite,
                marginBottom: 12,
              }}
            >
              Recent Logs
            </Text>
          )}

          {/* Recent Logs List */}
          {weightData.length > 0 &&
            weightData
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((entry, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    padding: 16,
                    borderRadius: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontFamily: theme.fonts.bold,
                        fontSize: theme.fontSizes.medium,
                        color: theme.colors.textWhite,
                      }}
                    >
                      {entry.weight} kg
                    </Text>
                    <Text
                      style={{
                        fontFamily: theme.fonts.regular,
                        fontSize: theme.fontSizes.regularSmall,
                        color: theme.colors.textMuted,
                        marginTop: 4,
                      }}
                    >
                      {new Date(entry.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => handleDeleteWeight(entry._id || "")}
                    >
                      <AntDesign
                        name="delete"
                        size={20}
                        color="#FF4D4D"
                        style={{ marginRight: 12 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
