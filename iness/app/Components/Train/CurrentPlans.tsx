import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  StyleSheet,
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
  const allPlans: ActivePlans[] = useSelector((state: RootState) =>
    isActive ? state.plan.activePlans : state.plan.completedPlans
  );

  // Separate regular plans from diet plans
  const plans = allPlans.filter((plan) => !plan.dietPlanDetails);
  const dietPlans = allPlans.filter((plan) => plan.dietPlanDetails);

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
      {/* Plan Cards */}
      {plans.length > 0 && (
        <View style={styles.section}>
          {/* Section Header with Icon */}
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={22}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.sectionTitle}>Active Plans</Text>
            </View>
            <View style={styles.headerDash} />
          </View>

          {/* Description */}
          <Text style={styles.sectionDescription}>
            Your current workout plans.
          </Text>

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

      {/* Diet Plan Section */}
      {dietPlans.length > 0 && (
        <View style={styles.section}>
          {/* Section Header with Icon */}
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={22}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.sectionTitle}>Diet Plan</Text>
            </View>
            <View style={styles.headerDash} />
          </View>

          {/* Description */}
          <Text style={styles.sectionDescription}>
            Your active diet plan subscription.
          </Text>

          {/* Diet Plan Cards */}
          {dietPlans.map((plan, index) => {
            const title = plan.dietPlanDetails?.title || "Untitled Diet Plan";
            const imageUrl = plan.dietPlanDetails?.imgUrl;
            const descItems = plan.dietPlanDetails?.descItems || [];

            return (
              <View key={plan._id} style={{ marginBottom: 12 }}>
                <CurrentPlanCard
                  id={plan._id}
                  title={title}
                  descItems={descItems}
                  imgUrl={imageUrl}
                  isActive={isActive}
                  type="diet"
                  dietPlanDetails={plan.dietPlanDetails}
                  dietPlanUrl={plan.dietPlanUrl}
                  dietPlanAssignDate={plan.dietPlanAssignDate}
                />
              </View>
            );
          })}
        </View>
      )}

      {/* Empty State */}
      {plans.length === 0 && dietPlans.length === 0 && activeManualPlan === null && activeServices.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={32}
              color="#9747FF"
            />
          </View>
          <Text style={styles.emptyText}>
            No {isActive ? "active" : "completed"} plans found.
          </Text>
        </View>
      )}

      {isActive && activeManualPlan && (
        <View style={styles.section}>
          {/* Section Header with Icon */}
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="file-document-edit"
                  size={22}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.sectionTitle}>Manual Plan</Text>
            </View>
            <View style={styles.headerDash} />
          </View>

          {/* Description */}
          <Text style={styles.sectionDescription}>
            Your custom workout plan.
          </Text>

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
        <View style={styles.section}>
          {/* Section Header with Icon */}
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="briefcase-check"
                  size={22}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.sectionTitle}>Active Services</Text>
            </View>
            <View style={styles.headerDash} />
          </View>

          {/* Description */}
          <Text style={styles.sectionDescription}>
            Your active service subscriptions.
          </Text>

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
                  type="service"
                />
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerDash: {
    width: 30,
    height: 3,
    backgroundColor: "#9747FF",
    borderRadius: 2,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
    marginLeft: 46,
  },
  emptyState: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    fontSize: 14,
  },
});

export default CurrentPlans;
