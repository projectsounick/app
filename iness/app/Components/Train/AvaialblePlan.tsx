import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
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
    <View style={{ paddingVertical: 8 }}>
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
          Available Plans
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

      {/* Workout Plans by type */}
      {Object.entries(groupedPlans).map(
        ([typeTitle, planGroup], index: any) => (
          <View key={typeTitle} style={{ marginBottom: 24 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
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
                  name={icons[index % icons.length]}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View style={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#000",
                  flex: 1,
                }}
              >
                {typeTitle}
              </Text>
              <Text
              style={{
                fontSize: 13,
                color: "#666",
               
               
              }}
            >
              Tailored plans for your personalized lifestyles.
            </Text>
            </View>
            </View>

            {/* Description */}
           

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
              marginBottom: 24,
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
                name="food-apple"
                size={20}
                color="#FFFFFF"
              />
            </View>
            <View style={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#000",
                flex: 1,
              }}
            >
              Diet Plans
            </Text>
            <Text
            style={{
              fontSize: 13,
              color: "#666",
           
            }}
          >
            Curated meal plans to match your nutrition goals.
          </Text>
            </View>
        
          </View>

          {/* Description */}
         

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
    </View>
  );
}
