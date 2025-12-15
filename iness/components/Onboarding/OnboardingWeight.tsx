import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

const { width: screenWidth } = Dimensions.get("window");

const OnboardingWeight = ({ onNext }: { onNext: () => void }) => {
  const kgOptions = Array.from({ length: 171 }, (_, i) => `${30 + i}`);
  const gramOptions = Array.from({ length: 10 }, (_, i) => `${i * 100}`);

  const [kg, setKg] = useState<string | null>(null);
  const [grams, setGrams] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"kg" | "grams" | null>(null);

  // Load saved weight from AsyncStorage
  useEffect(() => {
    const loadSavedWeight = async () => {
      try {
        const userData = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (userData?.exists && userData.data?.weight) {
          const weightParts = userData.data.weight.split(".");
          if (weightParts.length === 2) {
            setKg(weightParts[0]);
            setGrams(weightParts[1]);
          }
        }
      } catch (error) {
        console.log("Error loading weight:", error);
      }
    };
    loadSavedWeight();
  }, []);

  const handleNext = async () => {
    if (!kg || !grams) {
      setSnackbarMessage("Please select both Kg and Grams");
      setSnackbarVisible(true);
      return;
    }

    const combinedWeight = `${kg}.${grams}`;

    try {
      setLoading(true);
      await asyncStorageUtils.updateUserDataInAsyncStorage({
        weight: combinedWeight,
      });
      setLoading(false);
      onNext();
    } catch (error: any) {
      setLoading(false);
      setSnackbarVisible(true);
      setSnackbarMessage(error.message || "Something went wrong");
    }
  };

  const openModal = (type: "kg" | "grams") => {
    setModalType(type);
    setModalVisible(true);
  };

  const selectValue = (value: string) => {
    if (modalType === "kg") setKg(value);
    if (modalType === "grams") setGrams(value);
    setModalVisible(false);
  };

  const getOptions = () => (modalType === "kg" ? kgOptions : gramOptions);
  const isValid = kg && grams;

  // Calculate display weight
  const displayWeight = kg && grams ? `${kg}.${grams} kg` : "-- kg";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <OnboardingHeading
              icon="scale-bathroom"
              subtitle="We'll use this to track your progress and calculate your needs"
            >
              What is your{"\n"}current weight?
            </OnboardingHeading>

            {/* Weight Display Card - Horizontal */}
            <View style={styles.displayCard}>
              <View style={styles.displayIconContainer}>
                <MaterialCommunityIcons
                  name="weight-kilogram"
                  size={20}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.displayWeight}>{displayWeight}</Text>
            </View>

            {/* Picker Card */}
            <View style={styles.pickerCard}>
              <View style={styles.pickerRow}>
                {/* Kg Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Kilograms</Text>
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      kg && styles.pickerButtonSelected,
                    ]}
                    onPress={() => openModal("kg")}
                  >
                    <MaterialCommunityIcons
                      name="weight"
                      size={Math.min(screenWidth * 0.05, 18)}
                      color={kg ? "#9747FF" : "#888"}
                    />
                    <Text
                      style={[
                        styles.pickerText,
                        kg && styles.pickerTextSelected,
                      ]}
                    >
                      {kg ?? "Select"}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={Math.min(screenWidth * 0.05, 18)}
                      color={kg ? "#9747FF" : "#888"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Decimal Point */}
                <View style={styles.decimalContainer}>
                  <Text style={styles.decimalPoint}>.</Text>
                </View>

                {/* Gram Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Grams</Text>
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      grams && styles.pickerButtonSelected,
                    ]}
                    onPress={() => openModal("grams")}
                  >
                    <MaterialCommunityIcons
                      name="scale"
                      size={Math.min(screenWidth * 0.05, 18)}
                      color={grams ? "#9747FF" : "#888"}
                    />
                    <Text
                      style={[
                        styles.pickerText,
                        grams && styles.pickerTextSelected,
                      ]}
                    >
                      {grams ?? "Select"}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={Math.min(screenWidth * 0.05, 18)}
                      color={grams ? "#9747FF" : "#888"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <View style={styles.tipIconContainer}>
                  <MaterialCommunityIcons
                    name="lightbulb-outline"
                    size={16}
                    color="#9747FF"
                  />
                </View>
                <Text style={styles.tipText}>
                  Weigh yourself in the morning for accurate results
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipIconContainer}>
                  <MaterialCommunityIcons
                    name="refresh"
                    size={16}
                    color="#9747FF"
                  />
                </View>
                <Text style={styles.tipText}>
                  You can update this anytime in settings
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={handleNext}
              disabled={loading || !isValid}
              style={[
                styles.nextButton,
                {
                  backgroundColor: isValid ? "#67C694" : "#E0E0E0",
                },
              ]}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  { color: isValid ? "#FFFFFF" : "#999" },
                ]}
              >
                {loading ? "Saving..." : "Continue"}
              </Text>
              {!loading && (
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={isValid ? "#FFFFFF" : "#999"}
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          </View>

          <CustomSnackbar
            visible={snackbarVisible}
            bgColor="#FF6B6B"
            message={snackbarMessage}
            onDismiss={() => setSnackbarVisible(false)}
          />

          {/* Modal */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Select {modalType === "kg" ? "Kilograms" : "Grams"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={getOptions()}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isItemSelected =
                      (modalType === "kg" && kg === item) ||
                      (modalType === "grams" && grams === item);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.option,
                          isItemSelected && styles.optionSelected,
                        ]}
                        onPress={() => selectValue(item)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isItemSelected && styles.optionTextSelected,
                          ]}
                        >
                          {item} {modalType === "kg" ? "kg" : "g"}
                        </Text>
                        {isItemSelected && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={22}
                            color="#9747FF"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingWeight;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  displayCard: {
    backgroundColor: "#F3EDFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E0F5",
    flexDirection: "row",
    justifyContent: "center",
  },
  displayIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  displayWeight: {
    fontSize: Math.max(screenWidth * 0.07, 24),
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  pickerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Math.min(screenWidth * 0.05, 16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: Math.max(screenWidth * 0.03, 12),
    color: "#666",
    marginBottom: Math.min(screenWidth * 0.025, 8),
    fontFamily: theme.fonts.medium,
    marginLeft: 4,
  },
  pickerButton: {
    borderWidth: 2,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingVertical: Math.min(screenWidth * 0.035, 12),
    paddingHorizontal: Math.min(screenWidth * 0.035, 12),
    backgroundColor: "#F8F9FA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerButtonSelected: {
    borderColor: "#9747FF",
    backgroundColor: "#FAFAFF",
  },
  pickerText: {
    fontSize: Math.max(screenWidth * 0.042, 16),
    color: "#999",
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    fontFamily: theme.fonts.medium,
  },
  pickerTextSelected: {
    color: "#1A1A1A",
  },
  decimalContainer: {
    paddingHorizontal: Math.min(screenWidth * 0.02, 6),
    paddingBottom: Math.min(screenWidth * 0.035, 12),
  },
  decimalPoint: {
    fontSize: Math.max(screenWidth * 0.08, 24),
    fontWeight: "700",
    color: "#9747FF",
  },
  tipsContainer: {
    marginTop: 24,
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    fontFamily: theme.fonts.regular,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
  },
  nextButton: {
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: "60%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  option: {
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionSelected: {
    backgroundColor: "#F3EDFF",
  },
  optionText: {
    fontSize: 17,
    color: "#333",
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  optionTextSelected: {
    color: "#9747FF",
    fontWeight: "600",
  },
});
