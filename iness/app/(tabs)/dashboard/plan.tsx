import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import theme from "@/app/Theme/globalTheme";

import SmallHeader from "@/app/modules/SmallHeader";

import PlanCard from "@/app/modules/PlanCard";
import BackHeader from "@/app/modules/BackHeader";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function SliderCard() {
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <SmallHeader title="Plans" />
      <BackHeader />
      <ScrollView contentContainerStyle={{ paddingVertical: 2 }}>
        {Object.entries(groupedPlans).map(
          ([typeTitle, planGroup], index: any) => (
            <View
              key={typeTitle}
              style={{
                marginBottom: 24,
                marginHorizontal: 12,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
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
              <Text
                style={{
                  fontSize: theme.fontSizes.regularSmall,
                  color: theme.colors.medium,
                  marginBottom: 12,
                }}
              >
                Tailored plans for your personalized lifestyles.
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  justifyContent:
                    planGroup.length === 1 ? "center" : "flex-start",
                  paddingRight: 12,
                }}
              >
                {planGroup.map((item, index) => (
                  <PlanCard
                    key={index}
                    item={item}
                    index={index}
                    planGroupLength={planGroup.length}
                  />
                ))}
              </ScrollView>
            </View>
          )
        )}

        {/* 🥗 Diet Plans Section */}
        {dietPlans?.length > 0 && (
          <View
            style={{
              marginBottom: 24,
              marginHorizontal: 12,
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
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

            <Text
              style={{
                fontSize: theme.fontSizes.regularSmall,
                color: theme.colors.medium,
                marginBottom: 12,
              }}
            >
              Curated meal plans to match your nutrition goals.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                justifyContent:
                  dietPlans.length === 1 ? "center" : "flex-start",
                paddingRight: 12,
              }}
            >
              {dietPlans.map((item, index) => (
                <PlanCard
                  key={index}
                  item={item}
                  index={index}
                  planGroupLength={dietPlans.length}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
