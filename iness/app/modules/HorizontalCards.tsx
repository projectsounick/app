import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import { BannerCardProps } from "../interfaces/moduleInterfaces";

const { width } = Dimensions.get("window");

interface DualBannerCardRowProps {
  firstCard: BannerCardProps["cardData"];
  secondCard: BannerCardProps["cardData"];
}

const DualBannerCardRow = ({
  firstCard,
  secondCard,
}: DualBannerCardRowProps) => {
  const renderCard = (cardData: BannerCardProps["cardData"]) => {
    const {
      title,
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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: "49%",
          borderRadius: 12,
          padding: 12,
          height: 100, // 🔥 Set fixed height here
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",

          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        {/* Left Section */}
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            height: "100%",
            paddingRight: 6,
          }}
        >
          {/* Top: Icon + Title */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name={icon} size={22} color="#BDFF84" />
            <Text
              style={{
                color: textColor,
                fontSize: 12,
                fontWeight: "600",
                marginLeft: 6,
              }}
            >
              {title}
            </Text>
          </View>

          {/* Bottom: Button */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: redirectionPageName,
                params: {
                  type: params,
                },
              })
            }
            style={{
              backgroundColor: "#BDFF84",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 4,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: 8,
                color: "#000",
                fontWeight: "600",
              }}
            >
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right: Image */}
        <View
          style={{
            width: 70,
            height: "auto",

            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden", // prevents image overflow
          }}
        >
          <Image
            source={imageSource}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover", // fills the container
            }}
          />
        </View>
      </LinearGradient>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        marginTop: 10,
      }}
    >
      {renderCard(firstCard)}
      {renderCard(secondCard)}
    </View>
  );
};

export default DualBannerCardRow;
