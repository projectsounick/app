import React, { useState } from "react";
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
  FlatList,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import theme from "@/app/Theme/globalTheme";

const INDIAN_STATES = [
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
  const [showStatePicker, setShowStatePicker] = useState(false);

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
            colors={["#2C1453", "#1C0E33"]}
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
            {/* State Dropdown */}
            <TouchableOpacity
              onPress={() => setShowStatePicker(true)}
              style={styles.input}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: address.state ? "#000" : "#aaa",
                  }}
                >
                  {address.state || "Select State"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#aaa" />
              </View>
            </TouchableOpacity>
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
                backgroundColor: "#67c694",
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

      {/* State Picker Modal */}
      <Modal
        isVisible={showStatePicker}
        onBackdropPress={() => setShowStatePicker(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
        backdropOpacity={0.5}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "70%",
            paddingBottom: 20,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#E0E0E0",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#000",
              }}
            >
              Select State
            </Text>
            <TouchableOpacity
              onPress={() => setShowStatePicker(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F5F5F5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* States List */}
          <FlatList
            data={INDIAN_STATES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setAddress((prev: any) => ({ ...prev, state: item }));
                  setShowStatePicker(false);
                }}
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F5F5F5",
                  backgroundColor:
                    address.state === item ? "#F3E5F5" : "#FFFFFF",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#000",
                      fontWeight: address.state === item ? "600" : "400",
                    }}
                  >
                    {item}
                  </Text>
                  {address.state === item && (
                    <Ionicons name="checkmark" size={20} color="#9747FF" />
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 400 }}
          />
        </View>
      </Modal>
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
