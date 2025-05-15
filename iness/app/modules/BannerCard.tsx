import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { BannerCardProps } from "../interfaces/moduleInterfaces";
import theme from "../Theme/globalTheme";
import Icon from "react-native-vector-icons/Feather";
import { router } from "expo-router";
const BannerCard = ({ cardData }: BannerCardProps) => {
  const {
    title,
    subtitle,
    buttonText,
    icon,
    imageSource,
    backgroundColor,
    textColor = "#FFFFFF",
  } = cardData;

  return (
    <View
      style={{
        borderRadius: 12,
        paddingHorizontal: 12,
        marginTop: 18,
        height: 142,
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: backgroundColor,
      }}
    >
      {/* Simulated gradient layers */}

      {/* Content including image */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          zIndex: 2,

          height: "100%",
        }}
      >
        <View style={{ flex: 1.2, paddingRight: 8 }}>
          <View
            style={{
              display: "flex",
              marginBottom: 4,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Icon name={icon} size={22} color={theme.colors.primary} />
            <Text
              style={{
                color: textColor,
                fontSize: theme.fontSizes.regular,
                fontWeight: theme.fontSizes.bold,
                marginLeft: 5,
              }}
            >
              {title}
            </Text>
          </View>
          <Text
            style={{
              color: textColor,
              fontSize: theme.fontSizes.small,
              fontWeight: theme.fontWeights.regular,
              marginBottom: 10,
            }}
          >
            {subtitle}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#C3FF77",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: 110,
              height: 31,
              borderRadius: 15,
            }}
            onPress={() => router.push("/dashboard/track")}
          >
            <Text style={{ color: "#000", fontWeight: "bold", fontSize: 13 }}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image section */}
        <Image
          source={imageSource}
          style={{ flex: 1, height: "100%" }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

export default BannerCard;
