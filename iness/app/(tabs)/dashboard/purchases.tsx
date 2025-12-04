import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { paymentService } from "@/app/services/payment.service";
import { ActivityIndicator, Dialog, Modal, Portal } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { useFocusEffect } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
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

  // ✅ Run on screen focus, cleanup on unfocus
  useFocusEffect(
    useCallback(() => {
      fetchPayment();

      return () => {
        // cleanup/reset when screen loses focus
        setPayment([]);
        setLoading(false);
        setSnackBarOpen(false);
        setSnackbarMessage("");
      };
    }, [])
  );

  async function fetchPaymentRecipt(orderId: string) {
    try {
      setPaymentLoading(true);
      let response: any = await callService({ orderId });

      if (response && response.success && response.receipt) {
        // Ask user if they want to download
        Alert.alert(
          "✅ Success",
          "Receipt fetched successfully! Do you want to download it?",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: async () => {
                try {
                  const uri = response.receipt; // the receipt link
                  const fileUri = FileSystem.documentDirectory + "receipt.pdf";

                  // Download the file
                  const { uri: localUri } = await FileSystem.downloadAsync(
                    uri,
                    fileUri
                  );

                  // Share/open the file
                  if (Platform.OS === "ios" || Platform.OS === "android") {
                    await Sharing.shareAsync(localUri);
                  } else {
                    Alert.alert("Info", "Receipt downloaded at: " + localUri);
                  }
                } catch (err: any) {
                  Alert.alert(
                    "❌ Error",
                    "Failed to download receipt: " + err.message
                  );
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "⚠️ Failed",
          response?.message || "Unable to fetch receipt",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      Alert.alert("❌ Error", error.message || "Something went wrong", [
        { text: "OK" },
      ]);
    } finally {
      setPaymentLoading(false);
    }
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
    const isSuccess = item.status === "success";

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
                  fontFamily: theme.fonts.bold,
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
                fontFamily: theme.fonts.medium,
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
          <Text
            style={{
              color: "#999",
              fontSize: 13,
              fontFamily: theme.fonts.regular,
            }}
          >
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
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <Portal>
        <Modal visible={paymentLoading} dismissable={false}>
          <View
            style={{
              backgroundColor: "transparent",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              padding: 30,
            }}
          >
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ marginTop: 15, color: "#fff", fontSize: 16 }}>
              Generating Receipt...
            </Text>
          </View>
        </Modal>
      </Portal>
      {/* Header */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? "15%" : "4%",
          paddingLeft: 20,
        }}
      >
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
    </ImageBackground>
  );
}
