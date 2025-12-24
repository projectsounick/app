import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Animated, ScrollView } from "react-native";
import { usePathname, useRouter } from "expo-router";


import { useDispatch, useSelector } from "react-redux";

import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { SliceKey } from "@/sliceRegistery";

import { cartService } from "@/app/services/cart.service";


import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { blogService } from "@/app/services/blog.Service";
import BlogSliderCard from "@/app/modules/BlogSliderCard";
import { trackService } from "@/app/services/track.service";

import NotificationPermissionModal from "@/app/Modals/NotificationPermissionModal";
import VideoPromotionModal from "@/app/Modals/VideoPromotionModal";



import AppUpdateBottomSheet from "@/app/Modals/AndroidVersionUpdateModal";

import InfoCarousel from "@/app/modules/AdvirtisementCarraousel";

import HomeShimmer from "@/app/modules/Shimmer/HomeShimmer";
import HealthReportUploader from "@/app/modules/UploadReportPdf";
import OffersCards from "@/app/modules/OfferCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SmallHeader from "@/app/modules/SmallHeader";
import FloatingOptions from "@/app/modules/ButtonSection";
import HealthDashboard from "@/app/modules/HealthCards";

import SessionCarousel from "@/app/Components/Home/SessionCards";
import TestimonialsCarousel from "@/app/Components/Home/TestimonialsCarousel";

import PodcastMediaCard from "@/app/Components/Home/PodcastSection";
import { podCastService } from "@/app/services/podcast.service";
import { RootState } from "@/store";
import SessionCalendarSheet from "@/app/Modals/SessionCalendarSheet";
import FeedbackModal from "@/app/Modals/SessionFeedbackModal";
import { setCalendarSheetOpen } from "@/Slices/componentOpenSlice";
import { sessionService } from "@/app/services/sessionService";

import LoginJsxWrapper from "@/app/Hoc/LoginJsxWrapper";

import { fetchStreak } from "@/app/services/streaks.service";
import WeightTrackerBottomSheet from "@/app/Modals/WeightTrackModal";
import eventBus from "@/event";
import { usePendingNavigation } from "@/app/hooks/usePendingNavigation";
import { useAppleHealthBackgroundSync } from "@/hooks/useAppleHealthBackgroundSync";

//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const calendarSheetOpen = useSelector(
    (state: RootState) => state.componentOpen.calendarSheetOpen
  );
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const podCasts = useSelector((state: RootState) => state.podcast.podcasts);
  // Fetch user data and modal flag from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userStr] = await Promise.all([AsyncStorage.getItem("user")]);

        if (userStr) {
          const user = JSON.parse(userStr);
          setLoggedUser(user);

          if (user.healthReport == null) {
            // null or undefined
            setModalVisible(true); // show the modal
          }
        }
      } catch (err) {
        // Error fetching AsyncStorage data
      }
    };
    setTimeout(() => {
      fetchUserData();
    }, 2000);
  }, []);
  //// Getting the loader from the state ----------------------------/

  const configs = useMemo(
    () => [
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
      {
        sliceKey: "podcast" as SliceKey,
        fetchFunction: podCastService.getPodcasts,
      },
      {
        sliceKey: "session" as SliceKey,
        fetchFunction: sessionService.getSessions,
      },
      {
        sliceKey: "streak" as SliceKey,
        fetchFunction: fetchStreak,
      },
    ],
    []
  );
  const { loading, setSnackbarMessage, setSnackbarVisible } =
    useFetchMultipleStoreDataHook(configs);
  const [currentSession, setCurrentSession] = useState<any>(null);

  // Background Apple Health sync
  useAppleHealthBackgroundSync();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [weightTrackModalShow, setWeightTrackModalShow] = useState(false);
  const onCloseSessionSheet = () => {
    dispatch(setCalendarSheetOpen(false));
  };

  const pathname = usePathname();
  const navigationCheckDoneRef = useRef(false); // Track if we've already checked for navigation in this mount

  // Listen for event to open session calendar (from notifications)
  useEffect(() => {
    const handleOpenCalendar = () => {
      dispatch(setCalendarSheetOpen(true));
    };

    eventBus.on("open-session-calendar", handleOpenCalendar);

    return () => {
      eventBus.off("open-session-calendar", handleOpenCalendar);
    };
  }, [dispatch]);

  // Check for pending navigation when dashboard is fully loaded
  // This handles navigation when app was opened from notification (closed state)
  // Handle pending navigation from notifications
  usePendingNavigation(loading);

  // Reset check flag when pathname changes back to dashboard (user navigated back)
  // Note: The usePendingNavigation hook manages its own state, so this is mainly for other navigation checks
  useEffect(() => {
    const isOnDashboardIndex = pathname === "/dashboard/tabs" || 
                                pathname === "/(tabs)/dashboard/tabs" || 
                                pathname?.endsWith("/tabs/index") ||
                                pathname?.endsWith("/tabs");
    
    // Only reset if we're back on dashboard
    // This allows checking again if user manually navigates back
    if (isOnDashboardIndex && !pathname?.includes("/supportchat") && !pathname?.includes("/trainerchat")) {
      // Don't reset immediately - wait a bit to prevent immediate re-trigger
      const timer = setTimeout(() => {
        // Only reset if still on dashboard
        if (pathname?.includes("/dashboard/tabs") && !pathname?.includes("/supportchat") && !pathname?.includes("/trainerchat")) {
          navigationCheckDoneRef.current = false;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);
  //// Fetching the plan data -----------------------------/

  //// Video call exists or not checking -----------------------------------------/

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      {/* Animated Header */}
      <SmallHeader
        weightShow={true}
        title={"Home"}
        setWeightTrackModalShow={setWeightTrackModalShow}
        showStreak={true}
      />
      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 80 + Math.max(insets.bottom, 8), // Account for tab bar height + safe area
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
          <HomeShimmer />
        ) : (
          <>
            <OffersCards />
            <FloatingOptions />
            <LoginJsxWrapper loginButton={false} backButton={false}>
              <SessionCarousel />
            </LoginJsxWrapper>
            <LoginJsxWrapper loginButton={false} backButton={false}>
              <HealthDashboard />
            </LoginJsxWrapper>
            {/* <WeeklyActivityCard /> */}
            {podCasts && podCasts.length > 0 ? (
              <PodcastMediaCard loggedUser={loggedUser} />
            ) : null}

            <BlogSliderCard />
            <TestimonialsCarousel />


            <InfoCarousel />
            {modalVisible && (
              <HealthReportUploader
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
              />
            )}
            {/* <FeatureCarousel /> */}
          </>
        )}

        <NotificationPermissionModal />
        <VideoPromotionModal />
      </ScrollView>

      <AppUpdateBottomSheet />
      {/* //// Calendar sheet component ---------------------------/ */}
      {calendarSheetOpen && (
        <SessionCalendarSheet
          isVisible={calendarSheetOpen}
          onClose={onCloseSessionSheet}
          setCurrentSession={setCurrentSession}
          currentSession={currentSession}
          setShowFeedbackModal={setShowFeedbackModal}
        />
      )}
      {/*  //// Feedback component---------------------------------------/ */}
      {showFeedbackModal && (
        <FeedbackModal
          visible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          currentSession={currentSession}
          setCurrentSession={setCurrentSession}
        />
      )}
      {weightTrackModalShow ? (
        <WeightTrackerBottomSheet
          visible={weightTrackModalShow}
          onClose={() => setWeightTrackModalShow(!weightTrackModalShow)}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default YourComponent;

