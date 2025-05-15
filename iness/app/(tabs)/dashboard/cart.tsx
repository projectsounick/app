import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SmallHeader from "@/app/modules/SmallHeader";
import BottomNavBar from "@/app/modules/BottomNavBar";
import { demoCartItems } from "@/utils/staticDataUtils";
import CartItemList from "@/app/Components/Cart/CartItemCard";
import CartCheckoutCard from "@/app/Components/Cart/CartCheckoutCard";

///// Main functional component for the cart screen -------------------------/
export default function CartScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartItems, setCartItems] = useState(demoCartItems);
  const handleAdd = () => {
    console.log("Add button clicked!");
  };
  /// Function for chaning the address ------------------------/
  function onChangeAddress() {}

  /// Function for placing the order ----------------------------.
  function onplaceOrder() {}
  return (
    <>
      {/* Header + Content */}
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <SmallHeader title="Cart" />
        <View style={{ padding: 20, flex: 1, backgroundColor: "#fff" }}>
          <CartItemList items={cartItems} onAddItem={handleAdd} />
        </View>
      </View>
      <CartCheckoutCard
        onChangeAddress={onChangeAddress}
        onPlaceOrder={onplaceOrder}
        totalAmount={2000}
        address={"Howrah kolkata"}
      />
      {/* Custom Bottom Tab Bar */}
      <BottomNavBar router={router} pathname={pathname} />
    </>
  );
}
