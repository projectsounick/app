import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import NormalHeader from "@/app/modules/NormalHeader";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { CouponInterface } from "@/app/interfaces/otherInterfaces";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { couponService } from "@/app/services/coupon.service";
import CustomSnackbar from "@/app/modules/Snackbar";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");
const topPadding = height * 0.05;

export default function CouponScreen() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
              <ActivityIndicator size="large" color={theme.colors.secondPrimary} />
              <Text style={styles.loadingText}>Loading coupons...</Text>
            </View>
          ) : coupons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="ticket-outline"
                size={64}
                color={theme.colors.secondPrimary}
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
                    color={theme.colors.secondPrimary}
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
                      colors={isDark ? [theme.colors.backgroundCard, theme.colors.backgroundSecondary] : ["#9747FF", "#7B2CBF"]}
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
                              color={theme.colors.secondPrimary}
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
            bgColor={theme.colors.background}
          />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptyText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
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
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginLeft: 10,
    fontFamily: theme.fonts.bold,
  },
  descriptionText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
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
    ...(isDark ? {} : {
      shadowColor: theme.colors.secondPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    }),
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
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.textWhite,
    marginLeft: 8,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  couponDescription: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textWhite,
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
    fontSize: theme.fontSizes.small,
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
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.textWhite,
    letterSpacing: 2,
    fontFamily: theme.fonts.bold,
  },
  copyCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  copyCodeText: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
  },
});
