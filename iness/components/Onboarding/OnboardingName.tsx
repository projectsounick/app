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
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            <View
              style={{
                position: "relative",
                backgroundColor: "#fff",
                borderLeftWidth: 1,
                borderLeftColor: "#DDD",
                borderRadius: 10,
                marginBottom: theme.spacing.md,
                padding: 26,
                width: "100%",
              }}
            >
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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 48,
                borderColor: "#ccc",
                borderWidth: 1,

                borderRadius: 8,
                paddingHorizontal: 12,
                backgroundColor: "#fff",
                width: "100%",
                marginBottom: 12, // optional
              }}
            >
              <MaterialCommunityIcons
                name="account-outline" // 👈 person icon
                size={20}
                color="#888"
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.mutedText}
                value={name}
                onChangeText={setName}
                underlineColorAndroid="transparent"
                returnKeyType="done"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "#000",
                  backgroundColor: "transparent",
                  borderWidth: 0,
                  paddingVertical: 0,
                  includeFontPadding: false,
                  textAlignVertical: "center",
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
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingName;
