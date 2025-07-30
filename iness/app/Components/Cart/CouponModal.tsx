import theme from "@/app/Theme/globalTheme";
import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Modal from "react-native-modal";

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
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <View style={styles.modalContent}>
        <Text style={styles.heading}>Apply Coupon</Text>
        <TextInput
          placeholder="Enter coupon code"
          value={couponCode}
          onChangeText={setCouponCode}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => onApply(couponCode)}
        >
          <Text style={styles.buttonText}>Apply Coupon</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CouponModal;
