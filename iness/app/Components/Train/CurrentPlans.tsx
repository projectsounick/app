import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { RootState } from "@/store";
import { ActivePlans } from "@/app/interfaces/planInterface";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActiveManualWorkoutPlanInterface } from "@/app/interfaces/activeManualPlan";
import theme from "@/app/Theme/globalTheme";

interface CurrentPlansProps {
  isActive: boolean;
}

const CurrentPlans: React.FC<CurrentPlansProps> = ({ isActive }) => {
  // Single selector for active or completed plans based on isActive prop
  const plans: ActivePlans[] = useSelector((state: RootState) =>
    isActive ? state.plan.activePlans : state.plan.completedPlans
  );

  const activeManualPlan: ActiveManualWorkoutPlanInterface | null = useSelector(
    (state: RootState) => (isActive ? state.plan.activeManualPlan : null)
  );
  const activeServices: any[] = useSelector((state: RootState) =>
    isActive ? state.plan.activeServices : []
  );

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 4 }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginRight: 8,
              color: "#000",
              fontFamily: theme.fonts.bold,
            }}
          >
            Plans Available
          </Text>
          <View
            style={{
              height: 2,
              width: 80,
              backgroundColor: "black",
              marginTop: 4,
            }}
          />
        </View>
        <Feather
          name="info"
          size={16}
          color="#3A8DFF"
          style={{ marginRight: 4 }}
        />
      </View>

      {/* Plan Cards */}
      {plans.length === 0 && activeManualPlan === null ? (
        <Text style={{ color: "gray", textAlign: "center", marginTop: 24 }}>
          No {isActive ? "active" : "completed"} plans found.
        </Text>
      ) : (
        plans.map((plan, index) => {
          const title =
            plan.plan?.title || plan.dietPlanDetails?.title || "Untitled Plan";
          const imageUrl = plan.plan?.imgUrl || plan.dietPlanDetails?.imgUrl;
          const descItems =
            plan.plan?.descItems || plan.dietPlanDetails?.descItems || [];

          // Card colors and button style/text depend on isActive
          const gradientColors: any = isActive
            ? ["#9C56F6", "#3A1B63"]
            : ["#555555", "#222222"]; // dimmed for completed/expired
          const buttonBgColor = isActive ? "#C6FF69" : "#C6FF69";
          const buttonText = isActive ? "Continue" : "Check";
          const buttonTextColor = isActive ? "#000" : "#000";

          return (
            <LinearGradient
              key={plan._id || index}
              colors={gradientColors}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 20,
                marginVertical: 14,
                height: 260,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
                overflow: "hidden",
              }}
            >
              {/* Left Content */}
              <View style={{ flex: 1, paddingRight: 14 }}>
                {/* Title */}
                <Text
                  style={{
                    fontSize: 16,

                    marginBottom: 14,
                    color: "#fff",
                    fontFamily: theme.fonts.bold,
                  }}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>

                {/* Description */}
                <View style={{ marginBottom: 18 }}>
                  {descItems.length > 0 ? (
                    descItems.slice(0, 2).map((item, idx) => (
                      <View
                        key={idx}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "rgba(255,255,255,0.9)",
                            marginRight: 10,
                          }}
                        />
                        <Text
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          style={{
                            fontSize: 14,
                            color: "#f5f5f5",
                            flexShrink: 1,
                            fontFamily: theme.fonts.medium,
                            lineHeight: 18,
                          }}
                        >
                          {item}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text
                      style={{ fontSize: 14, color: "#eee", lineHeight: 18 }}
                    >
                      No description available.
                    </Text>
                  )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "rgba(189, 255, 132, 1)",
                    height: 40,
                    width: 120,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "flex-start",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  onPress={() => {
                    if (isActive) {
                      if (plan.plan) {
                        router.push({
                          pathname: "/dashboard/fullPlanDetails",
                          params: { id: plan._id, type: "plan" },
                        });
                      } else {
                        router.push({
                          pathname: "/dashboard/dietplan",
                          params: { id: plan._id },
                        });
                      }
                    } else {
                      router.push({
                        pathname: "/dashboard/completedplan",
                        params: { id: plan._id },
                      });
                    }
                  }}
                >
                  <Text
                    style={{
                      color: buttonTextColor,
                      fontWeight: "700",
                      fontSize: 16,
                      fontFamily: theme.fonts.bold,
                    }}
                  >
                    {buttonText}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right-side Image */}
              <Image
                source={
                  imageUrl
                    ? { uri: imageUrl }
                    : require("../../../assets/images/track.png")
                }
                style={{
                  width: 140,
                  height: "100%",

                  resizeMode: "contain",
                  opacity: isActive ? 1 : 0.7,
                  marginLeft: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                }}
              />
            </LinearGradient>
          );
        })
      )}
      {isActive && activeManualPlan && (
        <LinearGradient
          colors={["#9C56F6", "#3A1B63"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            borderRadius: 12,
            paddingHorizontal: 12,
            marginTop: 18,
            height: 142,
            justifyContent: "center",
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Left Content */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 6,
                color: "white",
              }}
              numberOfLines={1}
            >
              {activeManualPlan.workoutPlanId.planName || "Custom Plan"}
            </Text>

            <Text
              style={{ fontSize: 13, color: "white" }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {activeManualPlan.workoutPlanId.description || "No description"}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#C6FF69",
                paddingVertical: 6,
                paddingHorizontal: 20,
                borderRadius: 30,
                alignSelf: "flex-start",
                marginTop: 10,
              }}
              onPress={() =>
                router.push({
                  pathname: "/dashboard/activeManualPlan",
                })
              }
            >
              <Text style={{ color: "#000", fontWeight: "600" }}>Continue</Text>
            </TouchableOpacity>
          </View>

          {/* Static Workout Image */}
          <Image
            source={require("../../../assets/images/track.png")}
            style={{
              width: 100,
              height: 120,
              resizeMode: "cover",
              marginLeft: 8,
              borderRadius: 8,
            }}
          />
        </LinearGradient>
      )}
      {activeServices.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  marginRight: 8,
                  color: "#000",
                }}
              >
                Services Available
              </Text>
              <View
                style={{
                  height: 2,
                  width: 80,
                  backgroundColor: "black",
                  marginTop: 4,
                }}
              />
            </View>
            <Feather
              name="info"
              size={16}
              color="#3A8DFF"
              style={{ marginRight: 4 }}
            />
          </View>

          {activeServices.map((service, index) => {
            const title = service.serviceDetails?.title || "Untitled Service";
            const imageUrl = service.serviceDetails?.imgUrl;
            const descItems = service.serviceDetails?.descItems || [];
            const gradientColors: any = isActive
              ? ["#9C56F6", "#3A1B63"]
              : ["#555555", "#222222"]; // dimmed for completed/expired

            const buttonText = isActive ? "Continue" : "Check";
            const buttonTextColor = isActive ? "#000" : "#000";
            return (
              <LinearGradient
                key={service._id || index}
                colors={gradientColors}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  borderRadius: 20,
                  padding: 20,
                  marginVertical: 14,
                  height: 260,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 6,
                  overflow: "hidden",
                }}
              >
                {/* Left Content */}
                <View style={{ flex: 1, paddingRight: 14 }}>
                  {/* Title */}
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 14,
                      color: "#fff",
                      fontFamily: theme.fonts.bold,
                    }}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>

                  {/* Description */}
                  <View style={{ marginBottom: 18 }}>
                    {descItems.length > 0 ? (
                      descItems.slice(0, 2).map((item: any, idx: any) => (
                        <View
                          key={idx}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "rgba(255,255,255,0.9)",
                              marginRight: 10,
                            }}
                          />
                          <Text
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            style={{
                              fontSize: 14,
                              color: "#f5f5f5",
                              flexShrink: 1,
                              fontFamily: theme.fonts.medium,
                              lineHeight: 18,
                            }}
                          >
                            {item}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text
                        style={{ fontSize: 14, color: "#eee", lineHeight: 18 }}
                      >
                        No description available.
                      </Text>
                    )}
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: "rgba(189, 255, 132, 1)",
                      paddingHorizontal: 22,
                      paddingVertical: 8,
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      alignSelf: "flex-start",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                    onPress={() => {
                      router.push({
                        pathname: "/dashboard/fullPlanDetails",
                        params: { id: service._id, type: "service" },
                      });
                    }}
                  >
                    <Text
                      style={{
                        color: buttonTextColor,
                        fontWeight: "700",
                        fontSize: 14,
                        fontFamily: theme.fonts.bold,
                      }}
                    >
                      {buttonText}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Right-side Image wrapped in container */}
                <View
                  style={{
                    width: 140,
                    height: "90%",

                    overflow: "hidden",
                    marginLeft: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Image
                    source={
                      imageUrl
                        ? { uri: imageUrl }
                        : require("../../../assets/images/track.png")
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "contain",
                      opacity: isActive ? 1 : 0.7,
                    }}
                  />
                </View>
              </LinearGradient>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default CurrentPlans;
