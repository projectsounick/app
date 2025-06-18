import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

const OnboardingHeight = ({ onNext }: { onNext: () => void }) => {
  const [height, setHeight] = useState("5'10");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleNext = async () => {
    try {
      if (!/^\d'\d{1,2}$/.test(height)) {
        setSnackbarMessage("Please enter height in format like 5'10");
        setSnackbarVisible(true);
        return;
      }

      await asyncStorageUtils.updateUserDataInAsyncStorage({ height });
      onNext();
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
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
          {/* Scrollable content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <OnboardingHeading>
              <Text style={styles.title}>What is your{`\n`}height?</Text>
            </OnboardingHeading>

            <View style={styles.inputContainer}>
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder="Height"
                placeholderTextColor="#999"
                style={styles.input}
                keyboardType="default"
                maxLength={5}
                returnKeyType="done"
                textAlign="center"
              />
              <View style={styles.unitBox}>
                <Text style={styles.unitText}>ft/in</Text>
              </View>
            </View>

            <Text style={styles.hintText}>
              Enter your height in feet and inches (e.g. 5'10)
            </Text>
          </ScrollView>

          {/* Button pinned to bottom */}
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
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 4,
    marginTop: 30,
    width: 180,
  },
  input: {
    fontSize: 18,
    color: "#000",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  unitBox: {
    backgroundColor: "#EFE4FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  unitText: {
    color: "#7D4CFF",
    fontSize: 18,
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

export default OnboardingHeight;
