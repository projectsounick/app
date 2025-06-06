import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CartItem } from "@/app/interfaces/cartInterface";
import AnimatedDots from "./LoadingDots";

interface CartCheckoutSummaryProps {
  address: string;
  cartItems: CartItem[];
  onChangeAddress: (newAddress: string) => void;
  onPlaceOrder: () => void;
  loading: any;
}

const CartCheckoutCard: React.FC<CartCheckoutSummaryProps> = ({
  address,
  cartItems,
  onChangeAddress,
  onPlaceOrder,
  loading,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState(address);
  const totalAmount = cartItems.reduce(
    (sum, item: any) => sum + item?.price * item.quantity,
    0
  );

  const handleSubmitAddress = () => {
    if (newAddress.trim()) {
      onChangeAddress(newAddress);
      setModalVisible(false);
    }
  };

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: "#2D0140",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      {/* Billing Address */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
      >
        <MaterialCommunityIcons name="home-outline" size={18} color="#fff" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
            Billing Address
          </Text>
          <Text style={{ color: "#CCCCCC", fontSize: 12 }} numberOfLines={1}>
            {address}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={{ color: "#A4F77F", fontWeight: "600", fontSize: 12 }}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Row - Payment & Button */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Pay Using */}
        <TouchableOpacity
          style={{
            backgroundColor: "#5C0B81",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            marginRight: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10 }}>Pay Using</Text>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
            PayTM
          </Text>
        </TouchableOpacity>

        {/* Place Order */}
        <TouchableOpacity
          onPress={onPlaceOrder}
          disabled={cartItems.length === 0}
          style={{
            flex: 1,
            backgroundColor: cartItems.length === 0 ? "#cccccc" : "#A4F77F",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            borderRadius: 12,
            height: 48,
            opacity: cartItems.length === 0 ? 0.6 : 1, // visual cue
          }}
        >
          {loading ? (
            <AnimatedDots />
          ) : (
            <>
              <View>
                <Text style={{ color: "#000", fontSize: 11 }}>Total</Text>
                <Text
                  style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}
                >
                  ₹{totalAmount}
                </Text>
              </View>
              <Text style={{ color: "#000", fontWeight: "bold" }}>
                Place Order ➔
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Change Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              width: "85%",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#2D0140",
              }}
            >
              Enter New Address
            </Text>
            <TextInput
              placeholder="Your address..."
              value={newAddress}
              onChangeText={setNewAddress}
              multiline
              placeholderTextColor="#999"
              style={{
                height: 80,
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingTop: 10,
                marginBottom: 16,
                color: "#000",
              }}
            />
            <TouchableOpacity
              onPress={handleSubmitAddress}
              style={{
                backgroundColor: "#A4F77F",
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#2D0140", fontWeight: "bold" }}>
                Submit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ alignItems: "center", paddingVertical: 6 }}
            >
              <Text style={{ color: "#555" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CartCheckoutCard;
