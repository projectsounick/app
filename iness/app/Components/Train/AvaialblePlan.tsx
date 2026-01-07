import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import PlanCard from "@/app/modules/PlanCard";
import SliderCard from "@/app/modules/SliderCard";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

export default function AvailablePlans() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const plans = useSelector((state: RootState) => state.plan.plans);
  const dietPlans = useSelector((state: RootState) => state.dietPlan.dietPlans);

  const groupedPlans: Record<string, typeof plans> = plans.reduce(
    (acc, plan) => {
      const type = plan.planType?.title || "Other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(plan);
      return acc;
    },
    {} as Record<string, typeof plans>
  );

  const icons: any = ["weight-lifter", "run", "heart-pulse", "yoga"];

  return (
    <View style={styles.container}>
      {/* Workout Plans by type */}
      {Object.entries(groupedPlans).map(([typeTitle, planGroup], index) => (
        <View key={typeTitle} style={styles.section}>
          {/* Section Header with Icon */}
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={icons[index % icons.length]}
                  size={22}
                  color={theme.colors.secondPrimary}
                />
              </View>
              <Text style={styles.sectionTitle}>{typeTitle}</Text>
            </View>
            <View style={styles.headerDash} />
          </View>

          {/* Description */}
          <Text style={styles.sectionDescription}>
            Tailored plans for your personalized lifestyles.
          </Text>

          {/* Horizontal scroll of plans */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              justifyContent: planGroup.length === 1 ? "center" : "flex-start",
              paddingRight: 12,
            }}
          >
            {planGroup.map((item, idx) => (
              <PlanCard
                key={idx}
                item={item}
                index={idx}
                planGroupLength={planGroup.length}
              />
            ))}
          </ScrollView>
        </View>
      ))}

      {/* Diet Plans */}
      {dietPlans?.length > 0 && (
        <View style={styles.section}>
          {/* Section Header with Icon */}
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={22}
                  color={theme.colors.secondPrimary}
                />
              </View>
              <Text style={styles.sectionTitle}>Diet Plans</Text>
            </View>
            <View style={styles.headerDash} />
          </View>

          {/* Description */}
          <Text style={styles.sectionDescription}>
            Curated meal plans to match your nutrition goals.
          </Text>

          {/* Horizontal scroll of diet plans */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              justifyContent: dietPlans.length === 1 ? "center" : "flex-start",
              paddingRight: 12,
            }}
          >
            {dietPlans.map((item, idx) => (
              <PlanCard
                key={idx}
                item={item}
                index={idx}
                planGroupLength={dietPlans.length}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Services */}
      <SliderCard />
    </View>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
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
    color: isDark ? theme.colors.textWhite : theme.colors.text,
    fontFamily: theme.fonts.bold,
    flex: 1,
    flexShrink: 1,
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
    marginTop: 2,
    fontFamily: theme.fonts.regular,
  },
});
