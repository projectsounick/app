import React, { useState } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useRouter, usePathname } from "expo-router";

import SmallHeader from "@/app/modules/SmallHeader";

import CartItemList from "@/app/Components/Cart/CartItemCard";
import CartCheckoutCard from "@/app/Components/Cart/CartCheckoutCard";

import BackHeader from "@/app/modules/BackHeader";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cartService } from "@/app/services/cart.service";

///// Main functional component for the cart screen -------------------------/
export default function CartScreen() {
  //// getting the cart values from the store -------------------------/
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [snackbarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const handleAdd = () => {
    router.replace("/dashboard/tabs/store");
  };
  /// Function for chaning the address ------------------------/
  function onChangeAddress() {}

  /// Function for placing the order ----------------------------.
  async function onplaceOrder() {
    try {
      setLoading(true);
      const response = await cartService.getPhonePeUrl();
      if (response.success) {
        console.log("Redirecting to:", response.data.redirectUrl);
        Linking.openURL(response.data.redirectUrl);
      }
    } catch (error: any) {
      setSnackBarOpen(true);
      setSnackbarMessage(error.message);
    } finally {
      setLoading(false);
    }
  }
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
        cartItems={cartItems}
        onChangeAddress={onChangeAddress}
        onPlaceOrder={onplaceOrder}
        address={"Howrah kolkata"}
        loading={loading}
      />
    </>
  );
}
