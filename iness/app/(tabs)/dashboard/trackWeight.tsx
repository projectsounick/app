import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";
import { weightService } from "@/app/services/weight.service";
import { createStreak } from "@/app/services/streaks.service";
import { setStreakData } from "@/Slices/streakSlice";
import { useDispatch } from "react-redux";

const { height, width } = Dimensions.get("window");

const WeightTrackerScreen = () => {
  const [weightData, setWeightData] = useState<
    { weight: number; date: string; _id?: string }[]
  >([]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [addingWeight, setAddingWeight] = useState(false);

  const fetchWeights = async () => {
    try {
      setLoading(true);
      const response = await weightService.getWeights();
      console.log(response.data);
      if (response.success && response.data) {
        setWeightData(response.data);
      } else {
        setWeightData([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching weights", error);
      setWeightData([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  const handleAddWeight = async () => {
    if (!newWeight) return;
    try {
      setAddingWeight(true);
      const response = await weightService.addWeight({
        weight: parseFloat(newWeight),
      });
      if (response.success && response.data) {
        let responseStreak = await createStreak();
        if (responseStreak.success) {
          dispatch(setStreakData(responseStreak.data));
        }
        setWeightData((prev) => [...(prev || []), response.data]);
      }
      setNewWeight("");
      setModalVisible(false);
      setAddingWeight(false);
    } catch (error) {
      console.error("Error adding weight", error);
      setAddingWeight(false);
    }
  };

  const handleDeleteWeight = async (weightId: string) => {
    try {
      console.log(weightId);
      const response = await weightService.deleteWeight(weightId);
      if (response.success) {
        setWeightData((prev) => (prev || []).filter((w) => w._id !== weightId));
      }
    } catch (error) {
      console.error("Error deleting weight", error);
    }
  };

  const chartData = {
    labels: (weightData || []).map((item) =>
      new Date(item.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    ),
    datasets: [
      {
        data: (weightData || []).map((item) => item.weight),
        color: () => "#7771de",
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ecebff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(119, 113, 222, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(90, 90, 90, ${opacity})`,
    propsForDots: { r: "5", strokeWidth: "2", stroke: "#67c694" },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: Platform.OS === "ios" ? height * 0.01 : "4%",
        }}
      >
        <NormalHeader screenName="Progress" />
      </View>

      {loading ? (
        <View style={{ padding: 16 }}>
          <ShimmerPlaceHolder
            style={{
              width: width - 32,
              height: 220,
              borderRadius: 16,
              marginBottom: 20,
              alignSelf: "center",
            }}
            shimmerColors={["#E0E0E0", "#F8F8F8", "#E0E0E0"]}
          />
          {[1, 2, 3].map((i) => (
            <ShimmerPlaceHolder
              key={i}
              style={{
                width: "100%",
                height: 80,
                borderRadius: 12,
                marginBottom: 14,
              }}
              shimmerColors={["#E0E0E0", "#F8F8F8", "#E0E0E0"]}
            />
          ))}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
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
                fontSize: 22,
                color: "#140A21",
                marginLeft: 8,
              }}
            >
              Weight Progress
            </Text>
          </View>

          <View
            style={{
              borderRadius: 16,
              paddingVertical: 10,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 5,
              elevation: 3,
              marginBottom: 20,
            }}
          >
            {weightData && weightData.length > 0 ? (
              <LineChart
                data={chartData}
                width={width - 32}
                height={220}
                yAxisSuffix="kg"
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 16 }}
              />
            ) : (
              <View
                style={{
                  width: width - 32,
                  height: 220,
                  borderRadius: 16,
                  backgroundColor: "#f0f0f0",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#777", fontFamily: theme.fonts.regular }}
                >
                  No weight data to display
                </Text>
              </View>
            )}
          </View>
          {weightData && weightData.length > 0 ? (
            <Text
              style={{
                fontFamily: theme.fonts.medium,
                fontSize: 18,
                color: "#140A21",
                marginBottom: 10,
              }}
            >
              Recent Logs
            </Text>
          ) : null}

          {(weightData || [])
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((entry, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: theme.fonts.bold,
                      fontSize: 18,
                      color: "#140A21",
                    }}
                  >
                    {entry.weight} kg
                  </Text>
                  <Text
                    style={{
                      color: "#666",
                      fontFamily: theme.fonts.regular,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {new Date(entry.date).toLocaleString("en-IN", {
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
                      style={{ marginRight: 10 }}
                    />
                  </TouchableOpacity>
                  <AntDesign name="arrowright" size={20} color="#7771de" />
                </View>
              </View>
            ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          backgroundColor: "#67c694",
          borderRadius: 50,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 5,
          elevation: 6,
        }}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 50,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: "#ccc",
                marginBottom: 14,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <MaterialCommunityIcons name="weight" size={32} color="#7771de" />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: theme.fonts.bold,
                  color: "#140A21",
                  marginLeft: 10,
                }}
              >
                Log Your Weight
              </Text>
            </View>
            <TextInput
              placeholder="Enter weight (kg)"
              keyboardType="numeric"
              value={newWeight}
              onChangeText={setNewWeight}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                width: "100%",
                fontFamily: theme.fonts.regular,
                marginBottom: 20,
              }}
            />
            <TouchableOpacity
              onPress={handleAddWeight}
              disabled={addingWeight}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                borderRadius: 20,
                paddingVertical: 14,
                backgroundColor: addingWeight ? "#a6a3f0" : "#67c694",
              }}
            >
              <Feather name="save" size={18} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontFamily: theme.fonts.bold,
                  fontSize: 16,
                  marginLeft: 8,
                }}
              >
                {addingWeight ? "Saving..." : "Save Entry"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 14 }}
            >
              <Text
                style={{
                  color: "#7771de",
                  fontFamily: theme.fonts.medium,
                  fontSize: 15,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default WeightTrackerScreen;
