import PlanProgressStatus from "@/app/Components/HeaderSubComponents/PlanProgressStatus";
import CurrentPlans from "@/app/Components/Train/CurrentPlans";
import withAnimatedHeader from "@/app/Hoc/MainHeader";
import { PlanInterface } from "@/app/interfaces/planInterface";
import { manualWorkoutPlanService } from "@/app/services/manualWorkoutPlan";
import { planService } from "@/app/services/plan.service";
import { SliceKey } from "@/sliceRegistery";

import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { RootState } from "@/store";
import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { CircularProgress } from "react-native-circular-progress";
import { ActivityIndicator } from "react-native-paper";
import { sessionService } from "@/app/services/sessionService";
import ShimmerLoaderForTrain from "@/app/modules/TrainSimmer";
import ShimmerLoader from "@/app/modules/TrainSimmer";
const MainHeader = withAnimatedHeader(
  PlanProgressStatus as unknown as React.FC
);
export default function TrainScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const selectedTab = useSelector((state: RootState) => state.plan.planTab);
  const configs: any = useMemo(
    () => [
      {
        sliceKey: "dietPlan" as SliceKey,
        fetchFunction: planService.getDietPlans,
      },
      {
        sliceKey: "activePlans" as SliceKey,
        fetchFunction: planService.getActivePlans,
      },

      {
        sliceKey: "activeManualPlan" as SliceKey,
        fetchFunction: manualWorkoutPlanService.getUserActiveManualPlan,
      },
      {
        sliceKey: "activeServices" as SliceKey,
        fetchFunction: sessionService.getServices,
      },
    ],
    []
  );
  const { loading, setSnackbarMessage, setSnackbarVisible } =
    useFetchMultipleStoreDataHook(configs);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      {loading ? (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <ShimmerLoader screenName="train" />
        </View>
      ) : (
        <>
          <MainHeader scrollY={scrollY} title="Train" />
          {/* Scrollable Content starts below header */}
          <Animated.ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: 10, // Reserve space under the header
              paddingBottom: 10,
              paddingHorizontal: 16, // ✅ Add horizontal spacing here
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {/* Card 1 */}
            {selectedTab === "current" ? (
              <CurrentPlans isActive={true} />
            ) : (
              <CurrentPlans isActive={false} />
            )}
          </Animated.ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}
