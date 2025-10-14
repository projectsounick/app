import theme from "@/app/Theme/globalTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CouponModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  couponCode: string;
  setCouponCode: (val: string) => void;
}

const CouponModal: React.FC<CouponModalProps> = ({
  visible,
  onClose,
  onApply,
  couponCode,
  setCouponCode,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <LinearGradient
              colors={["#140A21", "#522987"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            >
              {/* Dash handle */}
              <View
                style={{
                  width: 50,
                  height: 5,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 3,
                  alignSelf: "center",
                  marginBottom: 12,
                }}
              />

              {/* Title + Close */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#fff",
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Apply Coupon
                </Text>

                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Input */}
              <TextInput
                placeholder="Enter coupon code"
                placeholderTextColor="#ccc"
                value={couponCode}
                onChangeText={setCouponCode}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 15,
                  fontFamily: theme.fonts.bold,
                  fontSize: 16,
                  color: "#000",
                }}
              />

              {/* Apply Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#BDFF84",
                  paddingVertical: 14,
                  borderRadius: 30,
                  alignItems: "center",
                }}
                onPress={() => onApply(couponCode)}
              >
                <Text
                  style={{
                    color: "#000",
                    fontWeight: "700",
                    fontSize: 16,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Apply Coupon
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CouponModal;
