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
import { AntDesign, MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
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
        color: () => "#9747FF",
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(151, 71, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(90, 90, 90, ${opacity})`,
    propsForDots: { r: "6", strokeWidth: "2", stroke: "#9747FF" },
    strokeWidth: 3,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f2f2f2" }}
          edges={["left", "right"]}
        >
          <View
            style={{
              paddingLeft: 20,
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
              <ActivityIndicator color="#9747FF" size="large" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
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
                      borderRadius: 18,
                      backgroundColor: "#9747FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="weight-kilogram"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                    }}
                  >
                    Weight Progress
                  </Text>
                </View>

                <View
                  style={{
                    paddingTop: 10,
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
                        backgroundColor: "#F8F8F8",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="bar-chart-outline" size={48} color="#999" />
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 14,
                          marginTop: 12,
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
                    Recent Logs
                  </Text>
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
                      borderRadius: 16,
                      marginBottom: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
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
                          fontSize: 20,
                          fontWeight: "700",
                          color: "#9747FF",
                          marginBottom: 4,
                        }}
                      >
                        {entry.weight} kg
                      </Text>
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 13,
                          marginTop: 2,
                        }}
                      >
                        {new Date(entry.date).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleDeleteWeight(entry._id || "")}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#FFF5F5",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AntDesign name="delete" size={18} color="#FF4D4D" />
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={20} color="#9747FF" />
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
              backgroundColor: "#67C694",
              borderRadius: 50,
              width: 56,
              height: 56,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
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
                    height: 4,
                    backgroundColor: "#000000",
                    borderRadius: 2,
                    alignSelf: "center",
                    marginBottom: 20,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#9747FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="weight"
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#000",
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
                    borderColor: "#E0E0E0",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 15,
                    width: "100%",
                    backgroundColor: "#F8F8F8",
                    marginBottom: 20,
                    color: "#000",
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
                    backgroundColor: addingWeight ? "#CCCCCC" : "#67C694",
                    marginBottom: 12,
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
                      fontWeight: "600",
                      fontSize: 16,
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
                      color: "#9747FF",
                      fontWeight: "600",
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
      </ImageBackground>
    </View>
  );
};

export default WeightTrackerScreen;
