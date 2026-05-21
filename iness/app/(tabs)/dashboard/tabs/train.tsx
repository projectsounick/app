import PlanProgressStatus from "@/app/Components/HeaderSubComponents/PlanProgressStatus";
import CurrentPlans from "@/app/Components/Train/CurrentPlans";
import withAnimatedHeader from "@/app/Hoc/MainHeader";
import { manualWorkoutPlanService } from "@/app/services/manualWorkoutPlan";
import { planService } from "@/app/services/plan.service";
import { SliceKey } from "@/sliceRegistery";

import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { RootState } from "@/store";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import TrainerShimmer from "@/app/modules/Shimmer/TrainerShimmer";
import SmallHeader from "@/app/modules/SmallHeader";
import { sessionService } from "@/app/services/sessionService";
import AvailablePlans from "@/app/Components/Train/AvaialblePlan";
import { otherService } from "@/app/services/singleService.service";
import eventBus from "@/event";
import { router } from "expo-router";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const MainHeader = withAnimatedHeader(
  PlanProgressStatus as unknown as React.FC
);

export default function TrainScreen() {
  const theme = useGlobalTheme();
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
        enableCache: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes - active plans change frequently
      },
      {
        sliceKey: "activeManualPlan" as SliceKey,
        fetchFunction: manualWorkoutPlanService.getUserActiveManualPlan,
        priority: "high" as const,
        enableCache: false,
      },
      {
        sliceKey: "activeServices" as SliceKey,
        fetchFunction: sessionService.getServices,
        priority: "high" as const,
        enableCache: true,
        cacheTTL: 10 * 60 * 1000, // 10 minutes - services relatively stable
      },
      // Lower priority - needed for "Available Plans" tab
      {
        sliceKey: "dietPlan" as SliceKey,
        fetchFunction: planService.getDietPlans,
        priority: "low" as const,
        enableCache: true,
        cacheTTL: 30 * 60 * 1000, // 30 minutes - diet plans rarely change
      },
      {
        sliceKey: "plan" as SliceKey,
        fetchFunction: planService.getAllPlans,
        priority: "low" as const,
        enableCache: false,
        cacheTTL: 30 * 60 * 1000, // 30 minutes - available plans rarely change
      },
      {
        sliceKey: "availableSessions" as SliceKey,
        fetchFunction: otherService.getAvailableServices,
        priority: "low" as const,
        enableCache: true,
        cacheTTL: 30 * 60 * 1000, // 30 minutes - available services rarely change
      },
    ],
    []
  );

  const { loading, fetchAll } = useFetchMultipleStoreDataHook(configs, true, true); // Enable priority loading
  const translateX = useRef(
    new Animated.Value(activeTab === "current" ? 0 : 1)
  ).current;

  useFocusEffect(
    React.useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const handlePress = (tab: "current" | "available") => {
    setActiveTab(tab);
    Animated.timing(translateX, {
      toValue: tab === "current" ? 0 : 1,
      duration: 250, // toggle animation
      useNativeDriver: false,
    }).start();
  };

  // Get current plans and services from Redux to check
  const activePlans = useSelector((state: RootState) => state.plan.activePlans);
  const activeServices = useSelector((state: RootState) => state.plan.activeServices);

  // Helper function to find current plan by type
  const findCurrentPlan = (planType: string) => {
    return activePlans.find(
      (plan) => plan.plan?.planType?.title?.toLowerCase() === planType.toLowerCase()
    );
  };

  // Helper function to find current service by type keyword
  const findCurrentServiceByType = (type: string) => {
    const keyword = type.toLowerCase();
    const keywords = [keyword];
    if (keyword === "yoga") {
      keywords.push("yoga");
    } else if (keyword === "weight training") {
      keywords.push("weight", "training", "workout", "fitness");
    }
    
    return activeServices.find(
      (service) => {
        const title = service.serviceDetails?.title?.toLowerCase() || "";
        return keywords.some(kw => title.includes(kw));
      }
    );
  };

  // Helper function to find current service by online/offline
  const findCurrentService = (isOnline: boolean) => {
    return activeServices.find(
      (service) => service.serviceDetails?.isOnline === isOnline
    );
  };

  // Listen for events from ButtonSection
  useEffect(() => {
    const handleSwitchTab = (data: { tab: "available" | "current"; planType?: string; serviceType?: string }) => {
      if (data.tab === "available" && activeTab !== "available") {
        handlePress("available");
      }
      // Emit event to AvailablePlans to scroll to specific type
      if (data.planType || data.serviceType) {
        setTimeout(() => {
          eventBus.emit("scroll-to-type", {
            planType: data.planType,
            serviceType: data.serviceType,
          });
        }, 300);
      }
    };

    const handleOpenPlan = (data: { planId: string; type: "plan" | "service" }) => {
      // Ensure we're on current tab
      if (activeTab !== "current") {
        handlePress("current");
      }
      // Navigate to appropriate details page after a short delay
      // Use the same navigation as CurrentPlanCard for consistency
      setTimeout(() => {
        if (data.type === "service" || data.type === "plan") {
          router.push({
            pathname: "/dashboard/fullPlanDetails",
            params: { id: data.planId, type: data.type },
          });
        }
      }, 500);
    };

    // New handler: Check and navigate after data is loaded
    const handleCheckAndNavigate = (data: {
      type: "plan-or-service" | "service";
      planType?: string;
      serviceType?: "online" | "offline";
      action: string;
    }) => {
      // Wait for loading to complete - this handles first-time load
      let attempts = 0;
      const maxAttempts = 50; // Maximum 10 seconds (50 * 200ms)
      
      const checkAfterLoad = () => {
        attempts++;
        
        // If still loading, wait a bit more
        if (loading) {
          if (attempts < maxAttempts) {
            setTimeout(checkAfterLoad, 200);
          } else {
            // Timeout - proceed anyway (might be an error, will go to available tab)
            proceedWithNavigation();
          }
          return;
        }

        // Loading is complete, proceed with navigation
        proceedWithNavigation();
      };

      const proceedWithNavigation = () => {
        // Get fresh data from Redux (inside the closure to get latest values)
        // These values are reactive and will have the latest data
        const currentActivePlans = activePlans;
        const currentActiveServices = activeServices;

        // Data is loaded, now check and navigate
        if (data.type === "plan-or-service" && data.planType) {
          // Weight Training always goes to available plans
          if (data.planType.toLowerCase() === "weight training") {
            handlePress("available");
            setTimeout(() => {
              eventBus.emit("scroll-to-type", {
                planType: data.planType,
              });
            }, 300);
            return;
          }

          // For Yoga, check for current plans/services first
          if (data.planType.toLowerCase() === "yoga") {
            // First check for a plan
            const currentPlan = currentActivePlans.find(
              (plan) => {
                const planTypeTitle = plan.plan?.planType?.title?.toLowerCase() || "";
                return planTypeTitle.includes("yoga") || planTypeTitle === "yoga";
              }
            );

            if (currentPlan) {
              // Ensure we're on current tab and open the plan
              if (activeTab !== "current") {
                handlePress("current");
              }
              setTimeout(() => {
                router.push({
                  pathname: "/dashboard/fullPlanDetails",
                  params: { id: currentPlan._id, type: "plan" },
                });
              }, 300);
              return;
            }

            // Then check for a service
            const currentService = currentActiveServices.find(
              (service) => {
                const title = service.serviceDetails?.title?.toLowerCase() || "";
                return title.includes("yoga");
              }
            );

            if (currentService) {
              // Navigate directly to service details
              router.push({
                pathname: "/dashboard/fullPlanDetails",
                params: { id: currentService._id, type: "service" },
              });
              return;
            }

            // No current plan or service, go to available tab
            handlePress("available");
            setTimeout(() => {
              eventBus.emit("scroll-to-type", {
                planType: data.planType,
              });
            }, 300);
            return;
          }

          // For other plan types, go to available tab
          handlePress("available");
          setTimeout(() => {
            eventBus.emit("scroll-to-type", {
              planType: data.planType,
            });
          }, 300);
        } else if (data.type === "service" && data.serviceType !== undefined) {
          // Handle Online/Offline Class - check for current plans FIRST
          const isOnline = data.serviceType === "online";
          
          // First, check if there's any current plan (plans take priority over services)
          if (currentActivePlans.length > 0) {
            // Open the first active plan
            const firstPlan = currentActivePlans[0];
            if (activeTab !== "current") {
              handlePress("current");
            }
            setTimeout(() => {
              router.push({
                pathname: "/dashboard/fullPlanDetails",
                params: { id: firstPlan._id, type: "plan" },
              });
            }, 300);
            return;
          }

          // If no plan, then check for a service
          const currentService = currentActiveServices.find(
            (service) => service.serviceDetails?.isOnline === isOnline
          );

          if (currentService) {
            // Navigate directly to service details
            router.push({
              pathname: "/dashboard/fullPlanDetails",
              params: { id: currentService._id, type: "service" },
            });
            return;
          }

          // No current plan or service, go to available tab
          handlePress("available");
          setTimeout(() => {
            eventBus.emit("scroll-to-type", {
              serviceType: data.serviceType,
            });
          }, 300);
        }
      };

      // Start checking - wait a bit first to ensure component is mounted and data fetch has started
      setTimeout(() => {
        checkAfterLoad();
      }, 100);
    };

    eventBus.on("switch-train-tab", handleSwitchTab);
    eventBus.on("open-plan", handleOpenPlan);
    eventBus.on("check-and-navigate", handleCheckAndNavigate);

    return () => {
      eventBus.off("switch-train-tab", handleSwitchTab);
      eventBus.off("open-plan", handleOpenPlan);
      eventBus.off("check-and-navigate", handleCheckAndNavigate);
    };
  }, [activeTab, loading, activePlans, activeServices, handlePress]);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}
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
          <TrainerShimmer screenName="train" />
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
                backgroundColor: theme.colors.background,
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
                borderColor: theme.colors.border,
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
                  backgroundColor: theme.colors.success,
                  transform: [
                    {
                      translateX: translateX.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 150], // half of width (300/2 = 150)
                      }),
                    },
                  ],
                  shadowColor: theme.colors.success,
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
                    color: activeTab === "current" ? theme.colors.textWhite : theme.colors.textSecondary,
                    fontWeight: theme.fontWeights.bold as "700",
                    fontSize: theme.fontSizes.regularSmall,
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
                    color: activeTab === "available" ? theme.colors.textWhite : theme.colors.textSecondary,
                    fontWeight: theme.fontWeights.bold as "700",
                    fontSize: theme.fontSizes.regularSmall,
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
