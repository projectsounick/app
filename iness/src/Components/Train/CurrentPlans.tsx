import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ActivePlans } from "@/src/interfaces/planInterface";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActiveManualWorkoutPlanInterface } from "@/src/interfaces/activeManualPlan";
import CurrentPlanCard from "./CurrentPlanCard";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";

const manualPlanDayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

interface CurrentPlansProps {
  isActive: boolean;
}

function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

const CurrentPlans: React.FC<CurrentPlansProps> = ({ isActive }) => {
  const theme = useGlobalTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  // Single selector for active or completed plans based on isActive prop
  const allPlans: ActivePlans[] = useSelector((state: RootState) =>
    isActive ? state.plan.activePlans : state.plan.completedPlans
  );

  // Separate regular plans from diet plans
  const { plans, dietPlans } = useMemo(
    () => ({
      plans: allPlans.filter((plan) => !plan.dietPlanDetails),
      dietPlans: allPlans.filter((plan) => plan.dietPlanDetails),
    }),
    [allPlans]
  );

  const activeManualPlan: ActiveManualWorkoutPlanInterface | null = useSelector(
    (state: RootState) => (isActive ? state.plan.activeManualPlan : null)
  );
  const activeServices: any[] = useSelector((state: RootState) =>
    isActive ? state.plan.activeServices : []
  );
  const manualPlanSummary = useMemo(() => {
    const workoutPlan = activeManualPlan?.workoutPlanId;
    const workoutDays = workoutPlan
      ? manualPlanDayKeys.filter((day) => (workoutPlan[day] || []).length > 0)
          .length
      : 0;
    const exerciseCount = workoutPlan
      ? manualPlanDayKeys.reduce(
          (total, day) => total + (workoutPlan[day] || []).length,
          0
        )
      : 0;
    const goalsCount = workoutPlan?.goals?.length || 0;
    const notesCount = workoutPlan?.importantNotes?.length || 0;
    const weekendTipsCount = workoutPlan?.weekendRecommendations?.length || 0;

    return [
      formatCountLabel(workoutDays, "active day"),
      formatCountLabel(exerciseCount, "exercise"),
      goalsCount > 0 ? formatCountLabel(goalsCount, "goal") : null,
      goalsCount === 0 && notesCount > 0
        ? formatCountLabel(notesCount, "note")
        : null,
      goalsCount === 0 && notesCount === 0 && weekendTipsCount > 0
        ? formatCountLabel(weekendTipsCount, "weekend tip")
        : null,
    ]
      .filter(Boolean)
      .join(" • ");
  }, [activeManualPlan]);

  return (
    <View style={{ paddingBottom: 40, paddingVertical: 8 }}>
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
            descItems={manualPlanSummary ? [manualPlanSummary] : []}
            imgUrl={require("../../../assets/images/track.png")}
            isActive={isActive}
            type="manual"
            manualDescription={activeManualPlan.workoutPlanId?.description}
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
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
  },
  headerDash: {
    width: 30,
    height: 3,
    backgroundColor: theme.colors.secondPrimary,
    borderRadius: 2,
  },
  sectionDescription: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: "center",
    fontSize: theme.fontSizes.regularSmall,
  },
});

export default CurrentPlans;
