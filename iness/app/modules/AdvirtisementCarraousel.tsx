import React from "react";
import { View, Text, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import theme from "../Theme/globalTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");

const DATA = [
  { icon: "✅", line1: "4+ Years", line2: "Experience" },
  { icon: "💪", line1: "500+", line2: "Stories" },
  { icon: "👥", line1: "24x7", line2: "Support" },
  { icon: "🔥", line1: "Custom", line2: "Plans" },
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
        Discover the key features that set us apart.
      </Text>

      <View
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["#140A21", "#522987"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            height: 100,
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderRadius: 12,
          }}
        >
          {DATA.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "column",
                alignItems: "center",
                width: screenWidth / 5,
              }}
            >
              <Text style={{ fontSize: 18, color: "#fff", marginBottom: 4 }}>
                {item.icon}
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  textAlign: "center",
                  lineHeight: 14,
                }}
              >
                {item.line1}
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  textAlign: "center",
                  lineHeight: 14,
                }}
              >
                {item.line2}
              </Text>
            </View>
          ))}
        </LinearGradient>
      </View>
    </View>
  );
};

export default StylishCarousel;
