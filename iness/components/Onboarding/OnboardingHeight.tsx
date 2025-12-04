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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
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

            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 24,
                marginTop: 20,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
            >
              <View style={styles.pickerRow}>
                {/* Feet Picker */}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Feet
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => openModal("feet")}
                  >
                    <Text style={styles.pickerText}>
                      {heightFeet ?? "Select"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9747FF" />
                  </TouchableOpacity>
                </View>

                {/* Inches Picker */}
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Inches
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => openModal("inches")}
                  >
                    <Text style={styles.pickerText}>
                      {heightInches ?? "Select"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9747FF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.hintText}>
              Select your height (e.g. 5 feet 10 inches)
            </Text>
          </ScrollView>

          {/* Bottom Button - Always at bottom */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 30,
              paddingTop: 20,
              backgroundColor: "transparent",
            }}
          >
            <TouchableOpacity
              onPress={handleNext}
              disabled={loading || !heightFeet || !heightInches}
              style={{
                backgroundColor:
                  loading || !heightFeet || !heightInches
                    ? "#E0E0E0"
                    : "#67C694",
                borderRadius: 30,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  style={{
                    color:
                      loading || !heightFeet || !heightInches
                        ? "#999"
                        : "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Next
                </Text>
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
                <View
                  style={{
                    width: 50,
                    height: 5,
                    backgroundColor: "#ccc",
                    borderRadius: 3,
                    alignSelf: "center",
                    marginBottom: 15,
                    marginTop: 10,
                  }}
                />
                <Text style={styles.modalTitle}>
                  Select {modalType === "feet" ? "Feet" : "Inches"}
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

export default OnboardingHeight;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F8F8F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  hintText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    padding: 15,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    color: "#000",
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: "#67C694",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
  },
});
