import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useRouter, usePathname, useFocusEffect } from "expo-router";
import PhonePePaymentSDK from "react-native-phonepe-pg";
import SmallHeader from "@/app/modules/SmallHeader";
// Base64 encode it before using with startTransaction
import { Buffer } from "buffer";

import CartItemList from "@/app/Components/Cart/CartItemCard";
import CartCheckoutCard from "@/app/Components/Cart/CartCheckoutCard";

import BackHeader from "@/app/modules/BackHeader";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cartService } from "@/app/services/cart.service";
import { SafeAreaView } from "react-native-safe-area-context";
import { paymentService } from "@/app/services/payment.service";
import { ActivityIndicator } from "react-native-paper";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PhonePeTransactionResponse {
  success: boolean;
  body: string;
  checksum: string;
  orderId: string;
  merchantId: string;
}

///// Main functional component for the cart screen -------------------------/
export default function CartScreen() {
  //// getting the cart values from the store -------------------------/
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [snackbarOpen, setSnackBarOpen] = useState(false);
  const [merchentId, setMerchenId] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const handleAdd = () => {
    router.replace("/dashboard/tabs/store");
  };
  const [dataFetchLogin, setDataFetchLogin] = useState(false);
  /// Function for chaning the address ------------------------/
  function onChangeAddress() {}

  /// Function for placing the order ----------------------------.
  async function onplaceOrder() {
    try {
      const response: any = await cartService.getPhonePeUrl();
      const orderId = response?.data?.orderId;
      console.log(response);

      if (orderId) {
        console.log("Order ID:", orderId);

        // Save redirect flag for later detection
        await AsyncStorage.setItem("currentOrderId", orderId);

        // Now redirect to web page that handles PhonePe payment
        const websiteRedirectUrl = `http://iness.fitness/pay/${orderId}`;
        Linking.openURL(websiteRedirectUrl); // Opens in external browser
      } else {
        throw new Error("Missing orderId or redirect URL");
      }
    } catch (error: any) {
      console.log(error);

      setSnackBarOpen(true);
      setSnackbarMessage(error.message);
    } finally {
      setLoading(false);
      router.push("/(tabs)/dashboard/paymentsuccess");
    }
  }

  return (
    <>
      {/* Header + Content */}
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f2f2f2" }}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <SmallHeader title="Cart" />
          <BackHeader />
          {dataFetchLogin ? (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator />{" "}
            </View>
          ) : (
            <View style={{ padding: 20, flex: 1, backgroundColor: "#fff" }}>
              <CartItemList items={cartItems} onAddItem={handleAdd} />
            </View>
          )}
        </View>
        <CartCheckoutCard
          cartItems={cartItems}
          onChangeAddress={onChangeAddress}
          onPlaceOrder={onplaceOrder}
          address={"Howrah kolkata"}
          loading={loading}
        />
        <CustomSnackbar
          visible={snackbarOpen}
          message={snackbarMessage}
          bgColor={theme.colors.primary}
          onDismiss={() => setSnackBarOpen(false)}
        />
      </SafeAreaView>
    </>
  );
}
