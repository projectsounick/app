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
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
      <View style={styles.cardContainer}>
        {/* Top Row: Image, Status, and Receipt */}
        <View style={styles.topRow}>
          {/* Thumbnail from first plan */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.cartItems[0]?.plan?.imgUrl }}
              style={styles.thumbnail}
            />
          </View>

          {/* Status & Receipt */}
          <View style={styles.statusContainer}>
            {/* Status Badge */}
            <LinearGradient
              colors={isSuccess ? ["#67C694", "#4CAF50"] : ["#FFB74D", "#FFA726"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusBadge}
            >
              <Ionicons
                name={isSuccess ? "checkmark-circle" : "time"}
                size={16}
                color="#FFFFFF"
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>
                {isSuccess ? "Delivered" : "Pending"}
              </Text>
            </LinearGradient>
          </View>

          {/* Download Receipt */}
          {isSuccess && (
            <TouchableOpacity
              onPress={() => {
                fetchPaymentRecipt(item._id);
              }}
              style={styles.downloadButton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#9747FF", "#844ACF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.downloadButtonGradient}
              >
                <Feather name="download" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* All Items List */}
        <View style={styles.itemsContainer}>
          {item.cartItems.map((c: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemBullet} />
              <Text style={styles.itemText}>
                {c.quantity}x {c.plan?.title || "Item"}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer: Order info and price */}
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.dateText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>₹{item.amount}</Text>
          </View>
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
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#9747FF", "#844ACF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalGradient}
            >
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.modalText}>
                Generating Receipt...
              </Text>
            </LinearGradient>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondPrimary} />
        </View>
      ) : payment.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <LinearGradient
              colors={["#9747FF", "#844ACF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="receipt-outline" size={44} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No Purchase History</Text>
            <Text style={styles.emptySubtitle}>
              Your purchase history will appear here
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={payment}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  imageContainer: {
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
  },
  statusContainer: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
  },
  downloadButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  downloadButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  itemsContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondPrimary,
    marginRight: 10,
  },
  itemText: {
    fontSize: 14,
    color: "#333",
    fontFamily: theme.fonts.medium,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#F0F0F0",
    marginTop: 12,
    paddingTop: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#666",
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    marginLeft: 6,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 11,
    color: "#999",
    fontFamily: theme.fonts.regular,
    marginBottom: 2,
  },
  priceValue: {
    fontWeight: "700",
    fontSize: 18,
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    width: "100%",
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    color: theme.colors.dark,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: theme.fonts.regular,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: 80,
    paddingTop: 10,
  },
  modalContainer: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    padding: 30,
  },
  modalGradient: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  modalText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
  },
});
