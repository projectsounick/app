import React, { memo } from "react";
import { View, Text, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../Theme/globalTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

const DATA = [
  { icon: "✅", line1: "11+ Years", line2: "Experience" },
  { icon: "💪", line1: "700+", line2: "Stories" },
  { icon: "👥", line1: "24x7", line2: "Support" },
  { icon: "🔥", line1: "Custom", line2: "Plans" },
];

function StylishCarousel() {
  return (
    <View
      style={{
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 16,
      }}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={["#736AD6", "#5A54C4"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          borderRadius: 16,
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
              fontSize: theme.fontSizes.regular,
              fontFamily: theme.fonts.bold,
              color: "#fff",
            }}
          >
            Why Choose Us
          </Text>
        </View>

        {/* Sub text */}
        <Text
          style={{
            fontSize: theme.fontSizes.small,
            color: "#E6E6E6",
            marginBottom: 12,
          }}
        >
          Discover the key features that set us apart.
        </Text>

        {/* White features strip */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 12,
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
                    fontSize: 20,
                    color: "#736AD6",
                    marginBottom: 4,
                  }}
                >
                  {item.icon}
                </Text>
                <Text
                  style={{
                    color: theme.colors.dark,
                    fontSize: 12,
                    fontFamily: theme.fonts.bold,
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
                    fontFamily: theme.fonts.medium,
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
}

export default memo(StylishCarousel);
