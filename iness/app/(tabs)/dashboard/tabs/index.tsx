import React, { useEffect, useMemo, useState, useRef } from "react";
import { FlatList, Modal, View } from "react-native";
import { usePathname } from "expo-router";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";


import { useDispatch, useSelector } from "react-redux";

import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { SliceKey } from "@/sliceRegistery";

import { cartService } from "@/src/services/cart.service";


import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { blogService } from "@/src/services/blog.Service";
import BlogSliderCard from "@/src/modules/BlogSliderCard";
import { trackService } from "@/src/services/track.service";

import NotificationPermissionModal from "@/src/Modals/NotificationPermissionModal";
import VideoPromotionModal from "@/src/Modals/VideoPromotionModal";




import InfoCarousel from "@/src/modules/AdvirtisementCarraousel";

import HomeShimmer from "@/src/modules/Shimmer/HomeShimmer";
import HealthReportUploader from "@/src/modules/UploadReportPdf";
import OffersCards from "@/src/modules/OfferCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SmallHeader from "@/src/modules/SmallHeader";
import FloatingOptions from "@/src/modules/ButtonSection";
import HealthDashboard from "@/src/modules/HealthCards";

import SessionCarousel from "@/src/Components/Home/SessionCards";
import TestimonialsCarousel from "@/src/Components/Home/TestimonialsCarousel";
import EmailPromptCard from "@/src/Components/Home/EmailPromptCard";
import FeatureBanner from "@/src/modules/FeatureBanner";

import PodcastMediaCard from "@/src/Components/Home/PodcastSection";
import { podCastService } from "@/src/services/podcast.service";
import { RootState } from "@/store";
import SessionCalendarSheet from "@/src/Modals/SessionCalendarSheet";
import FeedbackModal from "@/src/Modals/SessionFeedbackModal";
import { setCalendarSheetOpen } from "@/Slices/componentOpenSlice";
import { setStreakModalShow } from "@/Slices/streakSlice";
import { sessionService } from "@/src/services/sessionService";

import LoginJsxWrapper from "@/src/Hoc/LoginJsxWrapper";

import { fetchStreak } from "@/src/services/streaks.service";
import WeightTrackerBottomSheet from "@/src/Modals/WeightTrackModal";
import eventBus from "@/event";
import { usePendingNavigation } from "@/src/hooks/usePendingNavigation";
import { useAppleHealthBackgroundSync } from "@/hooks/useAppleHealthBackgroundSync";
import StreaksBottomSheet from "@/src/Modals/StreakBottomSheet";
import { DashboardActivityProvider } from "@/src/Components/Home/DashboardActivityContext";

//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  const theme = useGlobalTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const streakModalShow = useSelector(
    (state: RootState) => state?.streak?.streakModalShow
  );
  const calendarSheetOpen = useSelector(
    (state: RootState) => state.componentOpen.calendarSheetOpen
  );
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const podCasts = useSelector((state: RootState) => state.podcast.podcasts);
  // State for email prompt
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  // Fetch user data and modal flag from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userStr, emailDismissed] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("emailPromptDismissed")
        ]);

        if (userStr) {
          const user = JSON.parse(userStr);
          setLoggedUser(user);

          // Check if user needs to add email (signed in without email or using Apple's private relay)
          const hasNoEmail = !user.email || user.email === "";
          const hasApplePrivateRelay = user.email?.includes("privaterelay.appleid.com");
          const needsEmail = hasNoEmail || hasApplePrivateRelay;
          
          if (needsEmail && !emailDismissed) {
            setShowEmailPrompt(true);
          }

          if (user.healthReport == null) {
            // null or undefined
            setModalVisible(true); // show the modal
          }
        }
      } catch {
        // Error fetching AsyncStorage data
      }
    };
    fetchUserData();
  }, []);

  // Dark mode modal logic removed - users will toggle dark mode manually from app settings
  //// Getting the loader from the state ----------------------------/

  const configs = useMemo(
    () => [
      // High priority - critical for first paint
      {
        sliceKey: "track" as SliceKey,
        fetchFunction: trackService.getCurrentDayTrackData,
        priority: "high" as const,
        enableCache: true,
        cacheTTL: 2 * 60 * 1000,
      },
      {
        sliceKey: "session" as SliceKey,
        fetchFunction: sessionService.getSessions,
        priority: "high" as const,
        enableCache: true,
        cacheTTL: 5 * 60 * 1000,
        staleWhileRevalidate: true,
      },
      {
        sliceKey: "streak" as SliceKey,
        fetchFunction: fetchStreak,
        priority: "high" as const,
        enableCache: true,
        cacheTTL: 2 * 60 * 1000,
      },
      // Low priority - can load after initial render
      {
        sliceKey: "cart" as SliceKey,
        fetchFunction: cartService.getCartItems,
        priority: "low" as const,
        enableCache: false,
        cacheTTL: 2 * 60 * 1000, // 2 minutes - cart changes frequently
      },
      {
        sliceKey: "blogs" as SliceKey,
        fetchFunction: blogService.getBlogOverallData,
        priority: "low" as const,
        enableCache: true,
        cacheTTL: 30 * 60 * 1000, // 30 minutes - blogs rarely change
      },
      {
        sliceKey: "podcast" as SliceKey,
        fetchFunction: podCastService.getPodcasts,
        priority: "low" as const,
        enableCache: true,
        cacheTTL: 30 * 60 * 1000, // 30 minutes - podcasts rarely change
      },
    ],
    []
  );
  const { loading } = useFetchMultipleStoreDataHook(configs, true, true);
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

  const homeSections = useMemo(() => {
    const sections: { key: string; content: React.ReactElement }[] = [];

    if (showEmailPrompt) {
      sections.push({
        key: "email-prompt",
        content: (
          <EmailPromptCard
            onEmailUpdated={() => setShowEmailPrompt(false)}
            onDismiss={() => setShowEmailPrompt(false)}
          />
        ),
      });
    }

    sections.push(
      { key: "feature-banner", content: <FeatureBanner /> },
      { key: "offers", content: <OffersCards /> },
      { key: "actions", content: <FloatingOptions /> },
      {
        key: "sessions",
        content: (
          <LoginJsxWrapper loginButton={false} backButton={false}>
            <SessionCarousel />
          </LoginJsxWrapper>
        ),
      },
      {
        key: "health",
        content: (
          <LoginJsxWrapper loginButton={false} backButton={false}>
            <HealthDashboard />
          </LoginJsxWrapper>
        ),
      }
    );

    if (podCasts?.length > 0) {
      sections.push({
        key: "podcasts",
        content: <PodcastMediaCard loggedUser={loggedUser} />,
      });
    }

    sections.push(
      { key: "blogs", content: <BlogSliderCard /> },
      { key: "testimonials", content: <TestimonialsCarousel /> },
      { key: "information", content: <InfoCarousel /> }
    );

    return sections;
  }, [loggedUser, podCasts, showEmailPrompt]);

  return (
    <DashboardActivityProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={["left", "right"]}
        accessibilityState={{ busy: loading }}
      >
      {/* Animated Header */}
      <SmallHeader
        weightShow={true}
        title={"Home"}
        setWeightTrackModalShow={setWeightTrackModalShow}
        showStreak={true}
      />
      {loading ? (
        <View
          style={{ flex: 1 }}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Loading dashboard"
          accessibilityLiveRegion="polite"
        >
          <HomeShimmer />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={homeSections}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => item.content}
          initialNumToRender={4}
          maxToRenderPerBatch={2}
          windowSize={3}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 80 + Math.max(insets.bottom, 8),
            paddingHorizontal: 8,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {modalVisible && (
        <HealthReportUploader
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      )}
      <NotificationPermissionModal />
      <VideoPromotionModal />

      {streakModalShow ? (
        <Modal
          visible={streakModalShow}
          transparent
          animationType="slide"
          onRequestClose={() => dispatch(setStreakModalShow(false))}
        >
          <StreaksBottomSheet
            onClose={() => dispatch(setStreakModalShow(false))}
          />
        </Modal>
      ) : null}

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
    </DashboardActivityProvider>
  );
};

export default YourComponent;
