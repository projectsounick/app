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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActiveManualWorkoutPlanInterface } from "@/app/interfaces/activeManualPlan";
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
      contentContainerStyle={{ paddingBottom: 40, paddingVertical: 8 }}
    >
      {/* Main Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#000",
            letterSpacing: -0.5,
          }}
        >
          Current Plans
        </Text>
        <View
          style={{
            width: 40,
            height: 3,
            backgroundColor: "#9747FF",
            borderRadius: 2,
          }}
        />
      </View>

      {/* Plan Cards */}
      {plans.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#9747FF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <MaterialCommunityIcons
                name="dumbbell"
                size={20}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 2,
                }}
              >
                Active Plans
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#666",
                }}
              >
                Your current workout and diet plans.
              </Text>
            </View>
          </View>

          {/* Plan Cards */}
          {plans.map((plan, index) => {
            const title =
              plan.plan?.title || plan.dietPlanDetails?.title || "Untitled Plan";
            const imageUrl = plan.plan?.imgUrl || plan.dietPlanDetails?.imgUrl;
            const descItems =
              plan.plan?.descItems || plan.dietPlanDetails?.descItems || [];

            return (
              <View key={plan._id} style={{ marginBottom: 12 }}>
                <CurrentPlanCard
                  id={plan._id}
                  title={title}
                  descItems={descItems}
                  imgUrl={imageUrl}
                  isActive={isActive}
                  type="plan"
                />
              </View>
            );
          })}
        </View>
      )}

      {/* Empty State */}
      {plans.length === 0 && activeManualPlan === null && activeServices.length === 0 && (
        <View style={{ marginTop: 24, alignItems: "center" }}>
          <Text style={{ color: "#666", textAlign: "center", fontSize: 14 }}>
            No {isActive ? "active" : "completed"} plans found.
          </Text>
        </View>
      )}
      {isActive && activeManualPlan && (
        <View style={{ marginBottom: 24 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#9747FF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <MaterialCommunityIcons
                name="file-document-edit"
                size={20}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 2,
                }}
              >
                Manual Plan
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#666",
                }}
              >
                Your custom workout plan.
              </Text>
            </View>
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
        <View style={{ marginBottom: 24 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#9747FF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <MaterialCommunityIcons
                name="briefcase-check"
                size={20}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 2,
                }}
              >
                Active Services
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#666",
                }}
              >
                Your active service subscriptions.
              </Text>
            </View>
          </View>

          {/* Service Cards */}
          {activeServices.map((service, index) => {
            const title = service.serviceDetails?.title || "Untitled Service";
            const imageUrl = service.serviceDetails?.imgUrl;
            const descItems = service.serviceDetails?.descItems || [];

            return (
              <View key={service._id} style={{ marginBottom: 12 }}>
                <CurrentPlanCard
                  id={service._id}
                  title={title}
                  descItems={descItems}
                  imgUrl={imageUrl}
                  isActive={isActive}
                  type="plan"
                />
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default CurrentPlans;
