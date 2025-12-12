import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  const subtotal = cartItems.reduce((sum, item: any) => {
    const price = typeof item?.price === 'number' ? item.price : 0;
    const quantity = typeof item?.quantity === 'number' ? item.quantity : 0;
    return sum + (price * quantity);
  }, 0);
  let couponePrice = couponDetails?.discountPrice
    ? couponDetails?.discountPrice
    : 0;
  const totalAmount = Math.max(subtotal - couponePrice, 0);

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 30,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#F5F5F5",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {/* Price Summary */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F5F5F5",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Ionicons name="receipt-outline" size={18} color="#9747FF" />
          </View>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#1A1A1A" }}>
            Total Amount
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A1A" }}>
          ₹{totalAmount}
        </Text>
      </View>

      {/* Bottom Row - Payment & Button */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Pay Using */}
        <View
          style={{
            backgroundColor: "#F3EDFF",
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E8DEFF",
          }}
        >
          <Text style={{ color: "#9747FF", fontSize: 10, fontWeight: "500" }}>Pay Using</Text>
          <Text style={{ color: "#9747FF", fontWeight: "700", fontSize: 13 }}>
            PhonePe
          </Text>
        </View>

        {/* Place Order */}
        <TouchableOpacity
          onPress={onPlaceOrder}
          disabled={cartItems.length === 0}
          style={{
            flex: 1,
            backgroundColor: cartItems.length === 0 ? "#D0D0D0" : "#67C694",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
            borderRadius: 30,
            height: 50,
            opacity: cartItems.length === 0 ? 0.6 : 1,
            shadowColor: "#67C694",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: cartItems.length === 0 ? 0 : 0.4,
            shadowRadius: 6,
            elevation: cartItems.length === 0 ? 0 : 6,
            gap: 8,
          }}
        >
          {loading ? (
            <AnimatedDots />
          ) : (
            <>
              <MaterialCommunityIcons name="cart-check" size={20} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                Place Order
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartCheckoutCard;
