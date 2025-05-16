import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
import theme from "../Theme/globalTheme";
import { LinearGradient } from "expo-linear-gradient";
const plansData = [
  {
    offer: "Corporate Wellness Program | 50% Off",
    buttonText: "Know more",
    image: require("../../assets/images/planImage.png"),
  },
  {
    offer: "Strength Plan | 30% Off",
    buttonText: "Know more",
    image: require("../../assets/images/planImage.png"),
  },
  // Add more cards as needed
];

export default function SliderCard() {
  return (
    <LinearGradient
      colors={["#9C56F6", "#3A1B63"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        height: 200,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
      }}
    >
      {/* Fixed Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: theme.fontSizes.medium,
              fontWeight: "bold",
              color: theme.colors.text,
            }}
          >
            <MaterialCommunityIcons
              name="run"
              size={18}
              color={theme.colors.primary}
            />{" "}
            Explore our plans
          </Text>
          <Text
            style={{
              fontSize: theme.fontSizes.regularSmall,
              fontWeight: theme.fontWeights.regular,
              color: theme.colors.text,
            }}
          >
            Tailored plans for your personalized lifestyles.
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.text}
        />
      </View>

      {/* Horizontal Scrollable Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {plansData.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: " #D6B6FF",
              borderRadius: 12,
              marginRight: 12,
              width: 310,
              flexDirection: "row",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingLeft: 23,
              paddingRight: 23,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            {/* Text and Button on the Left */}
            <View
              style={{
                flex: 1,

                height: "80%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontWeight: theme.fontWeights.bold,
                  fontSize: theme.fontSizes.regular,
                  marginBottom: 6,
                  color: theme.colors.dark,
                  lineHeight: 21,
                }}
              >
                {item.offer}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#B4F455",

                  width: 114,
                  height: 31,
                  borderRadius: 16,
                  alignSelf: "flex-start",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontWeight: theme.fontWeights.bold,
                    fontSize: theme.fontSizes.regularSmall,
                    textAlign: "center",
                    color: theme.colors.dark,
                  }}
                >
                  {item.buttonText}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Image on the Right */}
            <Image
              source={item.image}
              style={{
                width: 120,

                height: "100%",
                resizeMode: "cover",
                borderRadius: 8,
              }}
            />
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
