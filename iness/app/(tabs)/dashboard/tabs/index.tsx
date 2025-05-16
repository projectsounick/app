import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SliderCard from "@/app/modules/SliderCard";
import BannerCard from "@/app/modules/BannerCard";
import FeatureCarousel from "@/app/modules/FeatureCarousel";
import { bookSessionCardData, trackingCardData } from "@/utils/ModuletaticData";

import withAnimatedHeader from "@/app/Hoc/MainHeader";
import NameHeader from "@/app/Components/HeaderSubComponents/NameHeader";

function Demo() {
  return null;
}

const HEADER_HEIGHT = 180;
const MainHeader = withAnimatedHeader(NameHeader);
//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  const scrollY = new Animated.Value(0);

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      {/* Animated Header */}
      <MainHeader scrollY={scrollY} title="Home" />
      {/* Scrollable Content */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 20, // Reserve space under the header
          paddingBottom: 10,
          paddingHorizontal: 16, // ✅ Add horizontal spacing here
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true, // Required for better performance with transform/opacity
          }
        )}
        scrollEventThrottle={16}
      >
        <SliderCard />
        <BannerCard cardData={bookSessionCardData} />
        <BannerCard cardData={trackingCardData} />
        <FeatureCarousel />
      </Animated.ScrollView>
    </View>
  );
};

export default YourComponent;
