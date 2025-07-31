import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import theme from "../Theme/globalTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.7;
const CARD_MARGIN = 15;

const DATA = [
  {
    icon: "✅",
    text: "All minimum 4 years experience trainers",
  },
  {
    icon: "💪",
    text: "500+ success stories",
  },
  {
    icon: "👥",
    text: "24×7 active community",
  },
  {
    icon: "🔥",
    text: "Personalized plans for you",
  },
];

const StylishCarousel = () => {
  return (
    <View
      style={{
        marginBottom: 10,
        marginTop: 10,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <MaterialCommunityIcons
          name="shield-check"
          size={20}
          color={theme.colors.primary}
          style={{ marginRight: 8 }}
        />
        <Text
          style={{
            fontSize: theme.fontSizes.medium,
            fontWeight: "bold",
            color: theme.colors.dark,
          }}
        >
          Why Choose us
        </Text>
      </View>
      <Text
        style={{
          fontSize: theme.fontSizes.regularSmall,
          color: theme.colors.medium,
          marginBottom: 12,
        }}
      >
        Discover the key features that set us apart .
      </Text>

      <View
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 2,
        }}
      >
        <LinearGradient
          colors={["#140A21", "#522987"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            height: 160,
            paddingHorizontal: screenWidth < 360 ? 12 : 16,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
          }}
        >
          {DATA.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: index === DATA.length - 1 ? 0 : 12,
              }}
            >
              <Text
                style={{
                  fontSize: screenWidth < 360 ? 12 : 14,
                  marginRight: 8,
                }}
              >
                {item.icon}
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: screenWidth < 360 ? 11 : 13,
                  flex: 1,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.text}
              </Text>
            </View>
          ))}
        </LinearGradient>
      </View>
    </View>
  );
};

export default StylishCarousel;
