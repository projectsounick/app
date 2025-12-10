import PlanProgressStatus from "@/app/Components/HeaderSubComponents/PlanProgressStatus";
import CurrentPlans from "@/app/Components/Train/CurrentPlans";
import withAnimatedHeader from "@/app/Hoc/MainHeader";
import { manualWorkoutPlanService } from "@/app/services/manualWorkoutPlan";
import { planService } from "@/app/services/plan.service";
import { SliceKey } from "@/sliceRegistery";

import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { RootState } from "@/store";
import React, { useMemo, useRef, useState } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import ShimmerLoader from "@/app/modules/TrainSimmer";
import SmallHeader from "@/app/modules/SmallHeader";
import { sessionService } from "@/app/services/sessionService";
import AvailablePlans from "@/app/Components/Train/AvaialblePlan";
import { otherService } from "@/app/services/singleService.service";

const MainHeader = withAnimatedHeader(
  PlanProgressStatus as unknown as React.FC
);

export default function TrainScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;


  const [activeTab, setActiveTab] = useState<"available" | "current">(
    "current"
  );

  const configs: any = useMemo(
    () => [
      // High priority - needed for "Current Plans" tab (default view)
      {
        sliceKey: "activePlans" as SliceKey,
        fetchFunction: planService.getActivePlans,
        priority: "high" as const,
      },
      {
        sliceKey: "activeManualPlan" as SliceKey,
        fetchFunction: manualWorkoutPlanService.getUserActiveManualPlan,
        priority: "high" as const,
      },
      {
        sliceKey: "activeServices" as SliceKey,
        fetchFunction: sessionService.getServices,
        priority: "high" as const,
      },
      // Lower priority - needed for "Available Plans" tab
      {
        sliceKey: "dietPlan" as SliceKey,
        fetchFunction: planService.getDietPlans,
        priority: "low" as const,
      },
      {
        sliceKey: "plan" as SliceKey,
        fetchFunction: planService.getAllPlans,
        priority: "low" as const,
      },
      {
        sliceKey: "availableSessions" as SliceKey,
        fetchFunction: otherService.getAvailableServices,
        priority: "low" as const,
      },
    ],
    []
  );

  const { loading } = useFetchMultipleStoreDataHook(configs);
  const translateX = useRef(
    new Animated.Value(activeTab === "current" ? 0 : 1)
  ).current;

  const handlePress = (tab: "current" | "available") => {
    setActiveTab(tab);
    Animated.timing(translateX, {
      toValue: tab === "current" ? 0 : 1,
      duration: 250, // toggle animation
      useNativeDriver: false,
    }).start();
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      {loading ? (
        <View
          style={{
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
          {/* Header */}
          <SmallHeader
            weightShow={false}
            title={"Plans"}
            showHistory={false}
            showCart={true}
            showBell={true}
          />

          {/* Toggle Tabs */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 12,
              marginBottom: 8,
              marginHorizontal: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#E0E0E0",
                borderRadius: 25,
                padding: 3,
                width: 280,
                position: "relative",
              }}
            >
              {/* Sliding Highlight */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: 3,
                  bottom: 3,
                  width: "50%",
                  borderRadius: 20,
                  backgroundColor: "#67C694",
                  transform: [
                    {
                      translateX: translateX.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 140], // half of width
                      }),
                    },
                  ],
                }}
              />

              {/* Current Plans */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
                onPress={() => handlePress("current")}
              >
                <Text
                  style={{
                    color: activeTab === "current" ? "#fff" : "#111",
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  Current Plans
                </Text>
              </TouchableOpacity>

              {/* Available Plans */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
                onPress={() => handlePress("available")}
              >
                <Text
                  style={{
                    color: activeTab === "available" ? "#fff" : "#111",
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  Available Plans
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <Animated.ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 100,
              paddingHorizontal: 16,
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {activeTab === "current" ? (
              <CurrentPlans isActive={true} />
            ) : (
              <AvailablePlans />
            )}
          </Animated.ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}
