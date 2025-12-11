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
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import theme from "@/app/Theme/globalTheme";

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
  const [infoType, setInfoType] = useState<"bmi" | "bmr" | null>(null);

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

  const closeModal = () => {
    setModalVisible(false);
    setInfoType(null);
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
            <NormalHeader screenName="Fitness Tools" />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* BMI Calculator Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="body-outline" size={20} color="#9747FF" />
                </View>
                <Text style={styles.cardTitle}>BMI Calculator</Text>
                <TouchableOpacity
                  onPress={() => showInfo("bmi")}
                  style={styles.infoBtn}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#9747FF"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <TextInput
                  placeholder="Height (cm)"
                  placeholderTextColor="#999"
                  value={heightValue}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Weight (kg)"
                  placeholderTextColor="#999"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <TouchableOpacity
                  onPress={calculateBMI}
                  style={styles.calculateBtn}
                >
                  <Text style={styles.calculateBtnText}>Calculate BMI</Text>
                </TouchableOpacity>

                {bmi && (
                  <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Your BMI is:</Text>
                    <Text style={styles.resultValue}>{bmi.toFixed(2)}</Text>
                    <Text style={styles.resultHint}>
                      {bmi < 18.5
                        ? "Underweight"
                        : bmi < 25
                          ? "Normal weight"
                          : bmi < 30
                            ? "Overweight"
                            : "Obese"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* BMR Calculator Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="flame-outline" size={20} color="#9747FF" />
                </View>
                <Text style={styles.cardTitle}>BMR Calculator</Text>
                <TouchableOpacity
                  onPress={() => showInfo("bmr")}
                  style={styles.infoBtn}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#9747FF"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <TextInput
                  placeholder="Age"
                  placeholderTextColor="#999"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  style={styles.input}
                />

                {/* Gender Selection */}
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    onPress={() => setGender("male")}
                    style={[
                      styles.genderBtn,
                      gender === "male" && styles.genderBtnSelected,
                    ]}
                  >
                    <Ionicons
                      name="male"
                      size={18}
                      color={gender === "male" ? "#FFFFFF" : "#9747FF"}
                    />
                    <Text
                      style={[
                        styles.genderBtnText,
                        gender === "male" && styles.genderBtnTextSelected,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setGender("female")}
                    style={[
                      styles.genderBtn,
                      gender === "female" && styles.genderBtnSelected,
                    ]}
                  >
                    <Ionicons
                      name="female"
                      size={18}
                      color={gender === "female" ? "#FFFFFF" : "#9747FF"}
                    />
                    <Text
                      style={[
                        styles.genderBtnText,
                        gender === "female" && styles.genderBtnTextSelected,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={calculateBMR}
                  style={styles.calculateBtn}
                >
                  <Text style={styles.calculateBtnText}>Calculate BMR</Text>
                </TouchableOpacity>

                {bmr && (
                  <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Your BMR is:</Text>
                    <Text style={styles.resultValue}>
                      {bmr.toFixed(0)} kcal/day
                    </Text>
                    <Text style={styles.resultHint}>
                      Calories your body burns at rest
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Info Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons
                      name="information-circle"
                      size={28}
                      color="#9747FF"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={20} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                >
                  <Text style={styles.modalText}>{modalContent}</Text>

                  {/* Disclaimer */}
                  <View style={styles.disclaimerSection}>
                    <Text style={styles.disclaimerTitle}>Disclaimer:</Text>
                    <Text style={styles.disclaimerText}>
                      The health calculations provided in this app are for
                      informational purposes only and are not intended as
                      medical advice, diagnosis, or treatment. Always consult
                      with a qualified healthcare provider.
                    </Text>
                  </View>

                  {/* Citations */}
                  <View style={styles.citationSection}>
                    <Text style={styles.citationTitle}>
                      Sources & Citations:
                    </Text>

                    {infoType === "bmi" ? (
                      <View style={styles.citationItem}>
                        <Text style={styles.citationText}>
                          <Text style={{ fontWeight: "600" }}>
                            BMI Formula:{" "}
                          </Text>
                          World Health Organization (WHO)
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            openCitation(
                              "https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations"
                            )
                          }
                        >
                          <Text style={styles.citationLink}>
                            View WHO BMI Guidelines →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.citationItem}>
                        <Text style={styles.citationText}>
                          <Text style={{ fontWeight: "600" }}>
                            BMR Formula:{" "}
                          </Text>
                          Mifflin-St Jeor Equation (Mifflin et al., 1990)
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            openCitation(
                              "https://pubmed.ncbi.nlm.nih.gov/2305711/"
                            )
                          }
                        >
                          <Text style={styles.citationLink}>
                            View Research Paper →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => {
                        closeModal();
                        router.push({
                          pathname: "/dashboard/medicalcitations",
                        } as any);
                      }}
                      style={styles.viewAllCitationsBtn}
                    >
                      <Text style={styles.viewAllCitationsText}>
                        View Full Citations & References →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <Pressable onPress={closeModal} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: theme.fonts.regular,
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F3EDFF",
    borderRadius: 12,
    gap: 8,
  },
  genderBtnSelected: {
    backgroundColor: "#9747FF",
  },
  genderBtnText: {
    color: "#9747FF",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: theme.fonts.medium,
  },
  genderBtnTextSelected: {
    color: "#FFFFFF",
  },
  calculateBtn: {
    backgroundColor: "#67C694",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  calculateBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
    fontFamily: theme.fonts.bold,
  },
  resultContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888",
    marginBottom: 6,
    fontFamily: theme.fonts.regular,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#9747FF",
    fontFamily: theme.fonts.bold,
  },
  resultHint: {
    fontSize: 12,
    color: "#67C694",
    marginTop: 4,
    fontFamily: theme.fonts.medium,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: theme.fonts.regular,
  },
  disclaimerSection: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
    fontFamily: theme.fonts.bold,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    fontFamily: theme.fonts.regular,
  },
  citationSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  citationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
    fontFamily: theme.fonts.bold,
  },
  citationItem: {
    marginBottom: 10,
  },
  citationText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: theme.fonts.regular,
  },
  citationLink: {
    fontSize: 12,
    color: "#67C694",
    fontWeight: "600",
    fontFamily: theme.fonts.medium,
  },
  viewAllCitationsBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#F3EDFF",
    borderRadius: 12,
    alignItems: "center",
  },
  viewAllCitationsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9747FF",
    fontFamily: theme.fonts.medium,
  },
  modalCloseButton: {
    backgroundColor: "#67C694",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
    fontFamily: theme.fonts.bold,
  },
});
