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
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const OnboardingWeight = ({ onNext }: { onNext: () => void }) => {
  const theme = useGlobalTheme();
  const kgOptions = Array.from({ length: 171 }, (_, i) => `${30 + i}`);
  const gramOptions = Array.from({ length: 10 }, (_, i) => `${i * 100}`);

  const [kg, setKg] = useState<string | null>(null);
  const [grams, setGrams] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"kg" | "grams" | null>(null);

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
      await asyncStorageUtils.updateUserDataInAsyncStorage({ weight: combinedWeight });
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
  const displayWeight = kg && grams ? `${kg}.${grams} kg` : "-- kg";

  const styles = getStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
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
            <OnboardingHeading
              icon="scale-bathroom"
              subtitle="We'll use this to track your progress and calculate your needs"
            >
              What is your{"\n"}current weight?
            </OnboardingHeading>

            {/* Weight Display */}
            <View style={styles.displayCard}>
              <MaterialCommunityIcons
                name="weight-kilogram"
                size={20}
                color={theme.colors.success}
              />
              <Text style={styles.displayWeight}>{displayWeight}</Text>
            </View>

            {/* Picker Card */}
            <View style={styles.pickerCard}>
              <View style={styles.pickerRow}>
                {/* Kg Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Kilograms</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton, kg && styles.pickerButtonSelected]}
                    onPress={() => openModal("kg")}
                  >
                    <Text style={[styles.pickerText, kg && styles.pickerTextSelected]}>
                      {kg ?? "Select"}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color={kg ? theme.colors.success : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.decimalContainer}>
                  <Text style={styles.decimalPoint}>.</Text>
                </View>

                {/* Grams Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Grams</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton, grams && styles.pickerButtonSelected]}
                    onPress={() => openModal("grams")}
                  >
                    <Text style={[styles.pickerText, grams && styles.pickerTextSelected]}>
                      {grams ?? "Select"}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color={grams ? theme.colors.success : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={16}
                  color={theme.colors.success}
                />
                <Text style={styles.tipText}>
                  Weigh yourself in the morning for accurate results
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
                { backgroundColor: isValid ? theme.colors.success : theme.colors.lightGrey },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.nextButtonText, { color: isValid ? "#FFFFFF" : theme.colors.textMuted }]}>
                {loading ? "Saving..." : "Continue"}
              </Text>
              {!loading && (
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={isValid ? "#FFFFFF" : theme.colors.textMuted}
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          </View>

          <CustomSnackbar
            visible={snackbarVisible}
            bgColor={theme.colors.error}
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
                    <MaterialCommunityIcons name="close" size={22} color={theme.colors.textSecondary} />
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
                        style={[styles.option, isItemSelected && styles.optionSelected]}
                        onPress={() => selectValue(item)}
                      >
                        <Text style={[styles.optionText, isItemSelected && styles.optionTextSelected]}>
                          {item} {modalType === "kg" ? "kg" : "g"}
                        </Text>
                        {isItemSelected && (
                          <MaterialCommunityIcons name="check-circle" size={22} color={theme.colors.success} />
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

const getStyles = (theme: any) => StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  displayCard: {
    backgroundColor: theme.colors.greenLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  displayWeight: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginLeft: 12,
  },
  pickerCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontFamily: theme.fonts.medium,
    marginLeft: 4,
  },
  pickerButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerButtonSelected: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.greenLight,
  },
  pickerText: {
    fontSize: 17,
    color: theme.colors.textMuted,
    fontWeight: "600",
    fontFamily: theme.fonts.medium,
  },
  pickerTextSelected: {
    color: theme.colors.text,
  },
  decimalContainer: {
    paddingHorizontal: 8,
    paddingBottom: 14,
  },
  decimalPoint: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.success,
  },
  tipsContainer: {
    marginTop: 24,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.greenLight,
    borderRadius: 12,
    padding: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    marginLeft: 12,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
  },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: "60%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.lightGrey,
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
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  option: {
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionSelected: {
    backgroundColor: theme.colors.greenLight,
  },
  optionText: {
    fontSize: 17,
    color: theme.colors.text,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  optionTextSelected: {
    color: theme.colors.success,
    fontWeight: "600",
  },
});

export default OnboardingWeight;
