import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import NormalHeader from "@/app/modules/NormalHeader";
import { MaterialIcons } from "@expo/vector-icons"; // Importing icons for copy button
import theme from "@/app/Theme/globalTheme";
import { CouponInterface } from "@/app/interfaces/otherInterfaces";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { couponService } from "@/app/services/coupon.service";
import { ActivityIndicator } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7; // Adjusting width to show part of left and right cards
const SPACING = 20; // Adjust spacing between cards
const CARD_HEIGHT = 150; // Reducing the card height

///// Main funcitonal component for the Couponscreen ------------------------------------/

export default function CouponScreen() {
  const [coupons, setCoupons] = useState<CouponInterface[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  ///// Useeffect funciton for fetching the coupons --------------------/
  useEffect(() => {
    async function fetchCoupons() {
      try {
        setLoading(true);
        //// getting the user from localstorage ---------/
        const loggedUser =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (loggedUser.exists) {
          let couponIds = loggedUser.data.assignedCoupons;
          const couponRespone = await couponService.getAllCoupons(couponIds);

          if (couponRespone.success) {
            setCoupons(couponRespone.data);
            setSnackBarOpen(true);
            setSnackbarMessage("Coupons has been fetched");
          } else {
            setSnackBarOpen(true);
            setSnackbarMessage("Some error has happened,try again");
          }
        } else {
          setSnackBarOpen(true);
          setSnackbarMessage("Some error has happened,try again");
        }
      } catch (error) {
        setSnackBarOpen(true);
        setSnackbarMessage("Some error has happened,try again");
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);
  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied!", `Coupon code "${code}" copied to clipboard.`);
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/onboardingBackground.jpg")}
      resizeMode="cover"
      style={{
        flex: 1,
        justifyContent: "flex-start",
        backgroundColor: "#000",
      }}
    >
      {/* Header */}
      <View style={{ paddingTop: 30, paddingLeft: 20 }}>
        <NormalHeader screenName="Coupons" />
      </View>

      {/* Heading */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: theme.colors.dark,
          paddingHorizontal: 20,
          textAlign: "center",
          marginTop: 30,
          marginBottom: 20,
        }}
      >
        Your Coupons
      </Text>
      {loading ? (
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
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          contentContainerStyle={{
            paddingHorizontal: (width - CARD_WIDTH) / 2, // Showing part of the cards on both sides
          }}
        >
          {coupons.map((coupon, index) => {
            const inputRange = [
              (index - 1) * (CARD_WIDTH + SPACING),
              index * (CARD_WIDTH + SPACING),
              (index + 1) * (CARD_WIDTH + SPACING),
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.9, 1, 0.9],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.6, 1, 0.6],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT, // Reduced height of card
                  marginRight: SPACING,
                  backgroundColor: theme.colors.cardLight,
                  borderWidth: 1,
                  borderColor: theme.colors.cardLight,
                  borderRadius: 15,
                  padding: 15,
                  transform: [{ scale }],
                  opacity,
                  justifyContent: "center", // Align content in the center vertically
                }}
              >
                {/* Coupon Card Background */}

                {/* Coupon Name and Copy Icon inside a Box */}
                <View
                  style={{
                    // Semi-transparent background for the text box
                    padding: 10,
                    borderRadius: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: theme.colors.dark,
                        fontSize: 18,
                        fontWeight: "700",
                      }}
                    >
                      {coupon.title}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.textSecondary || "#666",
                        fontSize: 14,
                        marginTop: 2,
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {coupon.description}
                    </Text>
                  </View>
                  {/* Copy Icon inside the Box */}
                  <TouchableOpacity
                    onPress={() => copyToClipboard(coupon.code)}
                  >
                    <MaterialIcons
                      name="content-copy"
                      size={20}
                      color={theme.colors.dark}
                    />
                  </TouchableOpacity>
                </View>

                {/* Coupon Code Box */}
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    padding: 10,
                    marginTop: 10,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#1E40AF",
                      fontSize: 18,
                      fontFamily: "monospace",
                    }}
                  >
                    {coupon.code}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      )}
      {/* Coupon Cards */}
      <CustomSnackbar
        onDismiss={() => setSnackBarOpen(false)}
        visible={snackbarOpen}
        message={snackbarMessage}
        bgColor={theme.colors.primary}
      />
    </ImageBackground>
  );
}
