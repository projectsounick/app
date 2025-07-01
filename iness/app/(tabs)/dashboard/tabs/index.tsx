import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { totalStoreStateInterface } from "@/app/interfaces/otherInterfaces";
import { RootState } from "@/store";
import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { SliceKey } from "@/sliceRegistery";
import { planService } from "@/app/services/plan.service";
import { cartService } from "@/app/services/cart.service";
import { CircularProgress } from "react-native-circular-progress";
import { ActivityIndicator } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import VideoCallChecker from "@/app/modules/VideoCallJoinModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eventBus } from "@/utils/events";
import { videocallService } from "@/app/services/videocall.service";

const MainHeader = withAnimatedHeader(NameHeader);
//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  console.log("compo is called three times");
  //// Getting the loader from the state ----------------------------/
  const dispatch = useDispatch();
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
      {
        sliceKey: "activePlans" as SliceKey,
        fetchFunction: planService.getActivePlans,
      },
      {
        sliceKey: "blogs" as SliceKey,
        fetchFunction: blogService.getBlogOverallData,
      },
    ],
    []
  );

  const {
    loading,

    setSnackbarVisible,
  } = useFetchMultipleStoreDataHook(configs);

  //// Useeffect function for loading the data ------------------------------------/
  const fetchData = async () => {
    dispatch(setMainLoader(true));
    try {
      const today = new Date();

      const formatDate = (d: Date) => d.toLocaleDateString("en-CA"); // e.g., "2025-05-18"

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = formatDate(startOfMonth);
      const endDate = formatDate(today);

      const [stepsRes, sleepRes, waterRes] = await Promise.all([
        trackService.getTrackingData("walk", startDate, endDate),
        trackService.getTrackingData("sleep", startDate, endDate),
        trackService.getTrackingData("water", startDate, endDate),
      ]);

      if (stepsRes.success && sleepRes.success && waterRes.success) {
        const stepsData = stepsRes.data || [];
        const sleepData = sleepRes.data || [];
        const waterData = waterRes.data || [];

        // Generate total data for each date (merge by date)
        const dateMap: { [date: string]: TrackingData } = {};
        stepsData.forEach((item: any) => {
          const date = normalizeDate(item.date); // ✅ Normalize
          if (!dateMap[date])
            dateMap[date] = { steps: null, sleep: null, water: null };
          dateMap[date].steps = item;
        });

        sleepData.forEach((item: any) => {
          const date = normalizeDate(item.date); // ✅ Normalize
          if (!dateMap[date])
            dateMap[date] = { steps: null, sleep: null, water: null };
          dateMap[date].sleep = item;
        });

        waterData.forEach((item: any) => {
          const date = normalizeDate(item.date); // ✅ Normalize
          if (!dateMap[date])
            dateMap[date] = { steps: null, sleep: null, water: null };
          dateMap[date].water = item;
        });
        // Convert the map to an array sorted by date
        const totalTrackArray: TrackingData[] = Object.values(dateMap).sort(
          (a, b) => {
            const dateA = a.steps?.date || a.sleep?.date || a.water?.date || "";
            const dateB = b.steps?.date || b.sleep?.date || b.water?.date || "";
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          }
        );

        const todayStr = formatDate(today); // "YYYY-MM-DD"
        const todayData = dateMap[todayStr] || {
          steps: null,
          sleep: null,
          water: null,
        };

        // Update Redux store
        dispatch(setTotalTrackData(totalTrackArray));
        dispatch(setCurrentDateTrackData(todayData));
        setSnackbarVisible(false);
      }
    } catch (error: any) {
    } finally {
      dispatch(setMainLoader(false));
    }
  };
  //// Video call exists or not checking -----------------------------------------/

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      {/* Animated Header */}
      <MainHeader scrollY={scrollY} title="Home" />
      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 20,
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
            <BlogSliderCard />
            {/* <FeatureCarousel /> */}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default YourComponent;
