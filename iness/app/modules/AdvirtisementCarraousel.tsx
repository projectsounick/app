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
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
        backgroundColor: "#fff",
        borderWidth: 0.5,
        borderColor: "#EFEFEF",
      }}
    >
      <LinearGradient
        colors={["#736AD6", "#5A54C4"]}
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
              backgroundColor: "#ffffff20",
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
              color: "#fff",
            }}
          >
            Why Choose Us
          </Text>
        </View>

        <Text
          style={{
            fontSize: theme.fontSizes.small,
            color: "#E6E6E6",
            marginBottom: 14,
            lineHeight: 18,
          }}
        >
          Discover the key features that set us apart in the wellness space.
        </Text>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: "#F2F2F2",
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
