import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import SmallHeader from "@/app/modules/SmallHeader";

import CartItemList from "@/app/Components/Cart/CartItemCard";
import CartCheckoutCard from "@/app/Components/Cart/CartCheckoutCard";
import RazorpayCheckout from "react-native-razorpay";
import BackHeader from "@/app/modules/BackHeader";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cartService } from "@/app/services/cart.service";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";

import CustomSnackbar from "@/app/modules/Snackbar";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddressModal from "@/app/Modals/AddressModal";
import CouponModal from "@/app/Modals/CouponModal";
import { DiscountCoupon } from "@/app/interfaces/otherInterfaces";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

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

  const [dataFetchLogin, setDataFetchLogin] = useState(false);
  async function onplaceOrder(
    address: string,
    couponDetails: DiscountCoupon | null
  ) {
    let createdOrderId: string | null = null;

    try {
      setLoading(true);
      const data = {
        couponCode: couponDetails ? couponDetails.code : null,
        address: address,
      };

      const response: any = await cartService.createRazorpayOrder(data);
      const orderId = response?.orderId;
      const razorpayOrderId = response?.razorpayOrderId;
      const razorpayKey = response?.key;
      const amount = response?.amount;
      const currency = response?.currency || "INR";

      if (!orderId || !razorpayOrderId || !razorpayKey || !amount) {
        throw new Error("Missing Razorpay checkout details");
      }

      createdOrderId = orderId;
      await AsyncStorage.setItem("currentOrderId", orderId);
      await AsyncStorage.removeItem("paymentError");

      const userResponse =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      const user = userResponse?.data;

      const razorpayResponse = await RazorpayCheckout.open({
        key: razorpayKey,
        amount: String(amount),
        currency,
        name: "Iness Fitness",
        description: "Complete your order",
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phoneNumber || "",
        },
        notes: {
          internalOrderId: orderId,
        },
        theme: {
          color: theme.colors.success,
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

      router.push("/(tabs)/dashboard/paymentsuccess");
    } catch (error: any) {
      const errorMessage = extractRazorpayErrorMessage(error);

      if (createdOrderId) {
        await AsyncStorage.setItem("currentOrderId", createdOrderId);
      } else {
        await AsyncStorage.removeItem("currentOrderId");
      }

      await AsyncStorage.setItem("paymentError", errorMessage);
      router.push("/(tabs)/dashboard/paymentsuccess");
    } finally {
      setLoading(false);
      setDeliveryAddress({
        fullAddress: "",
        city: "",
        state: "",
        pincode: "",
      });
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
          onClose={() => setShowAddressModal(false)}
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
