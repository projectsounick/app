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
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import NormalHeader from "@/app/modules/NormalHeader";
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

  // Sort data from oldest to newest for the chart
  const sortedChartData = [...(weightData || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: sortedChartData.map((item) =>
      new Date(item.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    ),
    datasets: [
      {
        data: sortedChartData.map((item) => item.weight),
        color: () => "#9747FF", // Purple color
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(151, 71, 255, ${opacity})`, // Purple color
    labelColor: (opacity = 1) => `rgba(90, 90, 90, ${opacity})`,
    propsForDots: { 
      r: "6", 
      strokeWidth: "2", 
      stroke: "#9747FF"
    },
    strokeWidth: 3,
  };

  return (
    <View style={{ flex: 1,  }}>
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, }}
          edges={["left", "right"]}
        >
          <View
            style={{
              paddingHorizontal: 20,
              marginTop: Platform.OS === "ios" ? height * 0.05 : "4%",
            }}
          >
            <NormalHeader screenName="Progress" />
          </View>

              {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <ActivityIndicator color="#67C694" size="large" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Chart Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 20,
                  marginBottom: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: "#F3EDFF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="weight-kilogram"
                        size={18}
                        color="#9747FF"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#1A1A1A",
                          marginBottom: 4,
                        }}
                      >
                        Weight Progress
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#888",
                          fontWeight: "400",
                        }}
                      >
                        Track your weight journey
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      width: 30,
                      height: 3,
                      backgroundColor: "#9747FF",
                      borderRadius: 2,
                    }}
                  />
                </View>

                <View
                  style={{
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  {weightData && weightData.length > 0 ? (
                    <LineChart
                      data={chartData}
                      width={width - 72}
                      height={220}
                      yAxisSuffix="kg"
                      chartConfig={chartConfig}
                      bezier
                      style={{ borderRadius: 16 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: width - 72,
                        height: 220,
                        borderRadius: 16,
                        backgroundColor: "#F9F9F9",
                        justifyContent: "center",
                        alignItems: "center",
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
                          marginBottom: 12,
                        }}
                      >
                        <Ionicons name="bar-chart-outline" size={32} color="#9747FF" />
                      </View>
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        No weight data to display
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Recent Logs Section */}
              {weightData && weightData.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: "#F3EDFF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      <Ionicons name="list-outline" size={18} color="#9747FF" />
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#1A1A1A",
                      }}
                    >
                      Recent Logs
                    </Text>
                  </View>
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

              {(weightData || [])
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((entry, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: 16,
                      borderRadius: 20,
                      marginBottom: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 12,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#1A1A1A",
                          marginBottom: 4,
                        }}
                      >
                        {entry.weight} kg
                      </Text>
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 12,
                          fontWeight: "400",
                        }}
                      >
                        {new Date(entry.date).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteWeight(entry._id || "")}
                      style={{
                        padding: 4,
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              position: "absolute",
              bottom: 24,
              alignSelf: "center",
              backgroundColor: "#67C694",
              borderRadius: 30,
              width: 60,
              height: 60,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#67C694",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
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
                  backgroundColor: "#FFFFFF",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 10,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 3,
                    backgroundColor: "#D0D0D0",
                    borderRadius: 2,
                    alignSelf: "center",
                    marginBottom: 20,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "#F3EDFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="weight"
                      size={18}
                      color="#9747FF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#1A1A1A",
                    }}
                  >
                    Log Your Weight
                  </Text>
                </View>
                <TextInput
                  placeholder="Enter weight (kg)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={newWeight}
                  onChangeText={setNewWeight}
                  style={{
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 15,
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    marginBottom: 20,
                    color: "#1A1A1A",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
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
                    borderRadius: 30,
                    paddingVertical: 14,
                    backgroundColor: addingWeight ? "#D0D0D0" : "#67C694",
                    marginBottom: 12,
                    shadowColor: "#67C694",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: addingWeight ? 0 : 0.4,
                    shadowRadius: 6,
                    elevation: addingWeight ? 0 : 6,
                  }}
                >
                  {addingWeight ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  )}
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "700",
                      fontSize: 15,
                      marginLeft: 8,
                    }}
                  >
                    {addingWeight ? "Saving..." : "Save Entry"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    alignItems: "center",
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#666",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default WeightTrackerScreen;
