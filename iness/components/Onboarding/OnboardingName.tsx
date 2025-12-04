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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import CustomSnackbar from "@/app/modules/Snackbar";

// Main functional component for the Onboarding Name screen------------------------------------/
const OnboardingName = ({ onNext }: { onNext: () => void }) => {
  const [name, setName] = useState("");

  // Function to update user data in AsyncStorage
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "name",
    setter: setName,
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
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 20,
              paddingTop: 20,
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
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 30,
                  width: "100%",
                  marginBottom: 30,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    color: "#000",
                    textAlign: "center",
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
                  height: 56,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  backgroundColor: "#F8F8F8",
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  width: "100%",
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#F0F0F0",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#9747FF" />
                </View>
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="done"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: "#000",
                    backgroundColor: "transparent",
                    paddingVertical: 0,
                  }}
                />
              </View>
            </View>
          </ScrollView>

          {/* Bottom Button - Always at bottom */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 30,
              paddingTop: 20,
              backgroundColor: "transparent",
            }}
          >
            <TouchableOpacity
              onPress={handleNext}
              disabled={!name.trim()}
              style={{
                backgroundColor: name.trim() ? "#67C694" : "#E0E0E0",
                borderRadius: 30,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: name.trim() ? "#FFFFFF" : "#999",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingName;
