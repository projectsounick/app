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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";

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
              {/* Heading */}
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
                  Your Contact{"\n"}Number?
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: "#666",
                    marginTop: 8,
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
                  backgroundColor: "#F8F8F8",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  height: 56,
                  width: "100%",
                  borderWidth: 1,
                  borderColor: phoneNumberError ? "#FF6B6B" : "#E0E0E0",
                  marginBottom: phoneNumberError ? 8 : 0,
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
                  <Ionicons name="call-outline" size={20} color="#9747FF" />
                </View>
                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setphoneNumber(text);
                    if (phoneNumberError) validatePhoneNumber();
                  }}
                  placeholder="Enter your number"
                  placeholderTextColor="#999"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: "#000",
                    backgroundColor: "transparent",
                    paddingVertical: 0,
                  }}
                  returnKeyType="done"
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>

              {/* Error message */}
              {phoneNumberError ? (
                <Text
                  style={{
                    color: "#FF6B6B",
                    fontSize: 14,
                    marginTop: 8,
                    alignSelf: "flex-start",
                    marginLeft: 20,
                  }}
                >
                  {phoneNumberError}
                </Text>
              ) : null}
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
              style={{
                backgroundColor: "#67C694",
                borderRadius: 30,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {phoneNumber === "" ? "Skip" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OnboardingphoneNumber;
