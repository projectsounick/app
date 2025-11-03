import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { RootState } from "@/store";
import { ActivePlans } from "@/app/interfaces/planInterface";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActiveManualWorkoutPlanInterface } from "@/app/interfaces/activeManualPlan";
import theme from "@/app/Theme/globalTheme";
import CurrentPlanCard from "./CurrentPlanCard";

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

          return (
            <CurrentPlanCard
              id={plan._id}
              title={title}
              descItems={descItems}
              imgUrl={imageUrl}
              isActive={isActive}
              type="plan"
            />
          );
        })
      )}
      {isActive && activeManualPlan && (
        <View style={{ marginBottom: 16 }}>
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
                Manual Plan
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

          {/* Manual Plan Card */}
          <CurrentPlanCard
            title={activeManualPlan.workoutPlanId?.planName}
            descItems={[
              activeManualPlan.workoutPlanId?.description || "No description",
            ]}
            imgUrl={require("../../../assets/images/track.png")}
            isActive={isActive}
            type="manual"
          />
        </View>
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

            return (
              <CurrentPlanCard
                id={service._id}
                title={title}
                descItems={descItems}
                imgUrl={imageUrl}
                isActive={isActive}
                type="plan"
              />
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default CurrentPlans;
