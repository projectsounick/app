import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import BannerCard from "@/app/modules/BannerCard";
import {
  offlineSessionCardData,
  onlineSessionCardData,
} from "@/utils/ModuletaticData";
import SmallHeader from "@/app/modules/SmallHeader";
import BackHeader from "@/app/modules/BackHeader";

//// Main funcitonal component for the session booking -------------------------------/
const BookSessionScreen = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpeg")}
      resizeMode="cover"
      style={{
        flex: 1,
      }}
    >
      {/* Custom Header */}
      <SmallHeader title="Sessions" />
      <BackHeader />

      <ScrollView
        contentContainerStyle={{
          padding: 19,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 6,
            color: "#000",
          }}
        >
          Choose Your Training Mode
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 16,
            lineHeight: 20,
          }}
        >
          Get expert guidance your way{"\n"}online or in person.
        </Text>

        <BannerCard cardData={onlineSessionCardData} />
        <View style={{ height: 16 }} />
        <BannerCard cardData={offlineSessionCardData} />
      </ScrollView>
    </ImageBackground>
  );
};

export default BookSessionScreen;
