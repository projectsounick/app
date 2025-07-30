import React from "react";
import { View, Text, ScrollView, ImageBackground } from "react-native";
import SmallHeader from "@/app/modules/SmallHeader";
import { Ionicons } from "@expo/vector-icons";
import BackHeader from "@/app/modules/BackHeader";
import theme from "@/app/Theme/globalTheme";
import { useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";
import { RootState } from "@/store";
import { ActivePlans } from "@/app/interfaces/planInterface";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";

// Sample data
const completedPlan = {
  planStartDate: "2024-04-01",
  planEndDate: "2024-04-28",
  plan: {
    title: "Fat Loss Phase 1",
    descItems: ["Lose fat", "Improve stamina"],
    imgUrl: "https://via.placeholder.com/150",
    planType: "fat-loss",
    isActive: false,
    planItems: {
      _id: "planItem1",
      price: 999,
      isOnline: true,
      isCorporate: false,
      duration: 4,
      durationType: "week",
      sessionCount: 12,
      isActive: true,
    },
  },
  dietPlanDetails: {
    _id: "diet1",
    title: "Keto Diet Plan",
    descItems: ["Low carb", "High protein"],
    imgUrl: "https://via.placeholder.com/150",
    desc: "A structured 4-week keto diet for fat loss.",
    duration: 4,
    durationType: "week",
    price: 299,
    isActive: true,
    createdAt: new Date(),
  },
};

export default function CompletedPlan() {
  const { id } = useLocalSearchParams();
  const completedPlan: ActivePlans = useSelector((state: RootState) =>
    state.plan.completedPlans.find((p) => p._id === id)
  );

  if (!completedPlan) {
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          marginTop: 20,
        }}
      >
        <Text>Plan not found</Text>
      </View>
    );
  }

  const { plan, dietPlanDetails, planStartDate, planEndDate } = completedPlan;
  const planItems = plan?.planItem;
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SmallHeader title="Completed Plan" bottomComponent={false} />
        <BackHeader />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {plan && (
            <View
              style={{
                backgroundColor: theme.colors.cardLight,
                borderRadius: 16,
                padding: 18,
                marginBottom: 24,
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
              }}
            >
              {/* Plan Title */}
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: theme.colors.second,
                  marginBottom: 16,
                }}
              >
                {plan.title}
              </Text>

              {/* Row 1: Start and End Dates */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <Info
                  label="Start Date"
                  value={dayjs(planStartDate).format("DD MMM YYYY")}
                  icon="calendar-outline"
                />
                <Info
                  label="End Date"
                  value={dayjs(planEndDate).format("DD MMM YYYY")}
                  icon="calendar"
                />
              </View>

              {/* Row 2: Sessions and Price */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <Info
                  label="Total Sessions"
                  value={`${completedPlan.totalSessions || "NA"}`}
                  icon="repeat-outline"
                />

                <Info
                  label="Price"
                  value={`₹${plan?.planItem?.price || "NA"}`}
                  icon="cash-outline"
                />
              </View>
              <Info
                label="Sessions Remaing"
                value={`${completedPlan.remainingSessions || "NA"}`}
                icon="repeat-outline"
              />
              {/* Plan Highlights */}
              {plan.descItems?.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text
                    style={{ fontSize: 15, color: "#666", marginBottom: 6 }}
                  >
                    Plan Highlights
                  </Text>
                  <Text
                    style={{ fontSize: 16, fontWeight: "500", color: "#333" }}
                  >
                    {plan.descItems.join(" • ")}
                  </Text>
                </View>
              )}

              {/* Diet Plan Section */}
              {dietPlanDetails && (
                <View
                  style={{
                    backgroundColor: theme.colors.secondPrimary,
                    padding: 14,
                    borderRadius: 12,
                    marginTop: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#fff",
                      marginBottom: 12,
                    }}
                  >
                    Diet Plan: {dietPlanDetails.title}
                  </Text>

                  {/* Diet Info Row */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Info
                      label="Duration"
                      value={`${dietPlanDetails.duration} ${dietPlanDetails.durationType}`}
                      icon="time-outline"
                      labelColor="#eee"
                      valueColor="#fff"
                      iconColor="#fff"
                    />
                    <Info
                      label="Price"
                      value={`₹${dietPlanDetails.price}`}
                      icon="cash-outline"
                      labelColor="#eee"
                      valueColor="#fff"
                      iconColor="#fff"
                    />
                  </View>

                  {/* Diet Highlights */}
                  {dietPlanDetails.descItems?.length > 0 && (
                    <View style={{ marginTop: 6 }}>
                      <Text
                        style={{ fontSize: 14, color: "#ddd", marginBottom: 4 }}
                      >
                        Diet Highlights
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "500",
                          color: "#fff",
                        }}
                      >
                        {dietPlanDetails.descItems.join(" • ")}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

type InfoProps = {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  labelColor?: string;
  valueColor?: string;
  iconColor?: string;
};

export function Info({
  label,
  value,
  icon,
  labelColor = "#777",
  valueColor = "#222",
  iconColor = "#777",
}: InfoProps) {
  return (
    <View style={{ width: "48%" }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={14}
            color={iconColor}
            style={{ marginRight: 4 }}
          />
        )}
        <Text style={{ fontSize: 13, color: labelColor }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 15, fontWeight: "600", color: valueColor }}>
        {value}
      </Text>
    </View>
  );
}
