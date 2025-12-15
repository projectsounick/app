import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

// Main functional component
const OnboardingphoneNumber = ({ onNext }: { onNext: () => void }) => {
  const [phoneNumber, setphoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      const user: any =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      if (user.exists && user?.phoneNumber) {
        const raw = user.phoneNumber.replace("+", "");
        setphoneNumber(raw.slice(2)); // Remove +91
      }
    };

    loadUserData();
  }, []);

  const validatePhoneNumber = () => {
    const trimmed = phoneNumber.trim();
    if (!trimmed) {
      setPhoneNumberError("Phone number is required");
      return false;
    }
    if (!/^\d{10}$/.test(trimmed)) {
      setPhoneNumberError("Phone number must be exactly 10 digits");
      return false;
    }

    setPhoneNumberError(""); // Clear error if valid
    return true;
  };

  const handleNext = () => {
    if (phoneNumber != "" && validatePhoneNumber()) {
      const formattedPhoneNumber = `+91${phoneNumber}`;
      asyncStorageUtils.updateUserDataInAsyncStorage({
        phoneNumber: formattedPhoneNumber,
      });
    }
    onNext();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inner}>
              <OnboardingHeading
                icon="phone"
                subtitle="We'll use this for login and updates"
              >
                Your contact number
              </OnboardingHeading>

              <View style={styles.card}>
                <View
                  style={[
                    styles.inputWrapper,
                    phoneNumberError && styles.inputWrapperError,
                  ]}
                >
                  <View style={styles.countryBadge}>
                    <Text style={styles.countryText}>+91</Text>
                  </View>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setphoneNumber(text);
                      if (phoneNumberError) validatePhoneNumber();
                    }}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#9A8CB8"
                    style={styles.input}
                    returnKeyType="done"
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                {phoneNumberError ? (
                  <Text style={styles.errorText}>{phoneNumberError}</Text>
                ) : (
                  <Text style={styles.helperText}>
                    You can skip for now and add it later.
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={handleNext}
              style={styles.nextButton}
              activeOpacity={0.9}
            >
              <Text style={styles.nextText}>
                {phoneNumber === "" ? "Skip for now" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingphoneNumber;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inner: {
    flex: 1,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 60,
    borderWidth: 1.5,
    borderColor: "#E6E6E6",
  },
  inputWrapperError: {
    borderColor: "#FF8A8A",
  },
  countryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F7F2FF",
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D6C6FF",
  },
  countryText: {
    color: "#5B2EC2",
    fontFamily: theme.fonts.medium,
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    fontFamily: theme.fonts.medium,
    paddingVertical: 0,
  },
  helperText: {
    marginTop: 12,
    color: "#7A6B99",
    fontSize: 13,
    fontFamily: theme.fonts.regular,
  },
  errorText: {
    marginTop: 12,
    color: "#FF6B6B",
    fontSize: 13,
    fontFamily: theme.fonts.medium,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: "transparent",
  },
  nextButton: {
    backgroundColor: "#67C694",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
});
