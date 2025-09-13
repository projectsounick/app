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

const OnboardingHeight = ({ onNext }: { onNext: () => void }) => {
  const [heightFeet, setHeightFeet] = useState<string | null>(null);
  const [heightInches, setHeightInches] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"feet" | "inches" | null>(null);

  const feetOptions = Array.from({ length: 4 }, (_, i) => `${4 + i}`);
  const inchOptions = Array.from({ length: 12 }, (_, i) => `${i}`);

  const handleNext = async () => {
    if (!heightFeet || !heightInches) {
      setSnackbarMessage("Please select both feet and inches.");
      setSnackbarVisible(true);
      return;
    }

    const formattedHeight = `${heightFeet}'${heightInches}`;

    try {
      setLoading(true);
      await asyncStorageUtils.updateUserDataInAsyncStorage({
        height: formattedHeight,
      });
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
            <OnboardingHeading>What is your{`\n`}height?</OnboardingHeading>

            <View style={styles.pickerRow}>
              {/* Feet Picker */}
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openModal("feet")}
              >
                <Text style={styles.pickerText}>
                  {heightFeet ?? "Select ft"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.unit}>ft</Text>

              {/* Inches Picker */}
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openModal("inches")}
              >
                <Text style={styles.pickerText}>
                  {heightInches ?? "Select in"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.unit}>in</Text>
            </View>

            <Text style={styles.hintText}>
              Select your height (e.g. 5 feet 10 inches)
            </Text>
          </ScrollView>

          <View style={styles.bottomButton}>
            <AnimatedSubmitButton
              loading={loading}
              onPress={handleNext}
              height={50}
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
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "flex-end",
              }}
            >
              {/* Bottom sheet container */}
              <View
                style={{
                  backgroundColor: "#fff",
                  maxHeight: "60%",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingHorizontal: 20,
                  paddingTop: 10,
                  paddingBottom: 20,
                }}
              >
                {/* Handle dash (inline) */}
                <View
                  style={{
                    width: 50,
                    height: 5,
                    backgroundColor: "#ccc",
                    borderRadius: 3,
                    alignSelf: "center",
                    marginBottom: 10,
                  }}
                />

                {/* Title */}
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: theme.fonts.bold,
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  Select {modalType === "feet" ? "Feet" : "Inches"}
                </Text>

                {/* Options list */}
                <FlatList
                  data={getOptions()}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        paddingVertical: 15,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                      }}
                      onPress={() => selectValue(item)}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: "center",
                          fontFamily: theme.fonts.medium,
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                {/* Cancel button */}
                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    paddingVertical: 15,
                    backgroundColor: "#FF4D4D",
                    borderRadius: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontFamily: theme.fonts.bold,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingHeight;

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
    fontFamily: theme.fonts.medium,
  },
  unit: {
    marginHorizontal: 8,
    fontSize: 18,
    color: "#7D4CFF",
    fontFamily: theme.fonts.bold,
  },
  hintText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    fontFamily: theme.fonts.regular,
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
