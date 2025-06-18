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

import SmallHeader from "@/app/modules/SmallHeader";
import BackHeader from "@/app/modules/BackHeader";
import { cartService } from "@/app/services/cart.service";
import theme from "@/app/Theme/globalTheme";
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
      // Get orderId from AsyncStorage
      const savedOrderId = await AsyncStorage.getItem("currentOrderId");

      if (savedOrderId) {
        setOrderId(savedOrderId);
        setLoading(true);
        const response = await cartService.getOrderStatus(savedOrderId);
        if (response.success) {
          setMessage("Thank you! Payment successful.");
          const response = await planService.getActivePlans();
          if (response.success) {
            setReciptShow(true);
            dispatch(setActivePlans(response.data));
            dispatch(clearCart());
          }
        }
      }
    } catch (error) {
      setMessage("Unable to process the payment");
    } finally {
      setLoading(false);
    }
  }
  async function fetchReceipt(orderId: any) {
    try {
      setReceiptLoading(true);
      console.log(orderId);

      const response = await paymentService.getReciptData(orderId);
      console.log(response);

      if (response.success && response.receipt) {
        const supported = await Linking.canOpenURL(response.receipt);
        if (supported) {
          await Linking.openURL(response.receipt);
        } else {
          Alert.alert("Can't open the receipt link.");
        }
      } else {
        setMessage("Receipt not available.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to open receipt.");
    } finally {
      setReceiptLoading(false);
    }
  }
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right", "bottom"]}
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
          <View style={{ marginTop: 20, alignItems: "center", gap: 20 }}>
            {/* Thank You Message Box */}
            <View
              style={{
                backgroundColor: "#E6FFF0",
                borderColor: "rgba(225, 255, 239, 1)",
                width: "90%",
                borderWidth: 1,
                borderRadius: 100,
                paddingVertical: 14,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "rgba(18, 106, 59, 1)",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
            </View>

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
                    <ActivityIndicator color={theme.colors.secondPriamy} />
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

        {/* Bottom CTA with Gradient */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            transform: [{ translateY: slideUpAnim }],
            opacity: opacityAnim,
          }}
        >
          <LinearGradient
            colors={["#140A21", "#522987"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 20,
              alignItems: "center",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          >
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/dashboard/tabs/train")}
              style={{
                backgroundColor: theme.colors.primary, // Green button
                paddingVertical: 14,
                paddingHorizontal: 30,
                borderRadius: 30,
                alignItems: "center",
                width: "80%",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  color: "#000",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                See my plans
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/dashboard/tabs")}
              style={{ marginTop: 12 }}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                Continue exploring
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default PaymentSuccessScreen;
