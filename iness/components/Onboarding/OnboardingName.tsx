import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const OnboardingName = ({ onNext }: { onNext: () => void }) => {
  const theme = useGlobalTheme();
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "name",
    setter: setName,
  });

  const handleNext = () => {
    if (name.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({ name });
      onNext();
    }
  };

  const isValid = name.trim().length > 0;
  const styles = getStyles(theme, isFocused, isValid);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <OnboardingHeading
            icon="account-outline"
            subtitle="Let's personalize your fitness journey"
          >
            What should we{"\n"}call you?
          </OnboardingHeading>

          {/* Input Card */}
          <View style={styles.inputCard}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <MaterialCommunityIcons
                  name="account"
                  size={22}
                  color={isFocused ? theme.colors.success : theme.colors.textSecondary}
                />
              </View>
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                returnKeyType="done"
                autoCapitalize="words"
                style={styles.textInput}
              />
              {isValid && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={22}
                  color={theme.colors.success}
                />
              )}
            </View>

            {/* Hint */}
            <View style={styles.hintContainer}>
              <MaterialCommunityIcons
                name="information-outline"
                size={14}
                color={theme.colors.textMuted}
              />
              <Text style={styles.hintText}>
                This name will appear on your profile
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={!isValid}
            style={styles.nextButton}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={isValid ? "#FFFFFF" : theme.colors.textMuted}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any, isFocused: boolean, isValid: boolean) => StyleSheet.create({
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: isFocused ? theme.colors.success : theme.colors.border,
    backgroundColor: isFocused ? theme.colors.greenLight : theme.colors.backgroundSecondary,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: isFocused ? `${theme.colors.success}20` : theme.colors.lightGrey,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    paddingVertical: 0,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginLeft: 6,
    fontFamily: theme.fonts.regular,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
  },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isValid ? theme.colors.success : theme.colors.lightGrey,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
    color: isValid ? "#FFFFFF" : theme.colors.textMuted,
  },
});

export default OnboardingName;
