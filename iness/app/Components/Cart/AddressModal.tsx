import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Modal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

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

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

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
        padding: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: "absolute",
        bottom: 0,
        width: "100%",
        overflow: "hidden",
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
              Enter Delivery Address
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                borderRadius: 20,
                padding: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close-circle" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Full Address"
            placeholderTextColor="#ccc"
            style={{
              backgroundColor: "#fff",
              borderColor: "#ddd",
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
              marginBottom: 10,
            }}
            value={address.fullAddress}
            onChangeText={(text) =>
              setAddress((prev: any) => ({ ...prev, fullAddress: text }))
            }
          />

          <TextInput
            placeholder="City"
            placeholderTextColor="#ccc"
            style={{
              backgroundColor: "#fff",
              borderColor: "#ddd",
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
              marginBottom: 10,
            }}
            value={address.city}
            onChangeText={(text) =>
              setAddress((prev: any) => ({ ...prev, city: text }))
            }
          />

          <View
            style={{
              backgroundColor: "#fff",
              borderColor: "#ddd",
              borderWidth: 1,
              borderRadius: 10,
              marginBottom: 10,
              overflow: "hidden",
            }}
          >
            <Picker
              selectedValue={address.state}
              onValueChange={(itemValue) =>
                setAddress((prev: any) => ({ ...prev, state: itemValue }))
              }
              style={{ color: "#000" }}
            >
              <Picker.Item label="Select State" value="" />
              {indianStates.map((state) => (
                <Picker.Item key={state} label={state} value={state} />
              ))}
            </Picker>
          </View>

          <TextInput
            placeholder="Pincode"
            placeholderTextColor="#ccc"
            style={{
              backgroundColor: "#fff",
              borderColor: "#ddd",
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
              marginBottom: 10,
            }}
            value={address.pincode}
            keyboardType="numeric"
            onChangeText={(text) =>
              setAddress((prev: any) => ({ ...prev, pincode: text }))
            }
          />

          <TouchableOpacity
            style={{
              backgroundColor: "rgba(189, 255, 132, 1)",
              padding: 14,
              borderRadius: 26,
              alignItems: "center",
              marginTop: 10,
            }}
            onPress={() => onConfirm(address)}
          >
            <Text style={{ color: "#000", fontWeight: "bold" }}>Place Now</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Modal>
  );
}
