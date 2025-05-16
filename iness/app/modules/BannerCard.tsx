import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { BannerCardProps } from "../interfaces/moduleInterfaces";
import theme from "../Theme/globalTheme";
import Icon from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
const BannerCard = ({ cardData }: BannerCardProps) => {
  const {
    title,
    subtitle,
    buttonText,
    icon,
    params,
    imageSource,
    backgroundColor,
    textColor = "#FFFFFF",
    redirectionPageName,
  } = cardData;

  return (
    <LinearGradient
      colors={backgroundColor}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        borderRadius: 12,
        paddingHorizontal: 12,
        marginTop: 18,
        height: 142,
        justifyContent: "center",
        overflow: "hidden",
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
            onPress={() =>
              router.push({
                pathname: redirectionPageName,
                params: {
                  type: params, // or whatever param you need
                },
              })
            }
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
    </LinearGradient>
  );
};

export default BannerCard;
