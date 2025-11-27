import React, { useEffect, useMemo, useState } from "react";
import { View, Animated, ScrollView } from "react-native";

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
const MainHeader = withAnimatedHeader(NameHeader);
//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const calendarSheetOpen = useSelector(
    (state: RootState) => state.componentOpen.calendarSheetOpen
  );
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
          marginBottom: 10,
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
        {/* <VideoPromotionModal /> */}
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
function dispatch(arg0: any) {
  throw new Error("Function not implemented.");
}
