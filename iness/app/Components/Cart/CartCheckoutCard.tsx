import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CartItem } from "@/app/interfaces/cartInterface";
import AnimatedDots from "./LoadingDots";
import { DiscountCoupon } from "@/app/interfaces/otherInterfaces";

interface CartCheckoutSummaryProps {
  cartItems: CartItem[];
  couponDetails: DiscountCoupon | null;
  onPlaceOrder: () => void;
  loading: any;
}

const CartCheckoutCard: React.FC<CartCheckoutSummaryProps> = ({
  cartItems,
  couponDetails,
  onPlaceOrder,
  loading,
}) => {
  const subtotal = cartItems.reduce(
    (sum, item: any) => sum + item?.price * item.quantity,
    0
  );
  let couponePrice = couponDetails?.discountPrice
    ? couponDetails?.discountPrice
    : 0;
  const totalAmount = Math.max(subtotal - couponePrice, 0);

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        backgroundColor: "#2D0140",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      {/* Billing Address */}
      {/* <View
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
      </View> */}

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
            Phone Pe
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
    </View>
  );
};

export default CartCheckoutCard;
