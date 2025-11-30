import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");
const topPadding = height * 0.05; // 2% of screen height
export default function CalculatorScreen() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [modalContent, setModalContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h && w) {
      const bmiValue = w / (h * h);
      setBmi(bmiValue);
    }
  };

  const calculateBMR = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    if (h && w && a) {
      const bmrValue =
        gender === "male"
          ? 10 * w + 6.25 * h - 5 * a + 5
          : 10 * w + 6.25 * h - 5 * a - 161;
      setBmr(bmrValue);
    }
  };

  const showInfo = (type: "bmi" | "bmr") => {
    if (type === "bmi") {
      setModalContent(
        "BMI (Body Mass Index) is a measure that uses your height and weight to estimate if your weight is healthy."
      );
    } else {
      setModalContent(
        "BMR (Basal Metabolic Rate) is the number of calories your body needs to perform basic life-sustaining functions."
      );
    }
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f2f2f2" }}
          edges={[ "left", "right"]}
        >
          <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="Health Calculator" />
          </View>

          <View style={{ padding: 20, paddingBottom: 40 }}>
            {/* BMI Calculator */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
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
                  marginBottom: 12,
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
                  <Ionicons name="calculator" size={18} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#000",
                    flex: 1,
                  }}
                >
                  BMI Calculator
                </Text>
                <TouchableOpacity onPress={() => showInfo("bmi")}>
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color="#9747FF"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: "#F0F0F0",
                }}
              >
                <TextInput
                  placeholder="Height (cm)"
                  placeholderTextColor="#999"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: "#F8F8F8",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    fontSize: 15,
                    color: "#000",
                  }}
                />
                <TextInput
                  placeholder="Weight (kg)"
                  placeholderTextColor="#999"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: "#F8F8F8",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    fontSize: 15,
                    color: "#000",
                  }}
                />

                <TouchableOpacity
                  onPress={calculateBMI}
                  style={{
                    backgroundColor: "#67C694",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    Calculate BMI
                  </Text>
                </TouchableOpacity>

                {bmi && (
                  <View
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#F0F0F0",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#666",
                        marginBottom: 4,
                      }}
                    >
                      Your BMI is:
                    </Text>
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: "#9747FF",
                      }}
                    >
                      {bmi.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* BMR Calculator */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
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
                  marginBottom: 12,
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
                  <Ionicons name="flame" size={18} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#000",
                    flex: 1,
                  }}
                >
                  BMR Calculator
                </Text>
                <TouchableOpacity onPress={() => showInfo("bmr")}>
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color="#9747FF"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: "#F0F0F0",
                }}
              >
                <TextInput
                  placeholder="Age"
                  placeholderTextColor="#999"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: "#F8F8F8",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    fontSize: 15,
                    color: "#000",
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 14,
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setGender("male")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor:
                        gender === "male" ? "#9747FF" : "#F8F8F8",
                      borderRadius: 12,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor:
                        gender === "male" ? "#9747FF" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: gender === "male" ? "#FFFFFF" : "#333",
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setGender("female")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor:
                        gender === "female" ? "#9747FF" : "#F8F8F8",
                      borderRadius: 12,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor:
                        gender === "female" ? "#9747FF" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: gender === "female" ? "#FFFFFF" : "#333",
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={calculateBMR}
                  style={{
                    backgroundColor: "#67C694",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    Calculate BMR
                  </Text>
                </TouchableOpacity>

                {bmr && (
                  <View
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#F0F0F0",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#666",
                        marginBottom: 4,
                      }}
                    >
                      Your BMR is:
                    </Text>
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: "#9747FF",
                      }}
                    >
                      {bmr.toFixed(0)} kcal/day
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: 24,
                  borderRadius: 20,
                  width: "90%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#9747FF",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#333",
                    textAlign: "center",
                    lineHeight: 22,
                    marginBottom: 20,
                  }}
                >
                  {modalContent}
                </Text>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={{
                    backgroundColor: "#67C694",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
