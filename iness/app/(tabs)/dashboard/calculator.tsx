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
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");

export default function CalculatorScreen() {
  const [heightValue, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [modalContent, setModalContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [citationsModalVisible, setCitationsModalVisible] = useState(false);

  const calculateBMI = () => {
    const h = parseFloat(heightValue) / 100;
    const w = parseFloat(weight);
    if (h && w) {
      const bmiValue = w / (h * h);
      setBmi(bmiValue);
    }
  };

  const calculateBMR = () => {
    const h = parseFloat(heightValue);
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

  const [infoType, setInfoType] = useState<"bmi" | "bmr" | null>(null);

  const showInfo = (type: "bmi" | "bmr") => {
    setInfoType(type);
    if (type === "bmi") {
      setModalContent(
        "BMI (Body Mass Index) is a measure that uses your height and weight to estimate if your weight is healthy. This is a general indicator and should not be used as a substitute for professional medical advice."
      );
    } else {
      setModalContent(
        "BMR (Basal Metabolic Rate) is the number of calories your body needs to perform basic life-sustaining functions. This calculation uses the Mifflin-St Jeor Equation. Results are estimates and should not replace professional medical consultation."
      );
    }
    setModalVisible(true);
  };

  const openCitation = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: Platform.OS === "ios" ? "14%" : "4%",
            }}
          >
            <NormalHeader screenName="Health Calculator" />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* BMI Calculator */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
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
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#E3F2FD",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="calculator-outline" size={22} color="#9747FF" />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#000",
                    flex: 1,
                  }}
                >
                  BMI Calculator
                </Text>
                <TouchableOpacity onPress={() => showInfo("bmi")}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="#9747FF"
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: "#F5F5F5",
                }}
              >
                <TextInput
                  placeholder="Height (cm)"
                  placeholderTextColor="#999"
                  value={heightValue}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: "#F8F8F8",
                    borderRadius: 16,
                    padding: 16,
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
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
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
                    paddingVertical: 16,
                    borderRadius: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    Calculate BMI
                  </Text>
                </TouchableOpacity>

                {bmi && (
                  <View
                    style={{
                      marginTop: 20,
                      paddingTop: 20,
                      borderTopWidth: 1,
                      borderTopColor: "#F5F5F5",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#666",
                        marginBottom: 8,
                      }}
                    >
                      Your BMI is:
                    </Text>
                    <Text
                      style={{
                        fontSize: 32,
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
                padding: 20,
                marginBottom: 16,
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
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#FFEBEE",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="flame-outline" size={22} color="#FF6B6B" />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#000",
                    flex: 1,
                  }}
                >
                  BMR Calculator
                </Text>
                <TouchableOpacity onPress={() => showInfo("bmr")}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="#9747FF"
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: "#F5F5F5",
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
                    borderRadius: 16,
                    padding: 16,
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
                    marginBottom: 16,
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setGender("male")}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      backgroundColor:
                        gender === "male" ? "#9747FF" : "#F8F8F8",
                      borderRadius: 16,
                      alignItems: "center",
                      borderWidth: gender === "male" ? 0 : 1,
                      borderColor: "#E0E0E0",
                    }}
                  >
                    <Text
                      style={{
                        color: gender === "male" ? "#FFFFFF" : "#333",
                        fontWeight: "600",
                        fontSize: 15,
                      }}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setGender("female")}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      backgroundColor:
                        gender === "female" ? "#9747FF" : "#F8F8F8",
                      borderRadius: 16,
                      alignItems: "center",
                      borderWidth: gender === "female" ? 0 : 1,
                      borderColor: "#E0E0E0",
                    }}
                  >
                    <Text
                      style={{
                        color: gender === "female" ? "#FFFFFF" : "#333",
                        fontWeight: "600",
                        fontSize: 15,
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
                    paddingVertical: 16,
                    borderRadius: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    Calculate BMR
                  </Text>
                </TouchableOpacity>

                {bmr && (
                  <View
                    style={{
                      marginTop: 20,
                      paddingTop: 20,
                      borderTopWidth: 1,
                      borderTopColor: "#F5F5F5",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#666",
                        marginBottom: 8,
                      }}
                    >
                      Your BMR is:
                    </Text>
                    <Text
                      style={{
                        fontSize: 32,
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
          </ScrollView>

          {/* Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => {
              setModalVisible(false);
              setInfoType(null);
            }}
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
                  maxHeight: "80%",
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: "#E3F2FD",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="information-circle"
                      size={28}
                      color="#9747FF"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setInfoType(null);
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" size={20} color="#000" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: "#333",
                      textAlign: "left",
                      lineHeight: 22,
                      marginBottom: 20,
                    }}
                  >
                    {modalContent}
                  </Text>

                  {/* Disclaimer */}
                  <View
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#F5F5F5",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#000",
                        marginBottom: 8,
                      }}
                    >
                      Disclaimer:
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#666",
                        lineHeight: 20,
                        marginBottom: 16,
                      }}
                    >
                      The health calculations provided in this app are for
                      informational purposes only and are not intended as medical
                      advice, diagnosis, or treatment. Always consult with a
                      qualified healthcare provider before making any health-related
                      decisions.
                    </Text>
                  </View>

                  {/* Citations */}
                  <View
                    style={{
                      marginTop: 8,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#F5F5F5",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#000",
                        marginBottom: 12,
                      }}
                    >
                      Sources & Citations:
                    </Text>

                    {infoType === "bmi" ? (
                      <View style={{ marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#666",
                            marginBottom: 6,
                            lineHeight: 20,
                          }}
                        >
                          <Text style={{ fontWeight: "600" }}>BMI Formula: </Text>
                          World Health Organization (WHO)
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            openCitation(
                              "https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations"
                            )
                          }
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#67C694",
                              fontWeight: "600",
                              textDecorationLine: "underline",
                            }}
                          >
                            View WHO BMI Guidelines →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{ marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#666",
                            marginBottom: 6,
                            lineHeight: 20,
                          }}
                        >
                          <Text style={{ fontWeight: "600" }}>BMR Formula: </Text>
                          Mifflin-St Jeor Equation (Mifflin et al., 1990)
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            openCitation(
                              "https://pubmed.ncbi.nlm.nih.gov/2305711/"
                            )
                          }
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#67C694",
                              fontWeight: "600",
                              textDecorationLine: "underline",
                            }}
                          >
                            View Research Paper →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false);
                        setInfoType(null);
                        router.push({
                          pathname: "/dashboard/medicalcitations",
                        } as any);
                      }}
                      style={{
                        marginTop: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: "#F8F8F8",
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "#E0E0E0",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: "#9747FF",
                        }}
                      >
                        View Full Citations & References →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <Pressable
                  onPress={() => {
                    setModalVisible(false);
                    setInfoType(null);
                  }}
                  style={{
                    backgroundColor: "#67C694",
                    paddingVertical: 16,
                    borderRadius: 30,
                    alignItems: "center",
                    marginTop: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "700",
                      fontSize: 16,
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
