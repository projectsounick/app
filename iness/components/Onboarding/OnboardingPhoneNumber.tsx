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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const OnboardingphoneNumber = ({ onNext }: { onNext: () => void }) => {
  const theme = useGlobalTheme();
  const [phoneNumber, setphoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const user: any = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (user.exists && user?.data?.phoneNumber) {
        const raw = user.data.phoneNumber.replace("+", "");
        setphoneNumber(raw.slice(2));
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
    setPhoneNumberError("");
    return true;
  };

  const handleNext = () => {
    if (phoneNumber !== "" && validatePhoneNumber()) {
      const formattedPhoneNumber = `+91${phoneNumber}`;
      asyncStorageUtils.updateUserDataInAsyncStorage({
        phoneNumber: formattedPhoneNumber,
      });
    }
    onNext();
  };

  const isValid = phoneNumber.length === 10;
  const styles = getStyles(theme, isFocused, !!phoneNumberError);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <OnboardingHeading
              icon="phone"
              subtitle="We'll use this for login and updates"
            >
              Your contact number
            </OnboardingHeading>

            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.countryBadge}>
                  <Text style={styles.countryText}>+91</Text>
                </View>
                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setphoneNumber(text);
                    if (phoneNumberError) setPhoneNumberError("");
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    if (phoneNumber) validatePhoneNumber();
                  }}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.input}
                  returnKeyType="done"
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {isValid && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={22}
                    color={theme.colors.success}
                  />
                )}
              </View>

              {phoneNumberError ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={14}
                    color={theme.colors.error}
                  />
                  <Text style={styles.errorText}>{phoneNumberError}</Text>
                </View>
              ) : (
                <View style={styles.helperContainer}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={14}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.helperText}>
                    You can skip for now and add it later
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={handleNext}
              style={styles.nextButton}
              activeOpacity={0.8}
            >
              <Text style={styles.nextText}>
                {phoneNumber === "" ? "Skip for now" : "Continue"}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any, isFocused: boolean, hasError: boolean) => StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: hasError 
      ? theme.colors.error 
      : isFocused 
        ? theme.colors.success 
        : theme.colors.border,
    backgroundColor: isFocused ? theme.colors.greenLight : theme.colors.backgroundSecondary,
  },
  countryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  countryText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    paddingVertical: 0,
  },
  helperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  helperText: {
    marginLeft: 6,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontFamily: theme.fonts.regular,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  errorText: {
    marginLeft: 6,
    color: theme.colors.error,
    fontSize: 13,
    fontFamily: theme.fonts.medium,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
  },
  nextButton: {
    backgroundColor: theme.colors.success,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
  },
});

export default OnboardingphoneNumber;
