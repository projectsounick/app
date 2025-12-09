import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Animated, ScrollView } from "react-native";
import { usePathname } from "expo-router";

import withAnimatedHeader from "@/app/Hoc/MainHeader";
import NameHeader from "@/app/Components/HeaderSubComponents/NameHeader";
import { useDispatch, useSelector } from "react-redux";

import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { SliceKey } from "@/sliceRegistery";
import { planService } from "@/app/services/plan.service";
import { cartService } from "@/app/services/cart.service";

import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { blogService } from "@/app/services/blog.Service";
import BlogSliderCard from "@/app/modules/BlogSliderCard";
import { trackService } from "@/app/services/track.service";

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
import OffersCards from "@/app/modules/OfferCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SmallHeader from "@/app/modules/SmallHeader";
import FloatingOptions from "@/app/modules/ButtonSection";
import HealthDashboard from "@/app/modules/HealthCards";
import BlogCarousel from "@/app/modules/BlogsCards";
import SessionCarousel from "@/app/Components/Home/SessionCards";

import PodcastMediaCard from "@/app/Components/Home/PodcastSection";
import { podCastService } from "@/app/services/podcast.service";
import { RootState } from "@/store";
import SessionCalendarSheet from "@/app/modules/SessionCalendarSheet";
import FeedbackModal from "@/app/Components/ActivePlans.tsx/SessionFeedbackModal";
import { setCalendarSheetOpen } from "@/Slices/componentOpenSlice";
import { sessionService } from "@/app/services/sessionService";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";
import LoginJsxWrapper from "@/app/Hoc/LoginJsxWrapper";
import WeeklyActivityCard from "@/app/Components/Activity/WeeklyActivityCard";
import { fetchStreak } from "@/app/services/streaks.service";
import WeightTrackerBottomSheet from "@/app/Modals/WeightTrackModal";
import eventBus from "@/event";
import {
  getPendingNavigation,
  clearPendingNavigation,
  isNavigationProcessing,
  setNavigationProcessing,
} from "@/utils/notificationUtils";
import {
  handleNotificationNavigation,
  NotificationData,
} from "@/app/utils/notificationRouter";
import { useRouter } from "expo-router";

//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const calendarSheetOpen = useSelector(
    (state: RootState) => state.componentOpen.calendarSheetOpen
  );
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  console.log(calendarSheetOpen);
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
            console.log("went inside this");

            // null or undefined
            setModalVisible(true); // show the modal
          }
        }
      } catch (err) {
        console.log("Error fetching AsyncStorage data:", err);
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

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [weightTrackModalShow, setWeightTrackModalShow] = useState(false);
  const onCloseSessionSheet = () => {
    dispatch(setCalendarSheetOpen(false));
  };

  const router = useRouter();
  const pathname = usePathname();
  const navigationHandledRef = useRef(false); // Track if navigation has been handled
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
  useEffect(() => {
    // Early return checks
    if (loading) return; // Wait for loading
    if (navigationHandledRef.current) return; // Already handled
    
    let isMounted = true; // Track if component is still mounted
    let retryCount = 0;
    const maxRetries = 5; // Increased retries

    const checkPendingNavigation = async (retry = false) => {
      try {
        // Wait a bit to ensure everything is ready (longer wait on first check)
        const waitTime = retry ? 500 : 1200;
        await new Promise((resolve) => setTimeout(resolve, waitTime));

        if (!isMounted) {
          navigationHandledRef.current = true;
          return;
        }

        // Check if we're already on target screens (skip if already navigated)
        const currentPath = pathname || "";
        if (currentPath.includes("/supportchat") || 
            currentPath.includes("/feed") || 
            currentPath.includes("/train") || 
            currentPath.includes("/store")) {
          // Already navigated, mark as handled
          navigationHandledRef.current = true;
          return;
        }

        // Check if navigation is already being processed
        const isProcessing = await isNavigationProcessing();
        if (isProcessing) {
          // If processing, wait a bit and retry
          if (retryCount < maxRetries && !retry) {
            retryCount++;
            setTimeout(() => checkPendingNavigation(true), 1000);
          } else {
            navigationHandledRef.current = true;
          }
          return;
        }

        const pending = await getPendingNavigation();
        console.log("Checked for pending navigation:", {
          hasPending: !!pending,
          retryCount,
          isRetry: retry,
          currentPath: pathname,
        });
        
        if (!pending) {
          // No pending navigation, but retry a few times in case it's being stored
          if (retryCount < maxRetries && !retry) {
            retryCount++;
            console.log(`Retrying navigation check (${retryCount}/${maxRetries})...`);
            setTimeout(() => checkPendingNavigation(true), 1000);
          } else {
            console.log("No pending navigation found after retries");
            navigationHandledRef.current = true;
          }
          return;
        }

        // Check if navigation data is still valid
        const pendingTime = new Date(pending.timestamp).getTime();
        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - pendingTime >= fiveMinutes) {
          // Too old, clear and mark as handled
          clearPendingNavigation();
          navigationHandledRef.current = true;
          return;
        }

        // Mark as processing and handled IMMEDIATELY before any async operations
        await setNavigationProcessing(true);
        navigationHandledRef.current = true;
        
        const notificationData: NotificationData = pending.data?.navigationData
          ? { ...pending.data, navigationData: pending.data.navigationData }
          : pending.data || {};

        // Get target screen path
        const targetScreen = notificationData.navigationData?.screen || 
          (notificationData.type === "support_message" ? "/dashboard/supportchat" : 
           notificationData.type === "post_like" || notificationData.type === "comment" ? "/dashboard/tabs/feed" : 
           notificationData.type === "session" ? "/dashboard/tabs" : null);

        console.log("Pending navigation found:", {
          type: notificationData.type,
          targetScreen,
          currentPath: pathname,
          notificationData,
        });

        // Check if we're already on the target screen
        if (targetScreen) {
          if (notificationData.type === "support_message" && currentPath.includes("/supportchat")) {
            clearPendingNavigation();
            setNavigationProcessing(false);
            return;
          }
          if ((notificationData.type === "post_like" || notificationData.type === "comment") && 
              currentPath.includes("/feed")) {
            clearPendingNavigation();
            setNavigationProcessing(false);
            return;
          }
        }

        // Clear navigation data IMMEDIATELY to prevent other checks
        clearPendingNavigation();

        // Navigate with appropriate delay
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) {
              try {
                console.log("Executing navigation to:", targetScreen, notificationData);
                handleNotificationNavigation(router, notificationData);
              } catch (error) {
                console.error("Error handling pending navigation:", error);
              } finally {
                // Clear processing flag after navigation
                setTimeout(() => {
                  setNavigationProcessing(false);
                }, 2000);
              }
            }
          }, 800);
        }
      } catch (error) {
        console.error("Error checking pending navigation:", error);
        clearPendingNavigation();
        setNavigationProcessing(false);
        navigationHandledRef.current = true;
      }
    };

    // Execute when loading is done
    checkPendingNavigation();

    return () => {
      isMounted = false;
    };
  }, [router, loading]); // Only depend on loading, not pathname

  // Reset check flag when pathname changes back to dashboard (user navigated back)
  useEffect(() => {
    const isOnDashboardIndex = pathname === "/dashboard/tabs" || 
                                pathname === "/(tabs)/dashboard/tabs" || 
                                pathname?.endsWith("/tabs/index") ||
                                pathname?.endsWith("/tabs");
    
    // Only reset if we're back on dashboard and navigation was previously handled
    // This allows checking again if user manually navigates back
    if (isOnDashboardIndex && navigationHandledRef.current && !pathname?.includes("/supportchat")) {
      // Don't reset immediately - wait a bit to prevent immediate re-trigger
      const timer = setTimeout(() => {
        // Only reset if still on dashboard
        if (pathname?.includes("/dashboard/tabs") && !pathname?.includes("/supportchat")) {
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
          <HomeSimmerSkeleton />
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

            {/* <SliderCard /> */}
            {/* <BannerCard cardData={trackingCardData} />
            <BannerCard cardData={bookSessionCardData} /> */}
            {/* <DualBannerCardRow
              firstCard={bookSessionCardData}
              secondCard={trackingCardData}
            /> */}

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

