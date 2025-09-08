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
                borderRadius: 16,
                padding: 20,
                marginVertical: 12,
                height: 200,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 5,
                overflow: "hidden",
              }}
            >
              {/* Left Content */}
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    marginBottom: 12,
                    color: "white",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>

                <View style={{ marginBottom: 16 }}>
                  {descItems.length > 0 ? (
                    descItems.slice(0, 2).map((item, idx) => (
                      <View
                        key={idx}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "rgba(229, 210, 255, 1)",
                            marginRight: 10,
                          }}
                        />
                        <Text
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          style={{
                            fontSize: 13,
                            textAlign: "justify",
                            color: "white",
                            flexShrink: 1,
                            lineHeight: 16,
                          }}
                        >
                          {item}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text
                      style={{ fontSize: 13, color: "white", lineHeight: 16 }}
                    >
                      No description available.
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: "rgba(189, 255, 132, 1)",
                    paddingHorizontal: 20,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "flex-start",
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
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {buttonText}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right-side image */}
              <Image
                source={
                  imageUrl
                    ? { uri: imageUrl }
                    : require("../../../assets/images/track.png")
                }
                style={{
                  width: 120,
                  height: 160,
                  borderRadius: 12,
                  resizeMode: "cover",
                  opacity: isActive ? 1 : 0.6,
                  marginLeft: 12,
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
            const buttonBgColor = isActive ? "#C6FF69" : "#C6FF69";
            const buttonText = isActive ? "Continue" : "Check";
            const buttonTextColor = isActive ? "#000" : "#000";
            return (
              <LinearGradient
                key={service._id || index}
                colors={gradientColors}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  borderRadius: 16,
                  padding: 20,
                  marginVertical: 12,
                  height: 200,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                  elevation: 5,
                  overflow: "hidden",
                }}
              >
                {/* Left Content */}
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      marginBottom: 12,
                      color: "white",
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>

                  <View style={{ marginBottom: 16 }}>
                    {descItems.length > 0 ? (
                      descItems.slice(0, 2).map((item: string, idx: any) => (
                        <View
                          key={idx}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "rgba(229, 210, 255, 1)",
                              marginRight: 10,
                            }}
                          />
                          <Text
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            style={{
                              fontSize: 13,
                              textAlign: "justify",
                              color: "white",
                              flexShrink: 1,
                              lineHeight: 16,
                            }}
                          >
                            {item}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text
                        style={{ fontSize: 13, color: "white", lineHeight: 16 }}
                      >
                        No description available.
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "rgba(189, 255, 132, 1)",
                      paddingHorizontal: 20,
                      height: 36,
                      borderRadius: 18,
                      justifyContent: "center",
                      alignItems: "center",
                      alignSelf: "flex-start",
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
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      {buttonText}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Right-side image */}
                <Image
                  source={
                    imageUrl
                      ? { uri: imageUrl }
                      : require("../../../assets/images/track.png")
                  }
                  style={{
                    width: 120,
                    height: 160,
                    borderRadius: 12,
                    resizeMode: "cover",
                    opacity: isActive ? 1 : 0.6,
                    marginLeft: 12,
                  }}
                />
              </LinearGradient>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default CurrentPlans;
