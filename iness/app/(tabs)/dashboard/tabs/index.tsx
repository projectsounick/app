import React, { useEffect, useMemo } from "react";
import { View, Animated, ScrollView } from "react-native";

import SliderCard from "@/app/modules/SliderCard";

import { bookSessionCardData, trackingCardData } from "@/utils/ModuletaticData";

import withAnimatedHeader from "@/app/Hoc/MainHeader";
import NameHeader from "@/app/Components/HeaderSubComponents/NameHeader";
import { useDispatch, useSelector } from "react-redux";

import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { SliceKey } from "@/sliceRegistery";
import { planService } from "@/app/services/plan.service";
import { cartService } from "@/app/services/cart.service";

import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { blogService } from "@/app/services/blog.Service";
import BlogSliderCard from "@/app/modules/BlogSliderCard";
import { trackService } from "@/app/services/track.service";
import { TrackingData } from "@/app/interfaces/trackInterface";
import { setMainLoader } from "@/Slices/loadingSlice";
import { normalizeDate } from "@/utils/otherUtils";
import {
  setCurrentDateTrackData,
  setTotalTrackData,
} from "@/Slices/trackSlice";

import NotificationPermissionModal from "@/app/modules/NotificationPermissionModal";
import VideoPromotionModal from "@/app/modules/PromotionalVideo";

import Imagepicker from "@/app/modules/Imagepicker";
import { manualWorkoutPlanService } from "@/app/services/manualWorkoutPlan";
import AppUpdateBottomSheet from "@/app/modules/AndroidVersionUpdateModal";
import DualBannerCardRow from "@/app/modules/HorizontalCards";
import InfoCarousel from "@/app/modules/AdvirtisementCarraousel";
import TransformationCards from "@/app/modules/TransformationCards";
import HomeSimmerSkeleton from "@/app/modules/HomeSimmerSkeleton";
import HealthReportUploader from "@/app/modules/UploadReportPdf";

const MainHeader = withAnimatedHeader(NameHeader);
//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  //// Getting the loader from the state ----------------------------/

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
        sliceKey: "blogs" as SliceKey,
        fetchFunction: blogService.getBlogOverallData,
      },
      {
        sliceKey: "track" as SliceKey,
        fetchFunction: trackService.getCurrentDayTrackData,
      },
    ],
    []
  );
  const { loading, setSnackbarMessage, setSnackbarVisible } =
    useFetchMultipleStoreDataHook(configs);
  useEffect(() => {
    async function fetchTrack() {
      try {
        const response = await trackService.getCurrentDayTrackData();
        console.log("track response");

        console.log(response);
      } catch (error) {}
    }
    fetchTrack();
  }, []);
  const scrollY = new Animated.Value(0);
  //// Fetching the plan data -----------------------------/

  //// Video call exists or not checking -----------------------------------------/

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right", "top"]}
    >
      {/* Animated Header */}
      <MainHeader scrollY={scrollY} title="Home" />
      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 8, // ✅ Add horizontal spacing here
        }}
        // onScroll={Animated.event(
        //   [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        //   {
        //     useNativeDriver: true, // Required for better performance with transform/opacity
        //   }
        // )}
        // scrollEventThrottle={16}
      >
        {loading ? (
          <HomeSimmerSkeleton />
        ) : (
          <>
            <SliderCard />
            {/* <BannerCard cardData={trackingCardData} />
            <BannerCard cardData={bookSessionCardData} /> */}
            <DualBannerCardRow
              firstCard={bookSessionCardData}
              secondCard={trackingCardData}
            />
            <BlogSliderCard />
            <InfoCarousel />
            <HealthReportUploader />
            {/* <FeatureCarousel /> */}
          </>
        )}
        <TransformationCards />
        <NotificationPermissionModal />
        {/* <VideoPromotionModal /> */}
      </ScrollView>

      <Imagepicker />
      <AppUpdateBottomSheet />
    </SafeAreaView>
  );
};

export default YourComponent;
