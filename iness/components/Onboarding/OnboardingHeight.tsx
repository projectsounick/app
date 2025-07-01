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
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

const OnboardingHeight = ({ onNext }: { onNext: () => void }) => {
  const [heightFeet, setHeightFeet] = useState("5");
  const [heightInches, setHeightInches] = useState("10");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleNext = async () => {
    const formattedHeight = `${heightFeet}'${heightInches}`;

    if (!heightFeet || !heightInches) {
      setSnackbarMessage("Please select both feet and inches.");
      setSnackbarVisible(true);
      return;
    }

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

  const feetOptions = Array.from({ length: 4 }, (_, i) => ({
    label: (4 + i).toString(),
    value: (4 + i).toString(),
  }));

  const inchOptions = Array.from({ length: 12 }, (_, i) => ({
    label: i.toString(),
    value: i.toString(),
  }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <OnboardingHeading>
              <Text style={styles.title}>What is your{`\n`}height?</Text>
            </OnboardingHeading>

            <View style={styles.pickerRow}>
              <RNPickerSelect
                onValueChange={setHeightFeet}
                items={feetOptions}
                value={heightFeet}
                placeholder={{ label: "ft", value: null }}
                style={pickerSelectStyles}
              />
              <Text style={styles.unit}>ft</Text>

              <RNPickerSelect
                onValueChange={setHeightInches}
                items={inchOptions}
                value={heightInches}
                placeholder={{ label: "in", value: null }}
                style={pickerSelectStyles}
              />
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
              title="Next"
            />
          </View>

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
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#000",
    paddingRight: 30,
    minWidth: 80,
    textAlign: "center",
  },
  inputAndroid: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#000",
    paddingRight: 30,
    minWidth: 80,
    textAlign: "center",
  },
});

export default OnboardingHeight;
