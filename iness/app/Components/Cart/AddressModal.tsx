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
  ScrollView,
} from "react-native";
import { Modal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
      visible={visible}
      onDismiss={onClose}
      contentContainerStyle={{
        height: "65%", // ✅ bottom sheet height
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: "absolute",
        bottom: 0,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <LinearGradient
          colors={["#140A21", "#522987"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}
        >
          {/* ✅ This will push content above keyboard */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
                  style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
                >
                  Enter Delivery Address
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={30} color="#fff" />
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
                <Text style={{ color: "#000", fontWeight: "bold" }}>
                  Place Now
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </TouchableWithoutFeedback>
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
