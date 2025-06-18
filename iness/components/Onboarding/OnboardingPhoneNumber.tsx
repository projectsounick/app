import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { LinearGradient } from "expo-linear-gradient";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";

import OnboardingHeading from "@/app/modules/OnboardingHeading";

// Main functional component for the Onboarding phoneNumber screen------------------------------------/
const OnboardingphoneNumber = ({ onNext }: { onNext: () => void }) => {
  const [phoneNumber, setphoneNumber] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      const user: any = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
        "user"
      );

      if (user.exists && user?.phoneNumber) {
        const raw = user.phoneNumber.replace("+", ""); // e.g., '919876543210'

        setphoneNumber(raw.slice(2)); // remove first 2 digits
      }
    };

    loadUserData();
  }, []);
  const handleNext = async () => {
    if (phoneNumber.trim()) {
      const formattedPhoneNumber = `+${"91"}${phoneNumber}`;
      console.log(formattedPhoneNumber);

      await asyncStorageUtils.updateUserDataInAsyncStorage({
        phoneNumber: formattedPhoneNumber,
      });
      onNext();
    }
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
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 8,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 6,
                width: "100%",

                // Add border for iOS visibility
                borderWidth: 1,
                borderColor: "#ccc", // light gray or your preferred border color

                // Shadow for iOS (optional)
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,

                // elevation for Android
                elevation: 2,
                marginBottom: theme.spacing.sm,
              }}
            >
              <TextInput
                value={phoneNumber}
                onChangeText={setphoneNumber}
                placeholder="Enter your Number"
                placeholderTextColor={theme.colors.mutedText}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.colors.dark,
                }}
                returnKeyType="done"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Bottom Button */}
          <View style={{ marginTop: 40 }}>
            <AnimatedSubmitButton
              loading={false}
              onPress={handleNext}
              title="Next"
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingphoneNumber;
