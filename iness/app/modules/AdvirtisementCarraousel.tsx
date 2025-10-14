import React from "react";
import { View, Text, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import theme from "../Theme/globalTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");

const DATA = [
  { icon: "✅", line1: "11+ Years", line2: "Experience" },
  { icon: "💪", line1: "700+", line2: "Stories" },
  { icon: "👥", line1: "24x7", line2: "Support" },
  { icon: "🔥", line1: "Custom", line2: "Plans" },
];

const StylishCarousel = () => {
  return (
    <View
      style={{
        marginTop: 12,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={["#140A21", "#522987"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          borderRadius: 12,
          padding: 16,
        }}
      >
        {/* Heading */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: theme.fontSizes.medium,
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            Why Choose Us
          </Text>
        </View>

        {/* Sub text */}
        <Text
          style={{
            fontSize: theme.fontSizes.regularSmall,
            color: "#eee",
            marginBottom: 12,
          }}
        >
          Discover the key features that set us apart.
        </Text>

        {/* White features strip */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            paddingVertical: 10, // reduced height
            paddingHorizontal: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
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
                <Text
                  style={{
                    fontSize: 18,
                    color: theme.colors.primary,
                    marginBottom: 2,
                  }}
                >
                  {item.icon}
                </Text>
                <Text
                  style={{
                    color: theme.colors.dark,
                    fontSize: 12,
                    textAlign: "center",
                    lineHeight: 14,
                  }}
                >
                  {item.line1}
                </Text>
                <Text
                  style={{
                    color: theme.colors.dark,
                    fontSize: 12,
                    textAlign: "center",
                    lineHeight: 14,
                  }}
                >
                  {item.line2}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default StylishCarousel;
