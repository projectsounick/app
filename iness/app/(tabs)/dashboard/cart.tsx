import React, { useEffect, useRef, useState } from "react";
import { NativeModules, View } from "react-native";
import { useRouter } from "expo-router";

import SmallHeader from "@/src/modules/SmallHeader";

import CartItemList from "@/src/Components/Cart/CartItemCard";
import CartCheckoutCard from "@/src/Components/Cart/CartCheckoutCard";
import RazorpayCheckout from "react-native-razorpay";
import BackHeader from "@/src/modules/BackHeader";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cartService } from "@/src/services/cart.service";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";

import CustomSnackbar from "@/src/modules/Snackbar";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddressModal from "@/src/Modals/AddressModal";
import CouponModal from "@/src/Modals/CouponModal";
import { DiscountCoupon } from "@/src/interfaces/otherInterfaces";
import { LoginWrapper } from "@/src/Hoc/LoginWrapper";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import * as Crypto from "expo-crypto";

export interface PhonePeTransactionResponse {
  success: boolean;
  body: string;
  checksum: string;
  orderId: string;
  merchantId: string;
}

function extractRazorpayErrorMessage(error: any) {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error?.description) {
    return error.description;
  }

  if (error?.error?.description) {
    return error.error.description;
  }

  if (error?.message) {
    return error.message;
  }

  return "Payment was not completed. Please try again.";
}

///// Main functional component for the cart screen -------------------------/
function CartScreen() {
  const theme = useGlobalTheme();
  //// getting the cart values from the store -------------------------/
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [couponDetails, setCouponDetails] = useState<DiscountCoupon | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [snackbarOpen, setSnackBarOpen] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const checkoutInProgressRef = useRef(false);

  const [dataFetchLogin, setDataFetchLogin] = useState(false);
  async function onplaceOrder(
    address: string,
    couponDetails: DiscountCoupon | null
  ) {
    if (checkoutInProgressRef.current) {
      return;
    }
    checkoutInProgressRef.current = true;
    let createdOrderId: string | null = null;

    try {
      setLoading(true);
      if (!NativeModules.RNRazorpayCheckout?.open) {
        throw new Error(
          "Payment checkout is unavailable in this app build. Please update the app."
        );
      }
      const data = {
        couponCode: couponDetails ? couponDetails.code : null,
        address: address,
        checkoutRequestId: Crypto.randomUUID(),
      };

      const response: any = await cartService.createRazorpayOrder(data);
      const orderId = response?.orderId;
      const razorpayOrderId = response?.razorpayOrderId;
      const razorpayKey = response?.key;
      const amount = response?.amount;
      const currency = response?.currency || "INR";

      if (response?.alreadyPaid && orderId) {
        createdOrderId = orderId;
        await AsyncStorage.setItem("currentOrderId", orderId);
        await AsyncStorage.removeItem("paymentError");
        router.replace("/(tabs)/dashboard/paymentsuccess");
        return;
      }

      if (!orderId || !razorpayOrderId || !razorpayKey || !amount) {
        throw new Error("Missing Razorpay checkout details");
      }

      createdOrderId = orderId;
      await AsyncStorage.setItem("currentOrderId", orderId);
      await AsyncStorage.removeItem("paymentError");

      const userResponse =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      const user = userResponse?.data;

      // The server step is complete. Do not leave an app loader covering the
      // native iOS/Android Razorpay checkout while the customer is paying.
      setLoading(false);
      const cleanPhone = (user?.phoneNumber || "")
        .replace(/^\+91/, "")
        .replace(/\D/g, "")
        .slice(-10);

      const razorpayResponse = await RazorpayCheckout.open({
        key: razorpayKey,
        amount: String(amount),
        currency: currency || "INR",
        name: "Iness Fitness",
        description: "Complete your order",
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: cleanPhone,
        },
        notes: {
          internalOrderId: orderId,
        },
        theme: {
          color: theme.colors.success,
        },
        retry: {
          enabled: true,
          max_count: 4,
        },
      });

      const verificationResponse: any = await cartService.verifyRazorpayPayment({
        orderId,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      });

      if (!verificationResponse?.success) {
        await AsyncStorage.setItem(
          "paymentError",
          verificationResponse?.message ||
            "Payment captured, but confirmation is still pending."
        );
      } else {
        await AsyncStorage.removeItem("paymentError");
      }

      router.replace("/(tabs)/dashboard/paymentsuccess");
    } catch (error: any) {
      const errorMessage = extractRazorpayErrorMessage(error);

      if (createdOrderId) {
        try {
          const statusResponse: any =
            await cartService.getOrderStatus(createdOrderId);
          const resolvedStatus =
            statusResponse?.data?.status ||
            statusResponse?.data?.payment?.status;
          if (statusResponse?.success && resolvedStatus === "success") {
            await AsyncStorage.setItem("currentOrderId", createdOrderId);
            await AsyncStorage.removeItem("paymentError");
            router.replace("/(tabs)/dashboard/paymentsuccess");
            return;
          }
        } catch (_statusError) {
          // The checkout error remains the useful message for the customer.
        }
      }

      await AsyncStorage.setItem(
        "paymentError",
        errorMessage || "Payment was not completed. Please try again."
      );
      if (createdOrderId) {
        await AsyncStorage.setItem("currentOrderId", createdOrderId);
      } else {
        await AsyncStorage.removeItem("currentOrderId");
      }
      router.replace("/(tabs)/dashboard/paymentsuccess");
    } finally {
      checkoutInProgressRef.current = false;
      setLoading(false);
    }
  }
  return (
    <>
      {/* Header + Content */}
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={["left", "right"]}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
              <ActivityIndicator color={theme.colors.secondPrimary} />
            </View>
          ) : (
            <View style={{ padding: 20, flex: 1, backgroundColor: theme.colors.background }}>
              <CartItemList
                items={cartItems}
                setCouponDetails={setCouponDetails}
                couponDetails={couponDetails}
              />
            </View>
          )}
        </View>
        <CartCheckoutCard
          cartItems={cartItems}
          onPlaceOrder={() => setShowAddressModal(true)}
          loading={loading}
          couponDetails={couponDetails}
        />
        <CustomSnackbar
          visible={snackbarOpen}
          message={snackbarMessage}
          bgColor={theme.colors.primary}
          onDismiss={() => setSnackBarOpen(false)}
        />
        <AddressModal
          visible={showAddressModal}
          onClose={async () => {
            setShowAddressModal(false);
            await AsyncStorage.removeItem("currentOrderId");
            await AsyncStorage.setItem(
              "paymentError",
              "Checkout was stopped. Delivery address was not provided."
            );
            router.replace("/(tabs)/dashboard/paymentsuccess");
          }}
          address={deliveryAddress}
          setAddress={setDeliveryAddress}
          onConfirm={(addr) => {
            const { fullAddress, city, state, pincode } = addr;

            if (!fullAddress || !city || !state || !pincode) {
              alert("Please fill in all address fields before proceeding.");
              return;
            }
            const finalAddress = `${addr.fullAddress}_${addr.city}_${addr.state}_${addr.pincode}`;
            setShowAddressModal(false);
            onplaceOrder(finalAddress, couponDetails);
          }}
        />
      </SafeAreaView>
    </>
  );
}
export default LoginWrapper(CartScreen);
