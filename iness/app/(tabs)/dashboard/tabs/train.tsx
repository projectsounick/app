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
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 4,
                width: 300,
                position: "relative",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
            >
              {/* Sliding Highlight */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: 4,
                  bottom: 4,
                  width: "50%",
                  borderRadius: 12,
                  backgroundColor: "#67C694",
                  transform: [
                    {
                      translateX: translateX.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 150], // half of width (300/2 = 150)
                      }),
                    },
                  ],
                  shadowColor: "#67C694",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              />

              {/* Current Plans */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 12,
                  zIndex: 1,
                }}
                onPress={() => handlePress("current")}
              >
                <Text
                  style={{
                    color: activeTab === "current" ? "#fff" : "#666",
                    fontWeight: "700",
                    fontSize: 14,
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
                  paddingVertical: 12,
                  zIndex: 1,
                }}
                onPress={() => handlePress("available")}
              >
                <Text
                  style={{
                    color: activeTab === "available" ? "#fff" : "#666",
                    fontWeight: "700",
                    fontSize: 14,
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
