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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Main functional component for the Onboarding Name screen------------------------------------/
const OnboardingName = ({ onNext }: { onNext: () => void }) => {
  const [name, setName] = useState("");

  // Function to update user data in AsyncStorage
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "name", // or "age"
    setter: setName, // or setAge
  });

  const handleNext = () => {
    if (name.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
        name,
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
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            {/* Card */}
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
                What should we call you?
              </Text>
            </View>

            {/* Input with Icon */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 50,
                borderRadius: 12,
                paddingHorizontal: 16,
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
                width: "100%",
              }}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={24}
                color="#888"
                style={{ marginRight: 12 }}
              />
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor="#aaa"
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "#333",
                  backgroundColor: "transparent",
                  paddingVertical: 0,
                  fontFamily: theme.fonts.regular,
                }}
              />
            </View>
          </View>

          {/* Bottom Button */}
          <View style={{ marginTop: 40 }}>
            <AnimatedSubmitButton
              loading={false}
              onPress={handleNext}
              title="Next"
              height={50}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingName;
