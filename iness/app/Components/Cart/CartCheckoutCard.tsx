import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CartCheckoutSummaryProps {
  totalAmount: number;
  address: string;
  onChangeAddress: () => void;
  onPlaceOrder: () => void;
}

const CartCheckoutCard: React.FC<CartCheckoutSummaryProps> = ({
  totalAmount,
  address,
  onChangeAddress,
  onPlaceOrder,
}) => {
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
        <TouchableOpacity onPress={onChangeAddress}>
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
          style={{
            flex: 1,
            backgroundColor: "#A4F77F",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            borderRadius: 12,
            height: 48,
          }}
        >
          <View>
            <Text style={{ color: "#000", fontSize: 11 }}>Total</Text>
            <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>
              ₹{totalAmount}
            </Text>
          </View>
          <Text style={{ color: "#000", fontWeight: "bold" }}>
            Place Order ➔
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartCheckoutCard;
