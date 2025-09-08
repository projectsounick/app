import React, { useState } from "react";
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
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

const OnboardingWeight = ({ onNext }: { onNext: () => void }) => {
  // Options
  const kgOptions = Array.from({ length: 171 }, (_, i) => `${30 + i}`);
  const gramOptions = Array.from({ length: 10 }, (_, i) => `${i * 100}`);

  // State
  const [kg, setKg] = useState<string | null>(null);
  const [grams, setGrams] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"kg" | "grams" | null>(null);

  // Handlers
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
          >
            <OnboardingHeading>
              <Text style={styles.title}>What is your{`\n`}weight?</Text>
            </OnboardingHeading>

            <View style={styles.pickerRow}>
              {/* Kg Picker */}
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openModal("kg")}
              >
                <Text style={styles.pickerText}>{kg ?? "Select kg"}</Text>
              </TouchableOpacity>
              <Text style={styles.unit}>Kg</Text>

              {/* Gram Picker */}
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openModal("grams")}
              >
                <Text style={styles.pickerText}>{grams ?? "Select g"}</Text>
              </TouchableOpacity>
              <Text style={styles.unit}>g</Text>
            </View>

            <Text style={styles.hintText}>
              Select your weight (e.g. 80 kg 300 g)
            </Text>
          </ScrollView>

          <View style={styles.bottomButton}>
            <AnimatedSubmitButton
              loading={loading}
              onPress={handleNext}
              title="Next"
            />
          </View>

          <CustomSnackbar
            visible={snackbarVisible}
            bgColor={theme.colors.red}
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
                <Text style={styles.modalTitle}>
                  Select {modalType === "kg" ? "Kg" : "Grams"}
                </Text>
                <FlatList
                  data={getOptions()}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => selectValue(item)}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: "center",
  },
  pickerText: {
    fontSize: 18,
    color: "#000",
  },
  unit: {
    marginHorizontal: 8,
    fontSize: 18,
    color: "#7D4CFF",
    fontWeight: "bold",
  },
  hintText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
  bottomButton: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    padding: 15,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: "#ff4d4d",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
