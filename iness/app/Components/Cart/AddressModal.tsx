import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import theme from "@/app/Theme/globalTheme";

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (address: {
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
  }) => void;
  address: {
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
  };
  setAddress: (addr: any) => void;
}

export default function AddressModal({
  visible,
  onClose,
  onConfirm,
  address,
  setAddress,
}: AddressModalProps) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{ justifyContent: "flex-end", margin: 0 }}
      avoidKeyboard
      propagateSwipe
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <LinearGradient
            colors={["#140A21", "#522987"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
              minHeight: 400,
            }}
          >
            {/* Handle indicator */}
            <View
              style={{
                width: 50,
                height: 5,
                backgroundColor: "rgba(255,255,255,0.5)",
                borderRadius: 3,
                alignSelf: "center",
                marginBottom: 12,
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#fff",
                  fontFamily: theme.fonts.bold,
                }}
              >
                Enter Delivery Address
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.15)", // subtle circular bg
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <TextInput
              placeholder="Full Address"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={address.fullAddress}
              onChangeText={(text) =>
                setAddress((prev: any) => ({ ...prev, fullAddress: text }))
              }
            />
            <TextInput
              placeholder="City"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={address.city}
              onChangeText={(text) =>
                setAddress((prev: any) => ({ ...prev, city: text }))
              }
            />
            <TextInput
              placeholder="State"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={address.state}
              onChangeText={(text) =>
                setAddress((prev: any) => ({ ...prev, state: text }))
              }
            />
            <TextInput
              placeholder="Pincode"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={address.pincode}
              keyboardType="numeric"
              onChangeText={(text) =>
                setAddress((prev: any) => ({ ...prev, pincode: text }))
              }
            />

            {/* Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(189, 255, 132, 1)",
                padding: 16,
                borderRadius: 26,
                alignItems: "center",
                marginTop: 20,
              }}
              onPress={() => onConfirm(address)}
            >
              <Text
                style={{
                  color: "#000",
                  fontWeight: "bold",
                  fontFamily: theme.fonts.bold,
                  fontSize: 18,
                }}
              >
                Place Now
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = {
  input: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,

    marginBottom: 16,
    fontSize: 16,
  },
};
