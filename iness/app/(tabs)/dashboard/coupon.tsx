import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ImageBackground,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import NormalHeader from "@/app/modules/NormalHeader";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import theme from "@/app/Theme/globalTheme";
import { CouponInterface } from "@/app/interfaces/otherInterfaces";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { couponService } from "@/app/services/coupon.service";
import CustomSnackbar from "@/app/modules/Snackbar";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");
const topPadding = height * 0.05;
const backgroundImg = require("../../../assets/images/basicBackground.jpg");

export default function CouponScreen() {
  const [coupons, setCoupons] = useState<CouponInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    async function fetchCoupons() {
      try {
        setLoading(true);
        const loggedUser =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        if (loggedUser.exists) {
          const couponResponse = await couponService.getAllCoupons();

          if (couponResponse.success) {
            setCoupons(couponResponse.data);
            setSnackBarOpen(true);
            setSnackbarMessage("Coupons loaded successfully");
          } else {
            setSnackBarOpen(true);
            setSnackbarMessage("Failed to load coupons. Please try again.");
          }
        } else {
          setSnackBarOpen(true);
          setSnackbarMessage("Please login to view coupons");
        }
      } catch (error: any) {
        console.log(`Error: ${error.message}`);
        setSnackBarOpen(true);
        setSnackbarMessage("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  const copyToClipboard = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      setSnackbarMessage(`Coupon code "${code}" copied to clipboard!`);
      setSnackBarOpen(true);
    } catch (error) {
      Alert.alert("Error", "Failed to copy coupon code");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          {/* Header */}
          <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="Coupons" />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9747FF" />
              <Text style={styles.loadingText}>Loading coupons...</Text>
            </View>
          ) : coupons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="ticket-outline"
                size={64}
                color="#9747FF"
              />
              <Text style={styles.emptyTitle}>No Coupons Available</Text>
              <Text style={styles.emptyText}>
                You don't have any coupons at the moment. Check back later for
                new offers!
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Description Section */}
              <View style={styles.descriptionContainer}>
                <View style={styles.descriptionHeader}>
                  <MaterialCommunityIcons
                    name="ticket-percent"
                    size={24}
                    color="#9747FF"
                  />
                  <Text style={styles.descriptionTitle}>
                    Available Coupons
                  </Text>
                </View>
                <Text style={styles.descriptionText}>
                  Tap on any coupon to copy the code and use it during checkout
                  to avail discounts on your purchases.
                </Text>
              </View>

              {/* Coupons List */}
              <View style={styles.couponsContainer}>
                {coupons.map((coupon, index) => (
                  <TouchableOpacity
                    key={coupon._id || index}
                    activeOpacity={0.9}
                    onPress={() => copyToClipboard(coupon.code)}
                    style={styles.couponCardWrapper}
                  >
                    <LinearGradient
                      colors={["#9747FF", "#7B2CBF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.couponGradient}
                    >
                      <View style={styles.couponCard}>
                        {/* Top Section - Title */}
                        <View style={styles.couponHeader}>
                          <View style={styles.titleContainer}>
                            <MaterialCommunityIcons
                              name="ticket-confirmation"
                              size={20}
                              color="#fff"
                            />
                            <Text style={styles.couponTitle} numberOfLines={1}>
                              {coupon.title}
                            </Text>
                          </View>
                        </View>

                        {/* Description */}
                        <Text style={styles.couponDescription} numberOfLines={2}>
                          {coupon.description}
                        </Text>

                        {/* Coupon Code Section */}
                        <View style={styles.codeContainer}>
                          <View style={styles.codeBox}>
                            <Text style={styles.codeLabel}>Coupon Code</Text>
                            <View style={styles.codeValueContainer}>
                              <Text style={styles.codeValue}>{coupon.code}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => copyToClipboard(coupon.code)}
                            style={styles.copyCodeButton}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons
                              name="content-copy"
                              size={18}
                              color="#9747FF"
                            />
                            <Text style={styles.copyCodeText}>Copy</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          <CustomSnackbar
            onDismiss={() => setSnackBarOpen(false)}
            visible={snackbarOpen}
            message={snackbarMessage}
            bgColor="#FFFFFF"
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontFamily: theme.fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginTop: 20,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: theme.fonts.regular,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  descriptionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginLeft: 10,
    fontFamily: theme.fonts.bold,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  couponsContainer: {
    gap: 16,
  },
  couponCardWrapper: {
    marginBottom: 4,
  },
  couponGradient: {
    borderRadius: 20,
    padding: 2,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  couponCard: {
    backgroundColor: "transparent",
    borderRadius: 18,
    padding: 20,
  },
  couponHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  couponTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  couponDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: theme.fonts.regular,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  codeBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  codeLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: theme.fonts.medium,
  },
  codeValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  codeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 2,
    fontFamily: theme.fonts.bold,
  },
  copyCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  copyCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9747FF",
    fontFamily: theme.fonts.medium,
  },
});
