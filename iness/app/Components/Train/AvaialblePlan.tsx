import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import theme from "@/app/Theme/globalTheme";
import PlanCard from "@/app/modules/PlanCard";
import SliderCard from "@/app/modules/SliderCard";

export default function AvailablePlans() {
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

  const icons: any = ["food-apple", "weight-lifter", "run", "heart-pulse"];

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
      {/* Workout Plans by type */}
      {Object.entries(groupedPlans).map(
        ([typeTitle, planGroup], index: any) => (
          <View key={typeTitle} style={{ marginBottom: 24 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <MaterialCommunityIcons
                name={icons[index % icons.length]}
                size={20}
                color={theme.colors.dark}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: theme.fontSizes.medium,
                  fontWeight: "bold",
                  color: theme.colors.dark,
                }}
              >
                {typeTitle}
              </Text>
            </View>

            {/* Description */}
            <Text
              style={{
                fontSize: theme.fontSizes.regularSmall,
                color: theme.colors.medium,
                marginBottom: 10,
              }}
            >
              Tailored plans for your personalized lifestyles.
            </Text>

            {/* Horizontal scroll of plans */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                justifyContent:
                  planGroup.length === 1 ? "center" : "flex-start",
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
        )
      )}

      {/* 🥗 Diet Plans */}
      {dietPlans?.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <MaterialCommunityIcons
              name="food-apple"
              size={20}
              color={theme.colors.dark}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: theme.fontSizes.medium,
                fontWeight: "bold",
                color: theme.colors.dark,
              }}
            >
              Diet Plans
            </Text>
          </View>

          {/* Description */}
          <Text
            style={{
              fontSize: theme.fontSizes.regularSmall,
              color: theme.colors.medium,
              marginBottom: 10,
            }}
          >
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
      {/* ///// Card for the services ------------------------------------/ */}
      <SliderCard />
    </ScrollView>
  );
}
