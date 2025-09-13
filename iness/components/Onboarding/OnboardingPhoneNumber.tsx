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
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            {/* Heading */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 30,
                width: "100%",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
                marginBottom: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "700",
                  color: "#333",
                  textAlign: "center",
                  fontFamily: theme.fonts.bold,
                }}
              >
                Your Contact{"\n"}Number?
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#888",
                  marginTop: 4,
                  fontFamily: theme.fonts.regular,
                }}
              >
                (optional)
              </Text>
            </View>

            {/* Input with Icon */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 12,
                paddingHorizontal: 16,
                height: 50,
                width: "100%",
                borderWidth: 1,
                borderColor: "#ccc",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
                marginBottom: phoneNumberError ? 4 : 16,
              }}
            >
              <MaterialCommunityIcons
                name="phone-outline"
                size={24}
                color="#888"
                style={{ marginRight: 12 }}
              />
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => {
                  setphoneNumber(text);
                  if (phoneNumberError) validatePhoneNumber();
                }}
                placeholder="Enter your number"
                placeholderTextColor="#aaa"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "#333",
                  backgroundColor: "transparent",
                  paddingVertical: 0,
                  fontFamily: theme.fonts.regular,
                }}
                returnKeyType="done"
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>

            {/* Error message */}
            {phoneNumberError ? (
              <Text style={{ color: "red", fontSize: 14, marginBottom: 16 }}>
                {phoneNumberError}
              </Text>
            ) : null}
          </View>

          {/* Bottom Button */}
          <View style={{ marginTop: 40 }}>
            <AnimatedSubmitButton
              loading={false}
              height={50}
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
