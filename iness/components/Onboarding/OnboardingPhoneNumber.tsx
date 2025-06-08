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
import CountryPicker, {
  Country,
  CountryCode,
  FlagType,
  getAllCountries,
} from "react-native-country-picker-modal";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

// Main functional component for the Onboarding phoneNumber screen------------------------------------/
const OnboardingphoneNumber = ({ onNext }: { onNext: () => void }) => {
  const [phoneNumber, setphoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("IN");
  const [country, setCountry] = useState<Country | null>(null);
  /// Function to handle the country selection---/
  const onSelect = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
  };
  useEffect(() => {
    const loadUserData = async () => {
      const user: any =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      if (user.exists && user?.phoneNumber) {
        const raw = user.phoneNumber.replace("+", ""); // e.g., '919876543210'

        const allCountries = getAllCountries(FlagType.EMOJI);

        const matchedCountry = (await allCountries).find((c) =>
          raw.startsWith(c.callingCode[0])
        );
        if (matchedCountry) {
          setCountry(matchedCountry);
          setCountryCode(matchedCountry.cca2);

          const nationalNumber = raw.slice(
            matchedCountry.callingCode[0].length
          ); // remove country code
          setphoneNumber(nationalNumber);
        } else {
          // Fallback: assume default India
          setCountryCode("IN");
          setphoneNumber(raw.slice(2)); // remove first 2 digits
        }
      }
    };

    loadUserData();
  }, []);
  const handleNext = async () => {
    if (phoneNumber.trim()) {
      const formattedPhoneNumber = `+${
        country?.callingCode?.[0] || "91"
      }${phoneNumber}`;
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
                elevation: 2,
                marginBottom: theme.spacing.sm,
              }}
            >
              <CountryPicker
                countryCode={countryCode}
                withFilter
                withFlag
                withCallingCode
                onSelect={onSelect}
                containerButtonStyle={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{ marginRight: 8, fontSize: 16 }}>
                +{country?.callingCode?.[0] || "91"}
              </Text>
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
