import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CartItem } from "@/app/interfaces/cartInterface";
import AnimatedDots from "./LoadingDots";
import { DiscountCoupon } from "@/app/interfaces/otherInterfaces";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
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
        backgroundColor: isDark ? theme.colors.backgroundSecondary : theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.colors.border,
        ...(isDark ? {} : {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }),
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
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: theme.colors.backgroundCardLight,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Ionicons name="receipt-outline" size={18} color={theme.colors.secondPrimary} />
          </View>
          <Text style={{ fontSize: theme.fontSizes.regular, fontWeight: theme.fontWeights.medium as "500", color: theme.colors.text }}>
            Total Amount
          </Text>
        </View>
        <Text style={{ fontSize: theme.fontSizes.large, fontWeight: theme.fontWeights.bold as "700", color: isDark ? theme.colors.textWhite : theme.colors.text }}>
          ₹{totalAmount}
        </Text>
      </View>

      {/* Bottom Row - Payment & Button */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Pay Using */}
        <View
          style={{
            backgroundColor: theme.colors.backgroundCardLight,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.secondPrimary, fontSize: theme.fontSizes.small, fontWeight: theme.fontWeights.medium as "500" }}>Pay Using</Text>
          <Text style={{ color: theme.colors.secondPrimary, fontWeight: theme.fontWeights.bold as "700", fontSize: theme.fontSizes.regularSmall }}>
            Razorpay
          </Text>
        </View>

        {/* Place Order */}
        <TouchableOpacity
          onPress={onPlaceOrder}
          disabled={cartItems.length === 0}
          style={{
            flex: 1,
            backgroundColor: cartItems.length === 0 ? theme.colors.border : theme.colors.success,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
            borderRadius: 30,
            height: 50,
            opacity: cartItems.length === 0 ? 0.6 : 1,
            shadowColor: theme.colors.success,
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
              <MaterialCommunityIcons name="cart-check" size={20} color={theme.colors.textWhite} />
              <Text
                style={{
                  color: theme.colors.textWhite,
                  fontWeight: theme.fontWeights.bold as "700",
                  fontSize: theme.fontSizes.regular,
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
