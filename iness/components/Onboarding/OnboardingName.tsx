import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { LinearGradient } from "expo-linear-gradient";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";

// Main functional component for the Onboarding Name screen------------------------------------/
const OnboardingName = ({ onNext }: { onNext: () => void }) => {
  const [name, setName] = useState("");

  // Function to update user data in AsyncStorage
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "name", // or "age"
    setter: setName, // or setAge
  });

  const handleNext = async () => {
    if (name.trim()) {
      await asyncStorageUtils.updateUserDataInAsyncStorage({
        name,
      });
      onNext();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        justifyContent: "space-between",
        padding: theme.spacing.lg,
      }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Centered Top Section */}
      <View
        style={{
          flex: 1,
          justifyContent: "center", // Vertically center
        }}
      >
        <View>
          <View style={{ display: "flex", height: "50%" }}>
            <View
              style={{
                position: "relative",
                backgroundColor: "#fff",
                borderLeftWidth: 1,
                borderLeftColor: "#DDD",
                borderRadius: 10,
                marginBottom: theme.spacing.md,
                padding: 26,
              }}
            >
              {/* Top border: fades from solid on left → transparent at 50% */}
              <LinearGradient
                colors={["#DDD", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "50%",
                  height: 1,
                  borderTopLeftRadius: 10,
                }}
              />

              {/* Bottom border: same fade */}
              <LinearGradient
                colors={["#DDD", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "50%",
                  height: 1,
                  borderBottomLeftRadius: 10,
                }}
              />

              {/* Your content */}
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: theme.colors.dark,
                  fontFamily: theme.fonts.heading,
                  textAlign: "center",
                }}
              >
                What should we call you?
              </Text>
            </View>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.mutedText}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.normal,
              borderRadius: 8,
              padding: 12,
              backgroundColor: "#fff",
              color: "#000",
              fontSize: 16,
              width: "100%", // Full width
            }}
          />
        </View>
      </View>

      {/* Bottom Button */}
      <View style={{ marginBottom: theme.spacing.xl }}>
        <AnimatedSubmitButton
          loading={false}
          onPress={handleNext}
          title="Next"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default OnboardingName;
