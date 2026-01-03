import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { height } = Dimensions.get("window");

export default function CalculatorScreen() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
                  <Ionicons name="body-outline" size={20} color={theme.colors.secondPrimary} />
                </View>
                <Text style={styles.cardTitle}>BMI Calculator</Text>
                <TouchableOpacity
                  onPress={() => showInfo("bmi")}
                  style={styles.infoBtn}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={theme.colors.secondPrimary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <TextInput
                  placeholder="Height (cm)"
                  placeholderTextColor={theme.colors.textMuted}
                  value={heightValue}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Weight (kg)"
                  placeholderTextColor={theme.colors.textMuted}
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
                    color={theme.colors.secondPrimary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <TextInput
                  placeholder="Age"
                  placeholderTextColor={theme.colors.textMuted}
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
                      color={gender === "male" ? theme.colors.textWhite : theme.colors.secondPrimary}
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
                      color={gender === "female" ? theme.colors.textWhite : theme.colors.secondPrimary}
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
                      color={theme.colors.secondPrimary}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={20} color={theme.colors.text} />
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
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
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
    backgroundColor: theme.colors.backgroundCardLight,
    borderRadius: 12,
    gap: 8,
  },
  genderBtnSelected: {
    backgroundColor: theme.colors.secondPrimary,
  },
  genderBtnText: {
    color: theme.colors.secondPrimary,
    fontWeight: "600",
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.medium,
  },
  genderBtnTextSelected: {
    color: theme.colors.textWhite,
  },
  calculateBtn: {
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  calculateBtnText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.medium as "500",
    fontSize: theme.fontSizes.regular,
    fontFamily: theme.fonts.bold,
  },
  resultContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.textMuted,
    marginBottom: 6,
    fontFamily: theme.fonts.regular,
  },
  resultValue: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
  },
  resultHint: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.success,
    marginTop: 4,
    fontFamily: theme.fonts.medium,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.mediumGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: theme.fonts.regular,
  },
  disclaimerSection: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  disclaimerTitle: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 6,
    fontFamily: theme.fonts.bold,
  },
  disclaimerText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    fontFamily: theme.fonts.regular,
  },
  citationSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  citationTitle: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 10,
    fontFamily: theme.fonts.bold,
  },
  citationItem: {
    marginBottom: 10,
  },
  citationText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: theme.fonts.regular,
  },
  citationLink: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.success,
    fontWeight: theme.fontWeights.medium as "500",
    fontFamily: theme.fonts.medium,
  },
  viewAllCitationsBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.backgroundCardLight,
    borderRadius: 12,
    alignItems: "center",
  },
  viewAllCitationsText: {
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
  },
  modalCloseButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.medium as "500",
    fontSize: theme.fontSizes.regular,
    fontFamily: theme.fonts.bold,
  },
});
