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
} from "react-native";
import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

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
    } else {
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
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered Content */}
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            <View
              style={{
                marginBottom: theme.spacing.md,
                width: "100%",
              }}
            >
              <OnboardingHeading>Your Contact{"\n"} Number?</OnboardingHeading>

              <Text
                style={{
                  textAlign: "center",
                  fontSize: theme.fontSizes.small, // or a fixed small value like 12
                  color: theme.colors.normal, // you can also use a lighter gray like "#888"
                }}
              >
                (optional)
              </Text>
            </View>

            <View
              style={{
                flexDirection: "column",
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: 6,
                  width: "100%",
                  borderWidth: 1,
                  borderColor: "#ccc",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setphoneNumber(text);
                    if (phoneNumberError) validatePhoneNumber(); // auto-validate on change
                  }}
                  placeholder="Enter your number"
                  placeholderTextColor={theme.colors.mutedText}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: theme.colors.dark,
                  }}
                  returnKeyType="done"
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>

              {phoneNumberError ? (
                <Text style={{ color: "red", marginTop: 6, fontSize: 14 }}>
                  {phoneNumberError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Bottom Button */}
          <View style={{ marginTop: 40 }}>
            <AnimatedSubmitButton
              loading={false}
              onPress={handleNext}
              title={phoneNumber === "" ? "Skip" : "Next"}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingphoneNumber;
