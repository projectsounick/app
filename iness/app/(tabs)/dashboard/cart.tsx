import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SmallHeader from "@/app/modules/SmallHeader";
import BottomNavBar from "@/app/modules/BottomNavBar";
import { demoCartItems } from "@/utils/staticDataUtils";
import CartItemList from "@/app/Components/Cart/CartItemCard";
import CartCheckoutCard from "@/app/Components/Cart/CartCheckoutCard";
import NormalHeader from "@/app/modules/NormalHeader";
import BackHeader from "@/app/modules/BackHeader";

///// Main functional component for the cart screen -------------------------/
export default function CartScreen() {
  console.log("cart screen got loaded");

  const router = useRouter();
  const pathname = usePathname();
  const [cartItems, setCartItems] = useState(demoCartItems);
  const handleAdd = () => {
    router.replace("/dashboard/tabs/equip");
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
        <BackHeader />
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
    </>
  );
}
