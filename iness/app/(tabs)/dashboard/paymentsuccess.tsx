import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import SmallHeader from "@/app/modules/SmallHeader";
import BackHeader from "@/app/modules/BackHeader";
import { cartService } from "@/app/services/cart.service";
import { paymentService } from "@/app/services/payment.service";
import { planService } from "@/app/services/plan.service";
import { useDispatch } from "react-redux";
import { setActivePlans } from "@/Slices/planSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearCart } from "@/Slices/cartSlice";

const PaymentSuccessScreen = () => {
  const router = useRouter();

  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [orderId, setOrderId] = useState<string | null>(null);
  const [reciptShow, setReciptShow] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "info">("info");
  const [loading, setLoading] = useState(false);
  const [recEiptLoading, setReceiptLoading] = useState(false);
  useEffect(() => {
    fetchOrderStatus();
    Animated.parallel([
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    return () => {
      setOrderId(null);
      // AsyncStorage remove using promise
      AsyncStorage.removeItem("currentOrderId")
        .then(() => console.log("Order ID removed on unmount"))
        .catch((e) => console.error("Failed to remove:", e));
    };
  }, []);
  const dispatch = useDispatch();
  async function fetchOrderStatus() {
    try {
      setLoading(true);
      
      // First check if there's an error message from order placement
      const paymentError = await AsyncStorage.getItem("paymentError");
      
      if (paymentError) {
        // Show the error message from order placement
        setMessage(paymentError);
        setMessageType("error");
        // Clear the error message after displaying
        await AsyncStorage.removeItem("paymentError");
        setLoading(false);
        return;
      }

      // Get orderId from AsyncStorage
      const savedOrderId = await AsyncStorage.getItem("currentOrderId");

      if (savedOrderId) {
        setOrderId(savedOrderId);
        try {
          const response = await cartService.getOrderStatus(savedOrderId);

          if (response.success && response.data.staus === "success") {
            setMessage("Thank you! Payment successful.");
            setMessageType("success");
            const activePlansResp = await planService.getActivePlans();
            if (activePlansResp.success) {
              setReciptShow(true);
              dispatch(setActivePlans(activePlansResp.data));
              dispatch(clearCart());
            }
          } else {
            // Payment failed / incomplete
            setMessage("Your payment could not be processed. Please try again.");
            setMessageType("error");
          }
        } catch (err) {
          setMessage("Something went wrong. Please try again later.");
          setMessageType("error");
        } finally {
          setLoading(false);
        }
      } else {
        // No orderId and no error - might be a direct navigation
        setMessage("No payment information found.");
        setMessageType("info");
        setLoading(false);
      }
    } catch (error) {
      setMessage("Unable to process the payment. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  }
  async function fetchReceipt(orderId: any) {
    try {
      setReceiptLoading(true);

      const response = await paymentService.getReciptData(orderId);

      if (response.success && response.receipt) {
        const supported = await Linking.canOpenURL(response.receipt);
        if (supported) {
          await Linking.openURL(response.receipt);
        } else {
          Alert.alert("Can't open the receipt link.");
        }
      } else {
        setMessage("Receipt not available.");
        setMessageType("warning");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to open receipt.");
      setMessageType("error");
    } finally {
      setReceiptLoading(false);
    }
  }
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      <ImageBackground
        style={{ flex: 1 }}
        source={require("../../../assets/images/basicBackground.jpg")}
      >
        <SmallHeader title="Payment" />
        <BackHeader />

        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator />
          </View>
        ) : (
          <View style={{ marginTop: 20, alignItems: "center", gap: 20, paddingHorizontal: 20, paddingBottom: messageType === "error" ? 200 : 180 }}>
            {/* Message Box with Icon */}
            {message && (
              <View
                style={{
                  width: "100%",
                  backgroundColor: messageType === "success" 
                    ? "#E6FFF0" 
                    : messageType === "error" 
                    ? "#FFEBEE" 
                    : messageType === "warning"
                    ? "#FFF3E0"
                    : "#E3F2FD",
                  borderColor: messageType === "success" 
                    ? "#67C694" 
                    : messageType === "error" 
                    ? "#EF5350" 
                    : messageType === "warning"
                    ? "#FF9800"
                    : "#42A5F5",
                  borderWidth: 1.5,
                  borderRadius: 16,
                  padding: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: messageType === "success" 
                      ? "#67C694" 
                      : messageType === "error" 
                      ? "#EF5350" 
                      : messageType === "warning"
                      ? "#FF9800"
                      : "#42A5F5",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      messageType === "success"
                        ? "check-circle"
                        : messageType === "error"
                        ? "alert-circle"
                        : messageType === "warning"
                        ? "alert"
                        : "information"
                    }
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: messageType === "success" 
                        ? "#1B5E20" 
                        : messageType === "error" 
                        ? "#C62828" 
                        : messageType === "warning"
                        ? "#E65100"
                        : "#1565C0",
                      fontWeight: "700",
                      marginBottom: 4,
                    }}
                  >
                    {messageType === "success"
                      ? "Payment Successful"
                      : messageType === "error"
                      ? "Payment Failed"
                      : messageType === "warning"
                      ? "Warning"
                      : "Information"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: messageType === "success" 
                        ? "#2E7D32" 
                        : messageType === "error" 
                        ? "#D32F2F" 
                        : messageType === "warning"
                        ? "#F57C00"
                        : "#1976D2",
                      fontWeight: "500",
                    }}
                  >
                    {message}
                  </Text>
                </View>
              </View>
            )}

            {/* Receipt Download Card */}
            {reciptShow ? (
              <TouchableOpacity
                onPress={() => {
                  // TODO: Implement actual receipt download
                  fetchReceipt(orderId);
                }}
                activeOpacity={0.8}
                style={{
                  width: "90%",
                  borderRadius: 20,
                  backgroundColor: "#fff",
                  padding: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                }}
              >
                {recEiptLoading ? (
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator color="#9747FF" />
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: "#E6FFF0",
                      borderRadius: 50,
                      padding: 12,
                      marginRight: 16,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>📄</Text>
                  </View>
                )}

                <View>
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", color: "#222" }}
                  >
                    Download your receipt
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    Tap to get your payment receipt
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Bottom CTA - White Sheet for Failed/Error, Gradient for Success */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            transform: [{ translateY: slideUpAnim }],
            opacity: opacityAnim,
          }}
        >
          {/* White Bottom Sheet for All Cases */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 12,
              paddingHorizontal: 20,
              paddingBottom: 0,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 10,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: "#F5F5F5",
            }}
          >
            {/* Dash Handle */}
            <View
              style={{
                width: 50,
                height: 5,
                backgroundColor: "#E0E0E0",
                borderRadius: 3,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            {messageType === "error" ? (
              <>
                {/* Go to Cart Button */}
                <TouchableOpacity
                  onPress={() => router.replace("/(tabs)/dashboard/cart")}
                  style={{
                    backgroundColor: "#67C694",
                    paddingVertical: 14,
                    borderRadius: 25,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    marginBottom: 12,
                    shadowColor: "#67C694",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="cart" size={20} color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Go to Cart
                  </Text>
                </TouchableOpacity>

                {/* Plans Button */}
                <TouchableOpacity
                  onPress={() => router.replace("/(tabs)/dashboard/tabs/train")}
                  style={{
                    backgroundColor: "#F3EDFF",
                    paddingVertical: 14,
                    borderRadius: 25,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#E0D5FF",
                  }}
                >
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#9747FF" />
                  <Text
                    style={{
                      color: "#9747FF",
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    View Plans
                  </Text>
                </TouchableOpacity>

                {/* Continue Exploring Button */}
                <TouchableOpacity
                  onPress={() => router.replace("/(tabs)/dashboard/tabs")}
                  style={{
                    paddingTop: 14,
                    paddingBottom: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                  }}
                >
                  <Ionicons name="compass-outline" size={18} color="#666" />
                  <Text
                    style={{
                      color: "#666",
                      fontSize: 14,
                      fontWeight: "500",
                      marginLeft: 8,
                    }}
                  >
                    Continue Exploring
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* See my plans Button for Success */}
                <TouchableOpacity
                  onPress={() => router.replace("/(tabs)/dashboard/tabs/train")}
                  style={{
                    backgroundColor: "#67C694",
                    paddingVertical: 14,
                    borderRadius: 25,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    marginBottom: 12,
                    shadowColor: "#67C694",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <MaterialCommunityIcons name="clipboard-check" size={20} color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    See my plans
                  </Text>
                </TouchableOpacity>

                {/* Continue Exploring Button */}
                <TouchableOpacity
                  onPress={() => router.replace("/(tabs)/dashboard/tabs")}
                  style={{
                    paddingTop: 14,
                    paddingBottom: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                  }}
                >
                  <Ionicons name="compass-outline" size={18} color="#666" />
                  <Text
                    style={{
                      color: "#666",
                      fontSize: 14,
                      fontWeight: "500",
                      marginLeft: 8,
                    }}
                  >
                    Continue exploring
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default PaymentSuccessScreen;
