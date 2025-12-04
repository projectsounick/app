import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomSnackbar from "@/app/modules/Snackbar";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { Ionicons } from "@expo/vector-icons";

const OnboardingDOB = ({ onNext }: { onNext: () => void }) => {
  const [dob, setDob] = useState(new Date(1990, 0, 1));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    setDob(date);
    hideDatePicker();
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      await asyncStorageUtils.updateUserDataInAsyncStorage({ dob });
      setLoading(false);
      onNext();
    } catch (error: any) {
      setLoading(false);
      setSnackbarVisible(true);
      setSnackbarMessage(error.message || "Failed to save DOB");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 20,
              paddingTop: 20,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top content */}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <OnboardingHeading>
                What is your{`\n`}date of birth?
              </OnboardingHeading>

              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 30,
                  width: "100%",
                  marginTop: 20,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <TouchableOpacity
                  onPress={showDatePicker}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#F8F8F8",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#000",
                      fontWeight: "500",
                    }}
                  >
                    {dob.toLocaleDateString("en-GB")}
                  </Text>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#9747FF" />
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>DD/MM/YYYY</Text>
            </View>
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
              disabled={loading}
              style={{
                backgroundColor: loading ? "#E0E0E0" : "#67C694",
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
                    color: loading ? "#999" : "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Next
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Modal Picker */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={dob}
            maximumDate={new Date()}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          <CustomSnackbar
            visible={snackbarVisible}
            bgColor="#FF6B6B"
            message={snackbarMessage}
            onDismiss={() => setSnackbarVisible(false)}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default OnboardingDOB;
