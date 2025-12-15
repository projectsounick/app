import React, { useState } from "react";
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
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

const OnboardingName = ({ onNext }: { onNext: () => void }) => {
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
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: isFocused ? "#9747FF" : "#E8E8E8",
                    backgroundColor: isFocused ? "#FAFAFF" : "#F8F9FA",
                  },
                ]}
              >
                <View
                  style={[
                    styles.inputIconContainer,
                    {
                      backgroundColor: isFocused ? "#F3EDFF" : "#F0F0F0",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={22}
                    color={isFocused ? "#9747FF" : "#888"}
                  />
                </View>
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
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
                    color="#67C694"
                  />
                )}
              </View>

              {/* Hint */}
              <View style={styles.hintContainer}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={14}
                  color="#888"
                />
                <Text style={styles.hintText}>
                  This name will appear on your profile
                </Text>
              </View>
            </View>

            {/* Features Info */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What you'll unlock:</Text>
              <View style={styles.featureRow}>
                <FeatureItem icon="dumbbell" text="Personalized workouts" />
                <FeatureItem icon="food-apple" text="Custom diet plans" />
              </View>
              <View style={styles.featureRow}>
                <FeatureItem icon="chart-line" text="Progress tracking" />
                <FeatureItem icon="account-group" text="Expert guidance" />
              </View>
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={handleNext}
              disabled={!isValid}
              style={[
                styles.nextButton,
                {
                  backgroundColor: isValid ? "#67C694" : "#E0E0E0",
                },
              ]}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  { color: isValid ? "#FFFFFF" : "#999" },
                ]}
              >
                Continue
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={isValid ? "#FFFFFF" : "#999"}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Feature Item Component
const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <MaterialCommunityIcons name={icon} size={18} color="#9747FF" />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  inputLabel: {
    fontSize: 13,
    color: "#666",
    fontFamily: theme.fonts.medium,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    fontFamily: theme.fonts.regular,
    paddingVertical: 0,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 12,
    color: "#888",
    marginLeft: 6,
    fontFamily: theme.fonts.regular,
  },
  featuresContainer: {
    marginTop: 30,
    paddingHorizontal: 4,
  },
  featuresTitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: theme.fonts.medium,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  featureItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9F6FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2D6FF",
    marginRight: 12,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    borderWidth: 1,
    borderColor: "#E2D6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  featureText: {
    fontSize: 13,
    color: "#4A3B70",
    fontFamily: theme.fonts.medium,
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
  },
  nextButton: {
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
});

export default OnboardingName;
