import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

const OnboardingWeight = ({ onNext }: { onNext: () => void }) => {
  const kgOptions = Array.from({ length: 171 }, (_, i) => {
    const value = (30 + i).toString();
    return { label: value, value };
  });

  const gramOptions = Array.from({ length: 10 }, (_, i) => {
    const value = (i * 100).toString();
    return { label: value, value };
  });

  const [kg, setKg] = useState("80");
  const [grams, setGrams] = useState("0");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleNext = () => {
    if (!kg || !grams) {
      setSnackbarMessage("Please select both Kg and Grams");
      setSnackbarVisible(true);
      return;
    }

    const combinedWeight = `${kg}.${grams}`;

    try {
      setLoading(true);
      asyncStorageUtils.updateUserDataInAsyncStorage({
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <OnboardingHeading>
            <Text style={styles.title}>What is your{`\n`}weight?</Text>
          </OnboardingHeading>

          {/* Picker Section */}
          <View style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                value={kg}
                onValueChange={(value) => setKg(value)}
                items={kgOptions}
                placeholder={{ label: "Kg", value: null }}
                style={{
                  inputIOS: styles.pickerText,
                  inputAndroid: styles.pickerText,
                  modalViewMiddle: {
                    justifyContent: "flex-end",
                    height: 100, // ✅ adjust this to desired height
                  },
                }}
                useNativeAndroidPickerStyle={false}
              />
              <Text style={styles.unit}>Kg</Text>
            </View>

            <View style={styles.pickerContainer}>
              <RNPickerSelect
                value={grams}
                onValueChange={(value) => setGrams(value)}
                items={gramOptions}
                placeholder={{ label: "Grams", value: null }}
                style={{
                  inputIOS: styles.pickerText,
                  inputAndroid: styles.pickerText,
                }}
                useNativeAndroidPickerStyle={false}
              />
              <Text style={styles.unit}>g</Text>
            </View>
          </View>

          <Text style={styles.hintText}>
            Select your weight in Kg and Grams (e.g. 80.300)
          </Text>

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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",

    gap: 24,
  },
  pickerContainer: {
    alignItems: "center",
  },
  pickerText: {
    fontSize: 20,

    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#000",
    backgroundColor: "transparent",
    width: 120,
    textAlign: "center",
  },
  unit: {
    marginTop: 6,
    fontSize: 16,
    color: "#7D4CFF",
    fontWeight: "600",
  },
  hintText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  bottomButton: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
});

export default OnboardingWeight;
