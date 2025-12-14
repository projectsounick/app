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
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              {/* Dash Handle */}
              <View style={styles.dashHandle} />

              {/* Close Button */}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>

              {/* Icon */}
              <View style={styles.iconWrapper}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={36}
                    color="#9747FF"
                  />
                </View>
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>Enter Delivery Address</Text>

              {/* Form */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.formContainer}
                contentContainerStyle={{ paddingBottom: 10 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Full Address */}
                <View style={styles.inputRow}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons
                      name="home-outline"
                      size={18}
                      color="#9747FF"
                    />
                  </View>
                  <TextInput
                    placeholder="Full Address"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={address.fullAddress}
                    onChangeText={(text) =>
                      setAddress((prev: any) => ({ ...prev, fullAddress: text }))
                    }
                  />
                </View>

                {/* City */}
                <View style={styles.inputRow}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons
                      name="city-variant-outline"
                      size={18}
                      color="#9747FF"
                    />
                  </View>
                  <TextInput
                    placeholder="City"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={address.city}
                    onChangeText={(text) =>
                      setAddress((prev: any) => ({ ...prev, city: text }))
                    }
                  />
                </View>

                {/* State Dropdown */}
                <View style={styles.inputRow}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons
                      name="map-outline"
                      size={18}
                      color="#9747FF"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowStatePicker(true)}
                    style={styles.dropdownInput}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !address.state && { color: "#999" },
                      ]}
                    >
                      {address.state || "Select State"}
                    </Text>
                    <View style={styles.dropdownArrow}>
                      <Ionicons name="chevron-down" size={16} color="#9747FF" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Pincode */}
                <View style={styles.inputRow}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons
                      name="numeric"
                      size={18}
                      color="#9747FF"
                    />
                  </View>
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
                </View>
              </ScrollView>

              {/* Place Order Button */}
              <TouchableOpacity
                style={styles.placeOrderButton}
                onPress={() => onConfirm(address)}
              >
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
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
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            {/* Dash Handle */}
            <View style={styles.dashHandle} />

            {/* Header */}
            <View style={styles.pickerHeader}>
              <View style={styles.pickerHeaderLeft}>
                <View style={styles.pickerIconContainer}>
                  <MaterialCommunityIcons
                    name="map-outline"
                    size={20}
                    color="#9747FF"
                  />
                </View>
                <Text style={styles.pickerTitle}>Select State</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStatePicker(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* States List */}
            <FlatList
              data={INDIAN_STATES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = address.state === item;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setAddress((prev: any) => ({ ...prev, state: item }));
                      setShowStatePicker(false);
                    }}
                    style={[
                      styles.stateItem,
                      isSelected && styles.stateItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stateText,
                        isSelected && styles.stateTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 400 }}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  dashHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: theme.fonts.bold,
  },
  formContainer: {
    maxHeight: 300,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: theme.fonts.regular,
  },
  dropdownInput: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: theme.fonts.regular,
  },
  dropdownArrow: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  placeOrderButton: {
    backgroundColor: "#67C694",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  placeOrderButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
  // State Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: "70%",
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  pickerHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  stateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#FAFAFA",
  },
  stateItemSelected: {
    backgroundColor: "#F3EDFF",
    borderWidth: 1,
    borderColor: "#9747FF",
  },
  stateText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: theme.fonts.regular,
  },
  stateTextSelected: {
    fontWeight: "600",
    color: "#9747FF",
    fontFamily: theme.fonts.medium,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#9747FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
