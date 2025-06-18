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
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import CustomSnackbar from "@/app/modules/Snackbar";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import theme from "@/app/Theme/globalTheme";

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
          {/* Top content */}
          <View style={styles.content}>
            <Text style={styles.title}>What is your{`\n`}date of birth?</Text>
            <Text style={styles.hint}>DD/MM/YYYY</Text>

            <TouchableOpacity onPress={showDatePicker} style={styles.dobBox}>
              <Text style={styles.dobText}>
                {dob.toLocaleDateString("en-GB")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom fixed button */}
          <View style={styles.bottomButton}>
            <AnimatedSubmitButton
              loading={loading}
              onPress={handleNext}
              title="Next"
            />
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
            bgColor={theme.colors.red}
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  content: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: "#7D4CFF",
    fontWeight: "600",
  },
  dobBox: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dobText: {
    fontSize: 18,
    color: "#000",
  },
  bottomButton: {
    paddingBottom: 30,
  },
});

export default OnboardingDOB;
