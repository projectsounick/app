import React, { useEffect, useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import { totalStoreStateInterface } from "@/app/interfaces/otherInterfaces";
import { RootState } from "@/store";
import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { SliceKey } from "@/sliceRegistery";
import { planService } from "@/app/services/plan.service";
import { cartService } from "@/app/services/cart.service";
import { CircularProgress } from "react-native-circular-progress";
import { ActivityIndicator } from "react-native-paper";

function Demo() {
  return null;
}

const HEADER_HEIGHT = 180;
const MainHeader = withAnimatedHeader(NameHeader);
//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  const scrollY = new Animated.Value(0);
  //// Fetching the plan data -----------------------------/

  const configs = useMemo(
    () => [
      {
        sliceKey: "plan" as SliceKey,
        fetchFunction: planService.getAllPlans,
      },
      {
        sliceKey: "cart" as SliceKey,
        fetchFunction: cartService.getCartItems,
      },
      {
        sliceKey: "dietPlan" as SliceKey,
        fetchFunction: planService.getDietPlans,
      },
    ],
    []
  );

  const {
    loading,
    error,
    fetchAll,
    setDataManually,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
  } = useFetchMultipleStoreDataHook(configs);

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
        {loading ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator style={{ marginTop: "20%" }} />
          </View>
        ) : (
          <>
            <SliderCard />
            <BannerCard cardData={trackingCardData} />
            <BannerCard cardData={bookSessionCardData} />

            <FeatureCarousel />
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
};

export default YourComponent;
