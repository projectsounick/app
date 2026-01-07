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
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [showStatePicker, setShowStatePicker] = useState(false);
  const styles = getStyles(theme, isDark);

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
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>

              {/* Icon */}
              <View style={styles.iconWrapper}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={36}
                    color={theme.colors.secondPrimary}
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
                      color={theme.colors.secondPrimary}
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
                      color={theme.colors.secondPrimary}
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
                      color={theme.colors.secondPrimary}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowStatePicker(true)}
                    style={styles.dropdownInput}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !address.state && { color: theme.colors.textMuted },
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
                      color={theme.colors.secondPrimary}
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
                    color={theme.colors.secondPrimary}
                  />
                </View>
                <Text style={styles.pickerTitle}>Select State</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStatePicker(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
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
                        <Ionicons name="checkmark" size={16} color={theme.colors.textWhite} />
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

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.border,
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
    backgroundColor: theme.colors.mediumGrey,
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  dropdownInput: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  dropdownArrow: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  placeOrderButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  placeOrderButtonText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.bold as "700",
    fontSize: theme.fontSizes.regular,
    fontFamily: theme.fonts.bold,
  },
  // State Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  pickerContent: {
    backgroundColor: theme.colors.background,
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
    borderBottomColor: theme.colors.border,
  },
  pickerHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pickerTitle: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  stateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  stateItemSelected: {
    backgroundColor: theme.colors.backgroundCardLight,
    borderWidth: 1,
    borderColor: theme.colors.secondPrimary,
  },
  stateText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  stateTextSelected: {
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.secondPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
});
