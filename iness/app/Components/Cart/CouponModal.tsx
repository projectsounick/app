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
            <View
              style={{
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 40,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            >
              {/* Dash handle */}
              <View
                style={{
                  width: 50,
                  height: 5,
                  backgroundColor: "#ccc",
                  borderRadius: 3,
                  alignSelf: "center",
                  marginBottom: 20,
                }}
              />

              {/* Close Button - Top Right */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  position: "absolute",
                  top: 18,
                  right: 20,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F0F0F0",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <Ionicons name="close" size={20} color="#000" />
              </TouchableOpacity>

              {/* Icon Container */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#FFF3E0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="ticket-outline" size={40} color="#FF9800" />
                </View>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#000",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Apply Coupon
              </Text>

              {/* Input */}
              <TextInput
                placeholder="Enter coupon code"
                placeholderTextColor="#999"
                value={couponCode}
                onChangeText={setCouponCode}
                style={{
                  backgroundColor: "#F8F8F8",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  marginBottom: 20,
                  fontSize: 16,
                  color: "#000",
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                }}
              />

              {/* Apply Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#67C694",
                  paddingVertical: 16,
                  borderRadius: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => onApply(couponCode)}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  Apply Coupon
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CouponModal;
