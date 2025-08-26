import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { paymentService } from "@/app/services/payment.service";
import { ActivityIndicator } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";

export default function PaymentScreen() {
  const [payment, setPayment] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const {
    loading: paymentLoading,
    data,
    setLoading: setPaymentLoading,
    callService,
    snackbarVisible,

    setSnackbarVisible,
  } = useServiceWithSnackbar(paymentService.getReciptData);
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const response = await paymentService.getTotalPurchaseHistory();
        console.log("this is response");

        console.log(response);

        if (response.success) {
          setPayment(response.data);
        } else {
          setSnackbarMessage("Failed to fetch payment history");
          setSnackBarOpen(true);
        }
      } catch (err) {
        setSnackbarMessage("Something went wrong");
        setSnackBarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, []);

  async function fetchPaymentRecipt(orderId: string) {
    try {
      console.log("called");

      let response = await callService({ orderId });
      console.log("this is response");
      console.log(response);
    } catch (error) {}
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSuccess = item.status === "sucess";

    return (
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          marginHorizontal: 16,
          marginBottom: 14,
          padding: 14,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        {/* Top Row: Image, Status, and Receipt */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Thumbnail from first plan */}
          <Image
            source={{ uri: item.cartItems[0]?.plan?.imgUrl }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              backgroundColor: "#eee",
              marginRight: 12,
            }}
          />

          {/* Status & Receipt */}
          <View style={{ flex: 1 }}>
            {/* Status Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
                backgroundColor: isSuccess ? "#e0f7ec" : "#fff3cd",
                alignSelf: "flex-start",
              }}
            >
              <Ionicons
                name={isSuccess ? "checkmark-circle" : "time"}
                size={16}
                color={isSuccess ? "#28a745" : "#f0ad4e"}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: isSuccess ? "#28a745" : "#f0ad4e",
                }}
              >
                {isSuccess ? "Delivered" : "Pending"}
              </Text>
            </View>
          </View>

          {/* Download Receipt */}
          {isSuccess && (
            <TouchableOpacity
              onPress={() => {
                fetchPaymentRecipt(item._id);
              }}
            >
              <Feather name="download" size={20} color="#555" />
            </TouchableOpacity>
          )}
        </View>

        {/* All Items List */}
        <View style={{ marginTop: 12 }}>
          {item.cartItems.map((c: any, index: number) => (
            <Text
              key={index}
              style={{
                fontSize: 13,
                color: "#333",
                marginBottom: 4,
              }}
            >
              {c.quantity}x {c.plan?.title || "Item"}
            </Text>
          ))}
        </View>

        {/* Footer: Order info and price */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderColor: "#eee",
            marginTop: 12,
            paddingTop: 10,
          }}
        >
          <Text style={{ color: "#999", fontSize: 13 }}>
            Ordered: {formatDate(item.createdAt)}
          </Text>
          <Text style={{ fontWeight: "600", fontSize: 14 }}>
            ₹{item.amount}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={{ paddingTop: 30, paddingLeft: 20 }}>
          <NormalHeader screenName="Purchase History" />
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={payment}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
          />
        )}

        <CustomSnackbar
          onDismiss={() => setSnackBarOpen(false)}
          visible={snackbarOpen}
          message={snackbarMessage}
          bgColor={theme.colors.primary}
        />
        {paymentLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent overlay
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
            }}
          >
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}
