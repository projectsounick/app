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
          {/* Top content */}
          <View style={styles.content}>
            <OnboardingHeading>
              What is your{`\n`}date of birth?
            </OnboardingHeading>

            <TouchableOpacity
              onPress={showDatePicker}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 10,
                paddingHorizontal: 20, // more horizontal padding
                paddingVertical: 12,
                backgroundColor: "#fff",
                marginVertical: 10,
                width: "90%", // wider box
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#333",
                  fontFamily: theme.fonts.medium,
                }}
              >
                {dob.toLocaleDateString("en-GB")}
              </Text>
              <Ionicons
                name="calendar"
                size={24}
                color="#333"
                style={{ marginLeft: 15 }} // space between text and icon
              />
            </TouchableOpacity>
            <Text style={styles.hint}>DD/MM/YYYY</Text>
          </View>

          {/* Bottom fixed button */}
          <View style={styles.bottomButton}>
            <AnimatedSubmitButton
              loading={loading}
              onPress={handleNext}
              title="Next"
              height={50}
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
    fontFamily: theme.fonts.medium,
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
