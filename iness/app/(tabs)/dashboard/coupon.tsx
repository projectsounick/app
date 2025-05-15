import React, { useRef } from "react";
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
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7; // Adjusting width to show part of left and right cards
const SPACING = 20; // Adjust spacing between cards
const CARD_HEIGHT = 150; // Reducing the card height

const coupons = [
  { name: "Summer Sale", code: "SUMMER2025" },
  { name: "New User", code: "WELCOME25" },
  { name: "Festive Deal", code: "FESTIVE50" },
  { name: "Flash Offer", code: "FLASH10" },
];

const backgroundImage = require("../../../assets/images/carrauselBackground.png"); // Your image for coupon card background

export default function CouponScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;

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

      {/* Coupon Cards */}
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
                  backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background for the text box
                  padding: 10,
                  borderRadius: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  {coupon.name}
                </Text>
                {/* Copy Icon inside the Box */}
                <TouchableOpacity onPress={() => copyToClipboard(coupon.code)}>
                  <MaterialIcons
                    name="content-copy"
                    size={20}
                    color={theme.colors.primary}
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
    </ImageBackground>
  );
}
