import React, { memo } from "react";
import { View, Text, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../Theme/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

const DATA = [
  { icon: "✅", line1: "11+ Years", line2: "Experience" },
  { icon: "💪", line1: "700+", line2: "Stories" },
  { icon: "👥", line1: "24x7", line2: "Support" },
  { icon: "🔥", line1: "Custom", line2: "Plans" },
];

function StylishCarousel() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  
  // Use black-based gradient in dark mode, purple gradient in light mode
  const gradientColors: [string, string] = isDark 
    ? ["#1A1A1A", "#000000"] // Black gradient for dark mode
    : ["#736AD6", "#5A54C4"]; // Purple gradient for light mode
  
  return (
    <View
      style={{
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
        backgroundColor: theme.colors.background,
        borderWidth: 0.5,
        borderColor: theme.colors.border,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          padding: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={22}
              color="#fff"
              style={{ marginRight: 0 }}
            />
          </View>
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontFamily: theme.fonts.bold,
              color: theme.colors.textWhite,
            }}
          >
            Why Choose Us
          </Text>
        </View>

        <Text
          style={{
            fontSize: theme.fontSizes.small,
            color: theme.colors.textLight,
            marginBottom: 14,
            lineHeight: 18,
          }}
        >
          Discover the key features that set us apart in the wellness space.
        </Text>

        <View
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
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
                  width: screenWidth / 5.2,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSizes.large,
                    color: theme.colors.secondPrimary,
                    marginBottom: 4,
                  }}
                >
                  {item.icon}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.small,
                    fontFamily: theme.fonts.bold,
                    textAlign: "center",
                    lineHeight: 14,
                  }}
                >
                  {item.line1}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.small,
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
