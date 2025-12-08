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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
                paddingBottom: 20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: "90%",
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
                    backgroundColor: "#E3F2FD",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="location-outline" size={40} color="#2196F3" />
                </View>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#000",
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                Enter Delivery Address
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 350 }}
                contentContainerStyle={{ paddingBottom: 10 }}
                keyboardShouldPersistTaps="handled"
              >

                {/* Inputs */}
                <TextInput
                  placeholder="Full Address"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={address.fullAddress}
                  onChangeText={(text) =>
                    setAddress((prev: any) => ({ ...prev, fullAddress: text }))
                  }
                />
                <TextInput
                  placeholder="City"
                  placeholderTextColor="#999"
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
                        color: address.state ? "#000" : "#999",
                      }}
                    >
                      {address.state || "Select State"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#999" />
                  </View>
                </TouchableOpacity>
                <TextInput
                  placeholder="Pincode"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={address.pincode}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    setAddress((prev: any) => ({ ...prev, pincode: text }))
                  }
                />
              </ScrollView>

              {/* Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#67C694",
                  paddingVertical: 16,
                  borderRadius: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 12,
                }}
                onPress={() => onConfirm(address)}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  Place Order
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* State Picker Modal */}
      <Modal
        transparent
        visible={showStatePicker}
        animationType="slide"
        onRequestClose={() => setShowStatePicker(false)}
      >
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
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70%",
              paddingBottom: 20,
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
                marginTop: 12,
                marginBottom: 12,
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                }}
              >
                Select State
              </Text>
              <TouchableOpacity
                onPress={() => setShowStatePicker(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F0F0F0",
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
        </View>
      </Modal>
    </Modal>
  );
}

const styles = {
  input: {
    backgroundColor: "#F8F8F8",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
};
