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

const OnboardingHeight = ({ onNext }: { onNext: () => void }) => {
  const theme = useGlobalTheme();
  const [heightFeet, setHeightFeet] = useState<string | null>(null);
  const [heightInches, setHeightInches] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"feet" | "inches" | null>(null);

  const feetOptions = Array.from({ length: 4 }, (_, i) => `${4 + i}`);
  const inchOptions = Array.from({ length: 12 }, (_, i) => `${i}`);

  useEffect(() => {
    const loadSavedHeight = async () => {
      try {
        const userData = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (userData?.exists && userData.data?.height) {
          const heightMatch = userData.data.height.match(/(\d+)'(\d+)/);
          if (heightMatch) {
            setHeightFeet(heightMatch[1]);
            setHeightInches(heightMatch[2]);
          }
        }
      } catch (error) {
        console.log("Error loading height:", error);
      }
    };
    loadSavedHeight();
  }, []);

  const handleNext = async () => {
    if (!heightFeet || !heightInches) {
      setSnackbarMessage("Please select both feet and inches.");
      setSnackbarVisible(true);
      return;
    }

    const formattedHeight = `${heightFeet}'${heightInches}`;

    try {
      setLoading(true);
      await asyncStorageUtils.updateUserDataInAsyncStorage({ height: formattedHeight });
      setLoading(false);
      onNext();
    } catch (error: any) {
      setLoading(false);
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
    }
  };

  const openModal = (type: "feet" | "inches") => {
    setModalType(type);
    setModalVisible(true);
  };

  const selectValue = (value: string) => {
    if (modalType === "feet") setHeightFeet(value);
    if (modalType === "inches") setHeightInches(value);
    setModalVisible(false);
  };

  const getOptions = () => (modalType === "feet" ? feetOptions : inchOptions);
  const isValid = heightFeet && heightInches;
  const displayHeight = heightFeet && heightInches ? `${heightFeet}'${heightInches}"` : `--'--"`;

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
              icon="human-male-height"
              subtitle="We use this to calculate your BMI and personalize recommendations"
            >
              What is your{"\n"}height?
            </OnboardingHeading>

            {/* Height Display */}
            <View style={styles.displayCard}>
              <MaterialCommunityIcons
                name="ruler"
                size={20}
                color={theme.colors.success}
              />
              <Text style={styles.displayHeight}>{displayHeight}</Text>
            </View>

            {/* Picker Card */}
            <View style={styles.pickerCard}>
              <View style={styles.pickerRow}>
                {/* Feet Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Feet</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton, heightFeet && styles.pickerButtonSelected]}
                    onPress={() => openModal("feet")}
                  >
                    <Text style={[styles.pickerText, heightFeet && styles.pickerTextSelected]}>
                      {heightFeet ?? "Select"}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color={heightFeet ? theme.colors.success : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.separatorContainer}>
                  <Text style={styles.separatorText}>'</Text>
                </View>

                {/* Inches Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Inches</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton, heightInches && styles.pickerButtonSelected]}
                    onPress={() => openModal("inches")}
                  >
                    <Text style={[styles.pickerText, heightInches && styles.pickerTextSelected]}>
                      {heightInches ?? "Select"}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color={heightInches ? theme.colors.success : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={theme.colors.success}
              />
              <Text style={styles.infoText}>
                Height helps us calculate your ideal weight range and customize workout intensity
              </Text>
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
                    Select {modalType === "feet" ? "Feet" : "Inches"}
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
                      (modalType === "feet" && heightFeet === item) ||
                      (modalType === "inches" && heightInches === item);
                    return (
                      <TouchableOpacity
                        style={[styles.option, isItemSelected && styles.optionSelected]}
                        onPress={() => selectValue(item)}
                      >
                        <Text style={[styles.optionText, isItemSelected && styles.optionTextSelected]}>
                          {item} {modalType === "feet" ? "ft" : "in"}
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
  displayHeight: {
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
  separatorContainer: {
    paddingHorizontal: 8,
    paddingBottom: 14,
  },
  separatorText: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.success,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.greenLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
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

export default OnboardingHeight;
