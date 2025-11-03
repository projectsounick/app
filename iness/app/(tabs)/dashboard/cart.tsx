import React, { useEffect, useState } from "react";
import { View, Linking, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

import SmallHeader from "@/app/modules/SmallHeader";
// Base64 encode it before using with startTransaction

import CartItemList from "@/app/Components/Cart/CartItemCard";
import CartCheckoutCard from "@/app/Components/Cart/CartCheckoutCard";
import PhonePePayment from "react-native-phonepe-pg";
import BackHeader from "@/app/modules/BackHeader";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cartService } from "@/app/services/cart.service";
import { SafeAreaView } from "react-native-safe-area-context";
import { paymentService } from "@/app/services/payment.service";
import { ActivityIndicator } from "react-native-paper";

import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddressModal from "@/app/Components/Cart/AddressModal";
import CouponModal from "@/app/Components/Cart/CouponModal";
import { DiscountCoupon } from "@/app/interfaces/otherInterfaces";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";

export interface PhonePeTransactionResponse {
  success: boolean;
  body: string;
  checksum: string;
  orderId: string;
  merchantId: string;
}

///// Main functional component for the cart screen -------------------------/
function CartScreen() {
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
  const handleAdd = () => {
    router.replace("/dashboard/tabs/store");
  };
  const [dataFetchLogin, setDataFetchLogin] = useState(false);
  const merchantId = "M23WC6W062GQI"; // your PhonePe merchantId
  const flowId = "cart_flow_" + Date.now(); // unique identifier for this flow

  useEffect(() => {
    const initPhonePe = async () => {
      try {
        const result = await PhonePePayment.init(
          "PRODUCTION",
          merchantId,
          flowId,
          true // enable logging, set false in prod
        );
        console.log("PhonePe SDK initialized:", result);
      } catch (error) {
        console.log("PhonePe init error:", error);
      }
    };

    initPhonePe();
  }, []);
  // Function for placing the order ----------------------------.
  async function onplaceOrder(
    address: string,
    couponDetails: DiscountCoupon | null
  ) {
    try {
      let data = {
        couponCode: couponDetails ? couponDetails.code : null,
        address: address,
      };
      const response: any = await cartService.getPhonePeUrl(data);
      const orderId = response?.data?.orderId;

      if (orderId) {
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
      setDeliveryAddress({
        fullAddress: "",
        city: "",
        state: "",
        pincode: "",
      });
      router.push("/(tabs)/dashboard/paymentsuccess");
    }
  }
  // async function onplaceOrder(
  //   address: string,
  //   couponDetails: DiscountCoupon | null
  // ) {
  //   try {
  //     setLoading(true);

  //     const data = {
  //       couponCode: couponDetails ? couponDetails.code : null,
  //       address: address,
  //     };

  //     const response: any = await cartService.getPhonePeUrl(data);

  //     if (response.success) {
  //       const { orderId, orderToken } = response;
  //       const merchantId = "M23WC6W062GQI";

  //       // Construct request JSON as per SDK docs
  //       const requestBody = {
  //         orderId: orderId,
  //         merchantId: merchantId,
  //         token: orderToken,
  //         paymentMode: {
  //           type: "PAY_PAGE", // required for standard checkout
  //         },
  //       };

  //       // Convert to string for startTransaction
  //       const requestString = JSON.stringify(requestBody);

  //       // Use SDK call
  //       const txnResponse = await PhonePePayment.startTransaction(
  //         requestString,
  //         "myapp" // your app scheme from app.json
  //       );

  //       console.log("PhonePe txn response:", txnResponse);

  //       if (txnResponse?.status === "SUCCESS") {
  //         router.push(`/dashboard/paymentsuccess?orderId=${orderId}`);
  //       } else if (txnResponse?.status === "FAILURE") {
  //         alert("Transaction failed");
  //       } else if (txnResponse?.status === "INTERRUPTED") {
  //         alert("Transaction interrupted");
  //       }
  //     } else {
  //       alert("Some error happened");
  //     }
  //   } catch (error: any) {
  //     console.log("PhonePe error:", error);
  //     setSnackBarOpen(true);
  //     setSnackbarMessage(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  return (
    <>
      {/* Header + Content */}
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f2f2f2" }}
        edges={["left", "right"]}
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
              <ActivityIndicator />
            </View>
          ) : (
            <View style={{ padding: 20, flex: 1, backgroundColor: "#fff" }}>
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
